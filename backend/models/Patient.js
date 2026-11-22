import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  mrn: { type: String, unique: true, required: true },
  dob: { type: String, default: "" },
  gender: { type: String, enum: ["female", "male", "other", "undisclosed"], default: "undisclosed" },
  bloodGroup: { type: String, enum: ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], default: "" },
  address: { type: String, default: "", maxlength: 250 },
  emergencyContact: { name: { type: String, default: "" }, phone: { type: String, default: "" } },
  registeredBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
schema.index({ createdAt: -1 });
export default mongoose.models.Patient || mongoose.model("Patient", schema);
