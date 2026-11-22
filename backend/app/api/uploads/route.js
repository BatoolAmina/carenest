import { route } from "@/lib/api.js";
import { AppError } from "@/lib/errors.js";
import { MAX_UPLOAD_BYTES, detectFileType, sanitizeFilename } from "@/lib/files.js";
import { Doctor, Patient, UploadedDocument, User } from "@/models/index.js";
import { audit } from "@/services/audit.js";

export const POST = route(async ({ req, user, ip }) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new AppError(422, "Choose a file to upload.", "VALIDATION");
  if (file.size > MAX_UPLOAD_BYTES) throw new AppError(413, "Files must be 5 MB or smaller.", "TOO_LARGE");
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(buf);   // verify real content, not the client-declared type
  if (!type) throw new AppError(415, "Only PDF, PNG, JPG and WebP files are accepted.", "BAD_TYPE");
  const label = String(form.get("label") || "").slice(0, 80);
  const base = { owner: user.id, label, filename: sanitizeFilename(file.name), mime: type.mime, size: buf.length, data: buf };
  let doc;
  if (user.role === "doctor") {
    const [doctor, u] = await Promise.all([Doctor.findOne({ user: user.id }), User.findById(user.id).select("emailVerified")]);
    if (!doctor) throw new AppError(404, "Doctor profile not found.", "NOT_FOUND");
    if (!u.emailVerified) throw new AppError(409, "Verify your hospital e-mail before uploading documents.", "EMAIL_UNVERIFIED");
    if (!["documents_pending", "changes_requested"].includes(doctor.verification.status)) throw new AppError(409, "Documents can only be changed before submission or when corrections are requested.", "LOCKED");
    if ((await UploadedDocument.countDocuments({ doctor: doctor._id })) >= 10) throw new AppError(409, "You can upload up to 10 documents.", "LIMIT");
    doc = await UploadedDocument.create({ ...base, kind: "doctor_credential", doctor: doctor._id });
  } else {
    const patient = await Patient.findOne({ user: user.id }).select("_id");
    if (!patient) throw new AppError(404, "Patient profile not found.", "NOT_FOUND");
    if ((await UploadedDocument.countDocuments({ owner: user.id, kind: "medical_report" })) >= 50) throw new AppError(409, "Upload limit reached.", "LIMIT");
    doc = await UploadedDocument.create({ ...base, kind: "medical_report", patient: patient._id });
  }
  await audit({ actor: user, action: "document.upload", resource: "document", resourceId: doc._id, ip });
  return { id: String(doc._id), filename: doc.filename, mime: doc.mime, size: doc.size };
}, { roles: ["doctor", "patient"], limit: { limit: 20, windowMs: 3600_000 } });

export const dynamic = "force-dynamic";
