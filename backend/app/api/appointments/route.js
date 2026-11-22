import { route, body } from "@/lib/api.js";
import { bookSchema } from "@/lib/validators.js";
import { AppError } from "@/lib/errors.js";
import { Patient } from "@/models/index.js";
import { bookAppointment, listAppointments } from "@/services/appointments.js";
export const GET = route(async ({ req, user }) => {
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  return { appointments: await listAppointments({ actor: user, ...sp }) };
}, { roles: ["patient", "doctor", "receptionist", "admin"] });
export const POST = route(async ({ req, user }) => {
  const data = await body(req, bookSchema);
  let patientId = data.patientId;
  if (user.role === "patient") { // a patient can only ever book for themselves
    const p = await Patient.findOne({ user: user.id }).select("_id");
    if (!p) throw new AppError(404, "Patient profile not found", "NOT_FOUND");
    patientId = String(p._id);
  } else if (!patientId) throw new AppError(422, "Select a patient first.", "VALIDATION");
  const appt = await bookAppointment({ actor: user, patientId, doctorId: data.doctorId, date: data.date, time: data.time, reason: data.reason });
  return { id: String(appt._id), date: appt.date, time: appt.time, status: appt.status };
}, { roles: ["patient", "receptionist", "admin"], limit: { limit: 20, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
