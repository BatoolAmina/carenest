import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  actor: { type: Schema.Types.ObjectId, ref: "User" },
  actorRole: String,
  action: { type: String, required: true, index: true },
  resource: String, resourceId: String,
  meta: Schema.Types.Mixed, ip: String,
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model("AuditLog", schema);
