import { Appointment, Counter, Doctor, DoctorAvailability, Patient } from "../models/index.js";
import { AppError, notFound, forbidden } from "../lib/errors.js";
import { generateSlots, isPastSlot, minutesUntil, nowInTz, addDays, HOSPITAL_TZ } from "../lib/time.js";
import { canAppointmentAction, roleMayAction } from "../lib/policy.js";
import { notifyUser } from "./notifications.js";

const slotKey = (doctor, date, time) => `${doctor}_${date}_${time}`;
const patientSlotKey = (patient, date, time) => `${patient}_${date}_${time}`;
const SLOT_TAKEN = () => new AppError(409, "That time slot is no longer available. Please choose another.", "SLOT_TAKEN");
const clashError = (e) => String(e.keyPattern ? Object.keys(e.keyPattern) : e.message).includes("patientSlotKey")
  ? new AppError(409, "This patient already has an appointment at that time.", "PATIENT_CLASH") : SLOT_TAKEN();

/** A doctor can only be booked when fully approved (verification stage 2) and the account is active. */
export async function getBookableDoctor(doctorId) {
  const doctor = await Doctor.findOne({ _id: doctorId, "verification.status": "approved" }).populate("user", "name status");
  if (!doctor || doctor.user?.status !== "active") throw new AppError(404, "This doctor is not available for appointments.", "DOCTOR_UNAVAILABLE");
  return doctor;
}

async function validSlotOrThrow(doctor, date, time) {
  const avail = await DoctorAvailability.findOne({ doctor: doctor._id }).lean();
  if (!avail) throw new AppError(400, "This doctor has no published schedule.", "NO_SCHEDULE");
  const today = nowInTz().date;
  if (date > addDays(today, avail.maxAdvanceDays || 60)) throw new AppError(400, `Appointments can be booked up to ${avail.maxAdvanceDays || 60} days ahead.`, "TOO_FAR");
  const slot = generateSlots({ weekly: avail.weekly, slotMinutes: avail.slotMinutes, daysOff: avail.daysOff, date }).find((s) => s.time === time);
  if (!slot) throw new AppError(400, "That is not an available time for this doctor.", "INVALID_SLOT");
  if (isPastSlot(date, time, HOSPITAL_TZ)) throw new AppError(400, "That time has already passed.", "PAST_SLOT");
  return slot;
}

export async function getAvailableSlots(doctorId, date) {
  const doctor = await getBookableDoctor(doctorId);
  const avail = await DoctorAvailability.findOne({ doctor: doctor._id }).lean();
  if (!avail) return [];
  const today = nowInTz().date;
  if (date < today || date > addDays(today, avail.maxAdvanceDays || 60)) return [];
  const all = generateSlots({ weekly: avail.weekly, slotMinutes: avail.slotMinutes, daysOff: avail.daysOff, date });
  const taken = new Set((await Appointment.find({ doctor: doctor._id, date, slotKey: { $type: "string" } }).select("time").lean()).map((a) => a.time));
  return all.filter((s) => !taken.has(s.time) && !isPastSlot(date, s.time, HOSPITAL_TZ));
}

export async function bookAppointment({ actor, patientId, doctorId, date, time, reason }) {
  const doctor = await getBookableDoctor(doctorId);
  const patient = await Patient.findById(patientId);
  if (!patient) throw notFound("Patient");
  const slot = await validSlotOrThrow(doctor, date, time);
  let appt;
  try {
    // The unique partial indexes on slotKey / patientSlotKey are the real guard against double booking.
    appt = await Appointment.create({
      patient: patient._id, doctor: doctor._id, department: doctor.department, date, time, endTime: slot.endTime, reason,
      status: "booked", slotKey: slotKey(doctor._id, date, time), patientSlotKey: patientSlotKey(patient._id, date, time),
      bookedBy: actor.id, bookedByRole: actor.role,
    });
  } catch (e) {
    if (e.code === 11000) throw clashError(e);
    throw e;
  }
  const when = `${date} at ${time}`;
  await Promise.all([
    notifyUser(patient.user, { type: "appointment", title: "Appointment confirmed", body: `Your appointment with Dr. ${doctor.user.name} is confirmed for ${when}.`, link: "/patient/appointments" }),
    notifyUser(doctor.user._id, { type: "appointment", title: "New appointment", body: `A new appointment was booked for ${when}.`, link: "/doctor/appointments", email: false }),
  ]);
  return appt;
}

async function loadForAction(id) {
  const appt = await Appointment.findById(id).populate({ path: "patient", select: "user" }).populate({ path: "doctor", select: "user" });
  if (!appt) throw notFound("Appointment");
  return appt;
}

