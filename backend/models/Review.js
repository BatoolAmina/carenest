import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "", maxlength: 600 },
  status: { type: String, enum: ["visible", "hidden"], default: "visible" },
}, { timestamps: true });
export default mongoose.models.Review || mongoose.model("Review", schema);
