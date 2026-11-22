import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ["patient", "doctor", "receptionist", "admin"], required: true, index: true },
  status: { type: String, enum: ["active", "suspended"], default: "active" },
  emailVerified: { type: Date, default: null },
  phone: { type: String, trim: true, default: "" },
  image: { type: String, default: "" },
  authProvider: { type: String, enum: ["credentials", "google"], default: "credentials" },
  failedLogins: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  lastLoginAt: { type: Date },
}, { timestamps: true });
export default mongoose.models.User || mongoose.model("User", schema);
