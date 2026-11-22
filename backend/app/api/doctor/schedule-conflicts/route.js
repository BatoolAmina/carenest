import { route } from "@/lib/api.js";
import { Doctor } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
import { cancelScheduleConflicts, findScheduleConflicts } from "@/services/appointments.js";
import { audit } from "@/services/audit.js";
const mine = async (user) => { const d = await Doctor.findOne({ user: user.id }).select("_id"); if (!d) throw notFound("Doctor profile"); return d; };
export const GET = route(async ({ user }) => ({ conflicts: (await findScheduleConflicts((await mine(user))._id)).map((a) => ({ id: String(a._id), date: a.date, time: a.time, patient: a.patient?.user?.name })) }), { roles: ["doctor"] });
// Cancels every booked appointment that no longer fits the schedule and notifies each patient.
export const POST = route(async ({ user, ip }) => {
  const cancelled = await cancelScheduleConflicts((await mine(user))._id);
  await audit({ actor: user, action: "doctor.cancel_conflicts", resource: "doctor", meta: { cancelled }, ip });
  return { cancelled };
}, { roles: ["doctor"] });
export const dynamic = "force-dynamic";
