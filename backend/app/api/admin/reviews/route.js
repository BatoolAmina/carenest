import { route } from "@/lib/api.js";
import { Review } from "@/models/index.js";
export const GET = route(async () => {
  const rows = await Review.find().sort({ createdAt: -1 }).limit(200).populate({ path: "patient", select: "user", populate: { path: "user", select: "name" } }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } }).lean();
  return { reviews: rows.map((r) => ({ id: String(r._id), rating: r.rating, comment: r.comment, status: r.status, patient: r.patient?.user?.name, doctor: r.doctor?.user?.name, createdAt: r.createdAt })) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
