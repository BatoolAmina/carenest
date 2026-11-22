import { Review, Doctor } from "../models/index.js";
export async function recalcRating(doctorId) {
  const [agg] = await Review.aggregate([{ $match: { doctor: doctorId, status: "visible" } }, { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } }]);
  await Doctor.updateOne({ _id: doctorId }, { ratingAvg: agg ? Math.round(agg.avg * 10) / 10 : 0, ratingCount: agg?.n || 0 });
}
