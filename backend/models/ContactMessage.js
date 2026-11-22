import mongoose from "mongoose";
const schema = new mongoose.Schema({ name: String, email: String, subject: String, message: String, handled: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", schema);
