import { connectDB } from "../lib/db.js";
import { Department, Patient, Doctor, Review } from "../models/index.js";
import { listPublicDoctors } from "./doctors.js";

/** Server-side data for public pages. Degrades to empty lists if the DB is unreachable so pages still render. */
export async function getHomeData() {
  try {
    await connectDB();
    const [departments, doctors, reviews, patients, doctorCount] = await Promise.all([
      Department.find({ active: true }).sort({ name: 1 }).lean(), listPublicDoctors({ limit: 4 }),
      Review.find({ status: "visible", rating: { $gte: 4 }, comment: { $ne: "" } }).sort({ createdAt: -1 }).limit(3).populate({ path: "patient", select: "user", populate: { path: "user", select: "name" } }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } }).lean(),
      Patient.countDocuments(), Doctor.countDocuments({ "verification.status": "approved" }),
    ]);
    return {
      departments: departments.map((d) => ({ id: String(d._id), name: d.name, slug: d.slug, description: d.description, icon: d.icon })), doctors,
      reviews: reviews.map((r) => ({ id: String(r._id), rating: r.rating, comment: r.comment, author: (r.patient?.user?.name || "Patient").split(" ")[0], doctor: r.doctor?.user?.name })),
      stats: { patients, doctors: doctorCount, departments: departments.length },
    };
  } catch { return { departments: [], doctors: [], reviews: [], stats: { patients: 0, doctors: 0, departments: 0 }, offline: true }; }
}
export async function getDepartments() {
  try { await connectDB(); return (await Department.find({ active: true }).sort({ name: 1 }).lean()).map((d) => ({ id: String(d._id), name: d.name, slug: d.slug, description: d.description, icon: d.icon })); } catch { return []; }
}
