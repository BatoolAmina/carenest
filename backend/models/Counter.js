import mongoose from "mongoose";
// Atomic sequence counters (e.g. per-doctor, per-day queue numbers).
const schema = new mongoose.Schema({ key: { type: String, required: true, unique: true }, seq: { type: Number, default: 0 }, createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 3 } });
export default mongoose.models.Counter || mongoose.model("Counter", schema);
