import { Appointment, Doctor, DoctorAvailability, MedicalRecord, Notification, Patient, Prescription, Review } from "../models/index.js";
import { addDays, dayOfWeek, nowInTz } from "../lib/time.js";

export async function doctorStats(userId) {
  const doctor = await Doctor.findOne({ user: userId }).select("_id verification.status ratingAvg ratingCount");
  if (!doctor || doctor.verification.status !== "approved") return { approved: false };
  const today = nowInTz().date; const monthStart = today.slice(0, 8) + "01";
  const [byStatus, trend, monthDone, seen, todayCount, upcoming, reviews] = await Promise.all([
    Appointment.aggregate([{ $match: { doctor: doctor._id } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Appointment.aggregate([{ $match: { doctor: doctor._id, date: { $gte: addDays(today, -13), $lte: addDays(today, 7) } } }, { $group: { _id: "$date", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } } } }, { $sort: { _id: 1 } }]),
    Appointment.countDocuments({ doctor: doctor._id, status: "completed", date: { $gte: monthStart, $lte: today } }),
    Appointment.distinct("patient", { doctor: doctor._id, status: "completed" }),
    Appointment.countDocuments({ doctor: doctor._id, date: today, status: { $in: ["booked", "checked_in", "completed"] } }),
    Appointment.countDocuments({ doctor: doctor._id, date: { $gte: today }, status: { $in: ["booked", "checked_in"] } }),
    Review.find({ doctor: doctor._id, status: "visible" }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);
  const done = byStatus.find((s) => s._id === "completed")?.count || 0, cancelled = byStatus.find((s) => s._id === "cancelled")?.count || 0, noShow = byStatus.find((s) => s._id === "no_show")?.count || 0;
  return { approved: true, counts: { today: todayCount, upcoming, completedThisMonth: monthDone, patientsSeen: seen.length, totalCompleted: done, cancelled, noShow }, byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })), trend: trend.map((t) => ({ date: t._id.slice(5), total: t.total, completed: t.completed, cancelled: t.cancelled })), rating: { avg: doctor.ratingAvg, count: doctor.ratingCount }, reviews: reviews.map((r) => ({ id: String(r._id), rating: r.rating, comment: r.comment, createdAt: r.createdAt })) };
}

export async function receptionStats() {
  const today = nowInTz().date;
  const [byStatus, newPatients, approved] = await Promise.all([
    Appointment.aggregate([{ $match: { date: today } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
    Patient.countDocuments({ createdAt: { $gte: new Date(Date.now() - 864e5) } }),
    Doctor.find({ "verification.status": "approved" }).select("_id").lean(),
  ]);
  const n = (s) => byStatus.find((x) => x._id === s)?.count || 0;
  const onDuty = await DoctorAvailability.countDocuments({ doctor: { $in: approved.map((d) => d._id) }, weekly: { $elemMatch: { day: dayOfWeek(today), enabled: true } }, "daysOff.date": { $ne: today } });
  return { today: byStatus.reduce((a, s) => a + s.count, 0) - n("cancelled"), waiting: n("checked_in"), expected: n("booked"), completed: n("completed"), noShow: n("no_show"), cancelled: n("cancelled"), newPatients, doctorsOnDuty: onDuty };
}

export async function patientSummary(userId) {
  const patient = await Patient.findOne({ user: userId }).select("_id");
  if (!patient) return null;
  const today = nowInTz().date;
  const [upcoming, completed, records, prescriptions, allergies, latestRx, unread] = await Promise.all([
    Appointment.countDocuments({ patient: patient._id, date: { $gte: today }, status: { $in: ["booked", "checked_in"] } }),
    Appointment.countDocuments({ patient: patient._id, status: "completed" }),
    MedicalRecord.countDocuments({ patient: patient._id }), Prescription.countDocuments({ patient: patient._id }),
    MedicalRecord.find({ patient: patient._id, type: "allergy" }).select("title severity").limit(6).lean(),
    Prescription.findOne({ patient: patient._id }).sort({ createdAt: -1 }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } }).lean(),
    Notification.countDocuments({ user: userId, readAt: null }),
  ]);
  return { upcoming, completed, records, prescriptions, unread, allergies: allergies.map((a) => ({ title: a.title, severity: a.severity })), latestPrescription: latestRx ? { doctor: latestRx.doctor?.user?.name, date: latestRx.createdAt, medicines: latestRx.items.map((i) => i.medicine) } : null };
}
