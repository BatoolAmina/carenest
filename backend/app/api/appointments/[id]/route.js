import { route, body, assertId } from "@/lib/api.js";
import { appointmentActionSchema } from "@/lib/validators.js";
import { updateAppointment } from "@/services/appointments.js";
import { audit } from "@/services/audit.js";
export const PATCH = route(async ({ req, params, user, ip }) => {
  const input = await body(req, appointmentActionSchema);
  const a = await updateAppointment({ actor: user, id: assertId(params.id, "Appointment"), ...input });
  await audit({ actor: user, action: `appointment.${input.action}`, resource: "appointment", resourceId: params.id, ip });
  return { ok: true, status: a.status, date: a.date, time: a.time };
}, { roles: ["patient", "doctor", "receptionist", "admin"] });

export const dynamic = "force-dynamic";
