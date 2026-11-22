import mongoose from "mongoose";
const { Schema } = mongoose;
// Sensitive documents live in MongoDB behind authenticated, authorized routes (never public URLs).
const schema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  kind: { type: String, enum: ["doctor_credential", "medical_report", "avatar"], required: true },
  label: { type: String, default: "" },
  filename: { type: String, required: true },
  mime: { type: String, required: true },
  size: { type: Number, required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
  data: { type: Buffer, select: false, required: true },
}, { timestamps: true });
export default mongoose.models.UploadedDocument || mongoose.model("UploadedDocument", schema);
