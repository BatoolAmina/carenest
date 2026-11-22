import { route } from "@/lib/api.js";
import { Appointment, MedicalRecord, Patient, Prescription, User } from "@/models/index.js";
import { audit } from "@/services/audit.js";
// Lets a patient download everything CareNest holds about them (data-portability / right of access).
export const GET = route(async ({ user, ip }) => {
  const patient = await Patient.findOne({ user: user.id }).lean();
  const [account, appointments, records, prescriptions] = await Promise.all([
    User.findById(user.id).select("name email phone createdAt").lean(),
    Appointment.find({ patient: patient._id }).select("-slotKey -patientSlotKey").lean(),
    MedicalRecord.find({ patient: patient._id }).select("-createdBy").lean(), Prescription.find({ patient: patient._id }).lean(),
  ]);
  await audit({ actor: user, action: "patient.export", resource: "patient", resourceId: patient._id, ip });
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), account, profile: patient, appointments, records, prescriptions }, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="carenest-my-data.json"', "Cache-Control": "no-store" } });
}, { roles: ["patient"], limit: { limit: 5, windowMs: 3600_000 } });
export const dynamic = "force-dynamic";
