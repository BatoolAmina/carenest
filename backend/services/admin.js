import { Appointment, Patient, Doctor, User, Department } from "../models/index.js";
import { addDays, nowInTz } from "../lib/time.js";

export async function getStats() {
  const today = nowInTz().date;
  const from = addDays(today, -29);
  const [patients, doctors, pendingDoctors, staff, todayAppts, totalAppts, trend, regs, byDept, byStatus] = await Promise.all([
    Patient.countDocuments(), Doctor.countDocuments({ "verification.status": "approved" }), Doctor.countDocuments({ "verification.status": "under_review" }),
    User.countDocuments({ role: { $in: ["receptionist", "admin"] } }), Appointment.countDocuments({ date: today }), Appointment.countDocuments(),
    Appointment.aggregate([{ $match: { date: { $gte: from, $lte: addDays(today, 14) } } }, { $group: { _id: "$date", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } } } }, { $sort: { _id: 1 } }]),
    Patient.aggregate([{ $match: { createdAt: { $gte: new Date(Date.now() - 29 * 864e5) } } }, { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Appointment.aggregate([{ $group: { _id: "$department", total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } } } }, { $lookup: { from: Department.collection.name, localField: "_id", foreignField: "_id", as: "d" } }, { $unwind: "$d" }, { $project: { name: "$d.name", total: 1, completed: 1 } }, { $sort: { total: -1 } }]),
    Appointment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  return { counts: { patients, doctors, pendingDoctors, staff, todayAppts, totalAppts }, trend: trend.map((t) => ({ date: t._id.slice(5), total: t.total, completed: t.completed, cancelled: t.cancelled })), registrations: regs.map((r) => ({ date: r._id.slice(5), count: r.count })), byDepartment: byDept, byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })) };
}
