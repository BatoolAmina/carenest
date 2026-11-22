import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, default: "info" },
  title: { type: String, required: true },
  body: { type: String, default: "" },
  link: { type: String, default: "" },
  readAt: { type: Date, default: null },
}, { timestamps: true });
schema.index({ user: 1, readAt: 1, createdAt: -1 });
export default mongoose.models.Notification || mongoose.model("Notification", schema);
