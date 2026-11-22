import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
  appointment: { type: Schema.Types.ObjectId, ref: "Appointment" },
  type: { type: String, enum: ["history", "allergy", "medication", "diagnosis", "consultation_note", "report"], required: true },
  title: { type: String, required: true, maxlength: 120 },
  content: { type: String, default: "", maxlength: 5000 },
  severity: { type: String, enum: ["mild", "moderate", "severe"] },
  document: { type: Schema.Types.ObjectId, ref: "UploadedDocument" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdByRole: { type: String, enum: ["patient", "doctor"], required: true },
}, { timestamps: true });
schema.index({ patient: 1, createdAt: -1 });
export default mongoose.models.MedicalRecord || mongoose.model("MedicalRecord", schema);
