import mongoose from "mongoose";
const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "Stethoscope" },
  active: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.models.Department || mongoose.model("Department", schema);
