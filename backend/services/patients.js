import { Patient, Doctor, Appointment, User } from "../models/index.js";
import { AppError, notFound, forbidden } from "../lib/errors.js";

export const patientShape = (p) => ({
  id: String(p._id), mrn: p.mrn, name: p.user?.name, email: p.user?.email, phone: p.user?.phone,
  dob: p.dob, gender: p.gender, bloodGroup: p.bloodGroup, address: p.address, emergencyContact: p.emergencyContact || {}, createdAt: p.createdAt,
});

/** Resolve "me" or an id to a Patient and verify the actor is allowed to see demographics. */
export async function resolvePatient(actor, idParam, { clinical = false } = {}) {
  let patient;
  if (idParam === "me") {
    if (actor.role !== "patient") throw forbidden();
    patient = await Patient.findOne({ user: actor.id }).populate("user", "name email phone");
  } else {
    patient = await Patient.findById(idParam).populate("user", "name email phone");
    if (patient) {
      if (actor.role === "patient" && String(patient.user._id) !== actor.id) throw forbidden();
      if (actor.role === "doctor") await assertDoctorRelationship(actor.id, patient._id);
      if (clinical && ["receptionist", "admin"].includes(actor.role)) throw forbidden("Clinical records are restricted to the patient and their treating doctors.");
    }
  }
  if (!patient) throw notFound("Patient");
  return patient;
}

export async function assertDoctorRelationship(userId, patientId) {
  const doctor = await Doctor.findOne({ user: userId, "verification.status": "approved" }).select("_id");
  if (!doctor) throw forbidden("Only verified doctors can access patient information.");
  const has = await Appointment.exists({ doctor: doctor._id, patient: patientId, status: { $in: ["booked", "checked_in", "completed"] } });
  if (!has) throw forbidden("You can only access patients you have an appointment with.");
  return doctor;
}

export async function searchPatients({ actor, q = "", limit = 25 }) {
  let ids = null;
  if (actor.role === "doctor") {
    const doctor = await Doctor.findOne({ user: actor.id, "verification.status": "approved" }).select("_id");
    if (!doctor) return [];
    ids = await Appointment.distinct("patient", { doctor: doctor._id, status: { $in: ["booked", "checked_in", "completed"] } });
  }
  const needle = q.trim().toLowerCase();
  const filter = ids ? { _id: { $in: ids } } : {};
  let patients = await Patient.find(filter).populate("user", "name email phone").sort({ createdAt: -1 }).limit(needle ? 500 : limit).lean();
  if (needle) patients = patients.filter((p) => p.user && (p.user.name.toLowerCase().includes(needle) || p.mrn.toLowerCase().includes(needle) || p.user.email.includes(needle) || (p.user.phone || "").includes(needle))).slice(0, limit);
  return patients.filter((p) => p.user).map(patientShape);
}

export async function updatePatientProfile(patient, patch) {
  const { name, phone, ...rest } = patch;
  if (name !== undefined || phone !== undefined) await User.updateOne({ _id: patient.user._id }, { ...(name !== undefined && { name }), ...(phone !== undefined && { phone }) });
  Object.assign(patient, rest);
  await patient.save();
}
