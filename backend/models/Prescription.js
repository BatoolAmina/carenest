import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
  items: [{ _id: false, medicine: String, dosage: String, frequency: String, duration: String, instructions: String }],
  notes: { type: String, default: "" },
}, { timestamps: true });
schema.index({ patient: 1, createdAt: -1 });
export default mongoose.models.Prescription || mongoose.model("Prescription", schema);
