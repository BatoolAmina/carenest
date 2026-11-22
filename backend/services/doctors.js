import { Doctor, User, Department, DoctorAvailability, UploadedDocument, Review } from "../models/index.js";
import { AppError, notFound } from "../lib/errors.js";
import { canDoctorSubmit, canAdminReview } from "../lib/policy.js";
import { notifyUser, notifyAdmins } from "./notifications.js";
import { cancelUpcomingForDoctor } from "./appointments.js";

const publicShape = (d) => ({
  id: String(d._id), name: d.user?.name, image: d.user?.image || "", specialization: d.specialization,
  department: d.department ? { id: String(d.department._id), name: d.department.name, slug: d.department.slug } : null,
  experienceYears: d.experienceYears, consultationFee: d.consultationFee, bio: d.bio, languages: d.languages || [],
  qualifications: d.qualifications || [], ratingAvg: d.ratingAvg, ratingCount: d.ratingCount, verified: true,
});

/** Public listing: ONLY fully approved doctors with active accounts. */
export async function listPublicDoctors({ department, q, limit = 60 } = {}) {
  const filter = { "verification.status": "approved" };
  if (department) filter.department = department;
  let docs = await Doctor.find(filter).populate({ path: "user", select: "name image status", match: { status: "active" } }).populate("department", "name slug").sort({ ratingAvg: -1, experienceYears: -1 }).limit(limit).lean();
  docs = docs.filter((d) => d.user);
  if (q) { const n = q.toLowerCase(); docs = docs.filter((d) => d.user.name.toLowerCase().includes(n) || d.specialization.toLowerCase().includes(n)); }
  return docs.map(publicShape);
}
export async function getPublicDoctor(id) {
  const d = await Doctor.findOne({ _id: id, "verification.status": "approved" }).populate({ path: "user", select: "name image status", match: { status: "active" } }).populate("department", "name slug").lean();
  if (!d || !d.user) throw notFound("Doctor");
  const reviews = await Review.find({ doctor: d._id, status: "visible" }).sort({ createdAt: -1 }).limit(10).populate({ path: "patient", select: "user", populate: { path: "user", select: "name" } }).lean();
  return { doctor: publicShape(d), reviews: reviews.map((r) => ({ id: String(r._id), rating: r.rating, comment: r.comment, author: (r.patient?.user?.name || "Patient").split(" ")[0], createdAt: r.createdAt })) };
}

export async function getOwnDoctor(userId) {
  const doctor = await Doctor.findOne({ user: userId }).populate("department", "name").lean();
  if (!doctor) throw notFound("Doctor profile");
  const user = await User.findById(userId).select("name email phone image emailVerified").lean();
  const documents = await UploadedDocument.find({ doctor: doctor._id, kind: "doctor_credential" }).select("label filename mime size createdAt").lean();
  return { doctor, user, documents };
}

function setVerification(doctor, patch) { for (const [k, v] of Object.entries(patch)) doctor.set(`verification.${k}`, v); }

const SENSITIVE = ["registrationNumber", "registrationCouncil", "qualifications", "departmentId", "hospitalAffiliation"];
export async function updateOwnProfile(userId, patch) {
  const doctor = await Doctor.findOne({ user: userId });
  if (!doctor) throw notFound("Doctor profile");
  const status = doctor.verification.status;
  const touchesSensitive = SENSITIVE.some((k) => patch[k] !== undefined);
  if (touchesSensitive && !["documents_pending", "changes_requested", "email_unverified"].includes(status))
    throw new AppError(409, "Credentials are locked while under review or after approval. Contact administration to change them.", "LOCKED");
  const { departmentId, ...rest } = patch;
  if (departmentId) { if (!(await Department.exists({ _id: departmentId, active: true }))) throw new AppError(422, "Select a valid department.", "BAD_DEPARTMENT"); doctor.department = departmentId; }
  Object.assign(doctor, rest);
  await doctor.save();
  return doctor;
}

export async function submitForReview(userId) {
  const doctor = await Doctor.findOne({ user: userId });
  const user = await User.findById(userId).select("name emailVerified");
  if (!doctor) throw notFound("Doctor profile");
  if (!user.emailVerified) throw new AppError(409, "Verify your hospital e-mail first.", "EMAIL_UNVERIFIED");
  if (!canDoctorSubmit(doctor.verification.status)) throw new AppError(409, "Your application cannot be submitted in its current state.", "INVALID_STATE");
  const docs = await UploadedDocument.countDocuments({ doctor: doctor._id, kind: "doctor_credential" });
  const missing = [];
  if (!doctor.qualifications?.length) missing.push("at least one qualification");
  if (!doctor.registrationNumber || !doctor.registrationCouncil) missing.push("professional registration details");
  if (!docs) missing.push("at least one credential document");
  if (missing.length) throw new AppError(422, `Before submitting, add: ${missing.join(", ")}.`, "INCOMPLETE");
  setVerification(doctor, { status: "under_review", submittedAt: new Date(), note: "", requestedDocs: [] });
  await doctor.save();
  await notifyAdmins({ type: "verification", title: "Doctor application awaiting review", body: `Dr. ${user.name} submitted credentials for verification.`, link: "/admin/doctors" });
  return doctor;
}

export async function reviewDoctor({ actor, doctorId, action, note, requestedDocs }) {
  const doctor = await Doctor.findById(doctorId).populate("user", "name emailVerified");
  if (!doctor) throw notFound("Doctor");
  const status = doctor.verification.status;
  if (!canAdminReview(status, action)) throw new AppError(409, `That decision isn’t available while the application is "${status.replace("_", " ")}".`, "INVALID_STATE");
  if (action === "approve" && !doctor.user.emailVerified) throw new AppError(409, "The doctor has not verified their hospital e-mail.", "EMAIL_UNVERIFIED");
  const next = { approve: "approved", reject: "rejected", request_changes: "changes_requested" }[action];
  setVerification(doctor, { status: next, reviewedAt: new Date(), reviewedBy: actor.id, note: note || "", requestedDocs: action === "request_changes" ? requestedDocs : [] });
  await doctor.save();
  if (status === "approved" && next !== "approved") await cancelUpcomingForDoctor(doctor._id, "the doctor is no longer available at CareNest"); // revoked: free & notify patients
  const copy = {
    approve: ["Your CareNest application is approved", "Congratulations! You are now verified and visible to patients. You can accept appointments."],
    reject: ["Your CareNest application was not approved", `Your application was not approved. ${note}`],
    request_changes: ["Action needed on your CareNest application", `Administration requested corrections. ${note}${requestedDocs?.length ? ` Requested: ${requestedDocs.join(", ")}.` : ""}`],
  }[action];
  await notifyUser(doctor.user._id, { type: "verification", title: copy[0], body: copy[1], link: "/doctor/profile" });
  return doctor;
}

export async function getAvailability(doctorId) { return DoctorAvailability.findOne({ doctor: doctorId }).lean(); }