export async function updateAppointment({ actor, id, action, date, time, reason }) {
  const appt = await loadForAction(id);
  const isOwner = actor.role === "patient" ? String(appt.patient.user) === actor.id : actor.role === "doctor" ? String(appt.doctor.user) === actor.id : false;
  if (!roleMayAction(actor.role, action)) throw forbidden();                       // wrong role for this action -> 403
  if ((actor.role === "patient" || actor.role === "doctor") && !isOwner) throw forbidden(); // not your appointment -> 403
  if (!canAppointmentAction({ role: actor.role, isOwner, action, status: appt.status }))
    throw new AppError(409, `This appointment cannot be ${action.replace("_", " ")} in its current state.`, "INVALID_TRANSITION");
  const today = nowInTz();
  const base = { _id: appt._id, status: appt.status };   // optimistic guard: only transition from the state we validated

  if (action === "cancel") {
    const window = Number(process.env.CANCEL_WINDOW_HOURS ?? 2) * 60;
    if (actor.role === "patient" && minutesUntil(appt.date, appt.time) < window) throw new AppError(409, `Appointments can be cancelled online up to ${window / 60} hours before the visit. Please call reception.`, "CANCEL_WINDOW");
    const r = await Appointment.updateOne(base, { $set: { status: "cancelled", cancelledBy: actor.id, cancelReason: reason || "" }, $unset: { slotKey: 1, patientSlotKey: 1 } });
    if (!r.modifiedCount) throw new AppError(409, "This appointment was just changed. Refresh and try again.", "CONFLICT");
  } else if (action === "reschedule") {
    if (!date || !time) throw new AppError(422, "Choose a new date and time.", "VALIDATION");
    const doctor = await getBookableDoctor(appt.doctor._id);
    const slot = await validSlotOrThrow(doctor, date, time);
    try {
      const r = await Appointment.updateOne(base, { $set: { date, time, endTime: slot.endTime, slotKey: slotKey(doctor._id, date, time), patientSlotKey: patientSlotKey(appt.patient._id, date, time), reminderSent: false } });
      if (!r.modifiedCount) throw new AppError(409, "This appointment was just changed. Refresh and try again.", "CONFLICT");
    } catch (e) { if (e.code === 11000) throw clashError(e); throw e; }
  } else if (action === "check_in") {
    if (appt.date !== today.date) throw new AppError(409, "Patients can only be checked in on the day of the appointment.", "NOT_TODAY");
    const { seq: queueNumber } = await Counter.findOneAndUpdate({ key: `queue_${appt.doctor._id}_${appt.date}` }, { $inc: { seq: 1 } }, { upsert: true, new: true }); // atomic, collision-free
    const r = await Appointment.updateOne(base, { status: "checked_in", checkedInAt: new Date(), queueNumber });
    if (!r.modifiedCount) throw new AppError(409, "This appointment was just changed. Refresh and try again.", "CONFLICT");
  } else if (action === "complete") {
    if (appt.date > today.date) throw new AppError(409, "A future appointment cannot be completed yet.", "FUTURE");
    const r = await Appointment.updateOne(base, { status: "completed", completedAt: new Date() });
    if (!r.modifiedCount) throw new AppError(409, "This appointment was just changed. Refresh and try again.", "CONFLICT");
  } else if (action === "no_show") {
    await Appointment.updateOne(base, { status: "no_show" });
  }

  const labels = { cancel: "cancelled", reschedule: "rescheduled", check_in: "checked in", complete: "completed", no_show: "marked as no-show" };
  const fresh = await Appointment.findById(id).lean();
  const detail = `${fresh.date} at ${fresh.time}`;
  const others = [];
  if (actor.role !== "patient") others.push(notifyUser(appt.patient.user, { type: "appointment", title: `Appointment ${labels[action]}`, body: `Your appointment (${detail}) was ${labels[action]}.`, link: "/patient/appointments", email: ["cancel", "reschedule"].includes(action) }));
  if (actor.role !== "doctor" && ["cancel", "reschedule"].includes(action)) others.push(notifyUser(appt.doctor.user, { type: "appointment", title: `Appointment ${labels[action]}`, body: `An appointment (${detail}) was ${labels[action]}.`, link: "/doctor/appointments", email: false }));
  if (actor.role === "patient") others.push(notifyUser(actor.id, { type: "appointment", title: `Appointment ${labels[action]}`, body: `Your appointment (${detail}) was ${labels[action]}.`, link: "/patient/appointments" }));
  await Promise.all(others);
  return fresh;
}

const shape = (a) => ({
  id: String(a._id), date: a.date, time: a.time, endTime: a.endTime, status: a.status, reason: a.reason, queueNumber: a.queueNumber,
  patient: a.patient ? { id: String(a.patient._id), mrn: a.patient.mrn, name: a.patient.user?.name, phone: a.patient.user?.phone } : null,
  doctor: a.doctor ? { id: String(a.doctor._id), name: a.doctor.user?.name, specialization: a.doctor.specialization } : null,
  department: a.department ? { id: String(a.department._id), name: a.department.name } : null,
  reviewed: !!a.reviewed,
});

