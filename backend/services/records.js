import { MedicalRecord, Prescription, Doctor, UploadedDocument, Appointment } from "../models/index.js";
import { AppError, forbidden } from "../lib/errors.js";
import { decideRecordAccess, canWriteRecordType } from "../lib/policy.js";
import { assertDoctorRelationship } from "./patients.js";
import { audit } from "./audit.js";

async function assertAppointmentLink(appointmentId, patientId, doctorId) {
  if (!appointmentId) return;
  const ok = await Appointment.exists({ _id: appointmentId, patient: patientId, ...(doctorId && { doctor: doctorId }) });
  if (!ok) throw new AppError(422, "That appointment does not belong to this patient.", "BAD_APPOINTMENT");
}

/** Throws unless the actor may read clinical data for this patient. Receptionists/admins are always refused. */
export async function assertRecordAccess(actor, patient) {
  const isOwner = actor.role === "patient" && String(patient.user._id || patient.user) === actor.id;
  let doctorApproved = false, hasRelationship = false;
  if (actor.role === "doctor") { try { await assertDoctorRelationship(actor.id, patient._id); doctorApproved = hasRelationship = true; } catch { /* denied */ } }
  if (!decideRecordAccess({ role: actor.role, isOwner, doctorApproved, hasRelationship })) throw forbidden("You are not authorized to view these medical records.");
}

export async function listRecords({ actor, patient, ip }) {
  await assertRecordAccess(actor, patient);
  const [records, prescriptions] = await Promise.all([
    MedicalRecord.find({ patient: patient._id }).sort({ createdAt: -1 }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } }).populate("document", "filename mime size").lean(),
    Prescription.find({ patient: patient._id }).sort({ createdAt: -1 }).populate({ path: "doctor", select: "user specialization", populate: { path: "user", select: "name" } }).lean(),
  ]);
  if (actor.role === "doctor") await audit({ actor, action: "record.read", resource: "patient", resourceId: patient._id, ip });
  return { records, prescriptions };
}

export async function addRecord({ actor, patient, data, ip }) {
  const isOwner = actor.role === "patient" && String(patient.user._id || patient.user) === actor.id;
  if (!canWriteRecordType({ role: actor.role, type: data.type, isOwner })) throw forbidden("You cannot add this kind of record.");
  await assertRecordAccess(actor, patient);
  let doctorId;
  if (actor.role === "doctor") doctorId = (await Doctor.findOne({ user: actor.id }).select("_id"))._id;
  await assertAppointmentLink(data.appointmentId, patient._id, doctorId);
  if (data.documentId) {
    const doc = await UploadedDocument.findOne({ _id: data.documentId, kind: "medical_report", patient: patient._id }).select("_id");
    if (!doc) throw new AppError(422, "Attached document not found.", "BAD_DOCUMENT");
  }
  const rec = await MedicalRecord.create({ patient: patient._id, doctor: doctorId, appointment: data.appointmentId, type: data.type, title: data.title, content: data.content, severity: data.severity, document: data.documentId, createdBy: actor.id, createdByRole: actor.role });
  await audit({ actor, action: "record.create", resource: "patient", resourceId: patient._id, meta: { type: data.type }, ip });
  return rec;
}

export async function addPrescription({ actor, patient, data, ip }) {
  if (actor.role !== "doctor") throw forbidden("Only doctors can issue prescriptions.");
  await assertRecordAccess(actor, patient);
  const doctor = await Doctor.findOne({ user: actor.id }).select("_id");
  await assertAppointmentLink(data.appointmentId, patient._id, doctor._id);
  const rx = await Prescription.create({ patient: patient._id, doctor: doctor._id, appointment: data.appointmentId, items: data.items, notes: data.notes });
  await audit({ actor, action: "prescription.create", resource: "patient", resourceId: patient._id, ip });
  return rx;
}
