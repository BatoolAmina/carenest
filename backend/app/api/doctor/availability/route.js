import { route, body } from "@/lib/api.js";
import { availabilitySchema } from "@/lib/validators.js";
import { Doctor, DoctorAvailability } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
import { defaultWeekly } from "@/services/accounts.js";
import { findScheduleConflicts } from "@/services/appointments.js";
import { notifyRoles } from "@/services/notifications.js";
const mine = async (user) => { const d = await Doctor.findOne({ user: user.id }).select("_id verification.status"); if (!d) throw notFound("Doctor profile"); return d; };
export const GET = route(async ({ user }) => {
  const d = await mine(user);
  const a = await DoctorAvailability.findOne({ doctor: d._id }).lean();
  return { availability: a || { slotMinutes: 30, weekly: defaultWeekly(), daysOff: [] } };
}, { roles: ["doctor"] });
export const PUT = route(async ({ req, user }) => {
  const d = await mine(user);
  const data = await body(req, availabilitySchema);
  await DoctorAvailability.findOneAndUpdate({ doctor: d._id }, data, { upsert: true, new: true });
  // Existing bookings are never silently changed: report any that now fall outside the schedule so the doctor can resolve them.
  const conflicts = await findScheduleConflicts(d._id);
  if (conflicts.length) await notifyRoles(["admin", "receptionist"], { type: "schedule", title: "Doctor schedule change affects bookings", body: `${conflicts.length} booked appointment(s) now fall outside a doctor’s updated schedule.`, link: "/admin/appointments" });
  return { ok: true, conflicts: conflicts.map((a) => ({ id: String(a._id), date: a.date, time: a.time, patient: a.patient?.user?.name })) };
}, { roles: ["doctor"] });

export const dynamic = "force-dynamic";