/** Role-scoped listing. Filters: status, date, from, to, q (patient name/MRN – staff only). */
export async function listAppointments({ actor, status, date, from, to, scope, q, limit = 200 }) {
  const filter = {};
  if (actor.role === "patient") { const p = await Patient.findOne({ user: actor.id }).select("_id"); if (!p) return []; filter.patient = p._id; }
  if (actor.role === "doctor") { const d = await Doctor.findOne({ user: actor.id }).select("_id"); if (!d) return []; filter.doctor = d._id; }
  if (status) filter.status = { $in: status.split(",") };
  if (date) filter.date = date;
  if (from || to) filter.date = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const today = nowInTz().date;
  if (scope === "upcoming") { filter.date = { $gte: today }; filter.status = { $in: ["booked", "checked_in"] }; }
  if (scope === "past") filter.$or = [{ date: { $lt: today } }, { status: { $in: ["completed", "cancelled", "no_show"] } }];
  let rows = await Appointment.find(filter)
    .populate({ path: "patient", select: "mrn user", populate: { path: "user", select: "name phone" } })
    .populate({ path: "doctor", select: "specialization user", populate: { path: "user", select: "name" } })
    .populate("department", "name")
    .sort(scope === "past" ? { date: -1, time: -1 } : { date: 1, time: 1 }).limit(Math.min(limit, 500)).lean();
  if (q && ["receptionist", "admin"].includes(actor.role)) {
    const needle = q.toLowerCase();
    rows = rows.filter((r) => r.patient?.user?.name?.toLowerCase().includes(needle) || r.patient?.mrn?.toLowerCase().includes(needle) || r.doctor?.user?.name?.toLowerCase().includes(needle));
  }
  if (actor.role === "patient") {
    const { Review } = await import("../models/index.js");
    const reviewed = new Set((await Review.find({ appointment: { $in: rows.map((r) => r._id) } }).select("appointment").lean()).map((r) => String(r.appointment)));
    rows.forEach((r) => { r.reviewed = reviewed.has(String(r._id)); });
  }
  return rows.map(shape);
}

/** Cancel a list of appointments (status-guarded), free their slots and notify patients. Returns how many were cancelled. */
async function cancelMany(appts, reason) {
  let n = 0;
  for (const a of appts) {
    const r = await Appointment.updateOne({ _id: a._id, status: a.status }, { $set: { status: "cancelled", cancelReason: reason }, $unset: { slotKey: 1, patientSlotKey: 1 } });
    if (!r.modifiedCount) continue;
    n++;
    const userId = a.patient?.user?._id ?? a.patient?.user ?? (await Patient.findById(a.patient).select("user").lean())?.user;
    if (userId) await notifyUser(userId, { type: "appointment", title: "Appointment cancelled", body: `Your appointment on ${a.date} at ${a.time} was cancelled because ${reason}. Please book another time.`, link: "/book", cta: "Book again" });
  }
  return n;
}

/** Used when a doctor is revoked/suspended: no patient should be left holding a booking with an unavailable doctor. */
export async function cancelUpcomingForDoctor(doctorId, reason) {
  const today = nowInTz().date;
  const appts = await Appointment.find({ doctor: doctorId, status: { $in: ["booked", "checked_in"] }, date: { $gte: today } }).populate({ path: "patient", select: "user" });
  return cancelMany(appts, reason);
}

/** Booked appointments that no longer fall inside the doctor's published schedule (after a schedule edit). */
export async function findScheduleConflicts(doctorId) {
  const avail = await DoctorAvailability.findOne({ doctor: doctorId }).lean();
  if (!avail) return [];
  const appts = await Appointment.find({ doctor: doctorId, status: "booked", date: { $gte: nowInTz().date } }).populate({ path: "patient", select: "user mrn", populate: { path: "user", select: "name" } }).sort({ date: 1, time: 1 }).lean();
  const valid = new Map(), out = [];
  for (const a of appts) {
    if (!valid.has(a.date)) valid.set(a.date, new Set(generateSlots({ weekly: avail.weekly, slotMinutes: avail.slotMinutes, daysOff: avail.daysOff, date: a.date }).map((s) => s.time)));
    if (!valid.get(a.date).has(a.time)) out.push(a);
  }
  return out;
}
export async function cancelScheduleConflicts(doctorId, reason = "the doctor’s schedule changed") {
  const conflicts = await findScheduleConflicts(doctorId);
  return cancelMany(conflicts, reason);
}
/** Closes out past bookings that were never checked in. Run from the daily cron. */
export async function sweepNoShows() {
  const r = await Appointment.updateMany({ status: "booked", date: { $lt: nowInTz().date } }, { status: "no_show" });
  return r.modifiedCount;
}
