import mongoose from "mongoose";
const { Schema } = mongoose;
// One-time credentials: e-mail verification (link token + 6-digit OTP) and password reset. Only hashes are stored.
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["email_verify", "password_reset"], required: true },
  tokenHash: { type: String, required: true, index: true },
  otpHash: { type: String },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }); // purge a day after expiry
export default mongoose.models.VerificationRecord || mongoose.model("VerificationRecord", schema);
