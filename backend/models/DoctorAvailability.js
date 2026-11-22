import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, unique: true },
  slotMinutes: { type: Number, default: 30 },
  maxAdvanceDays: { type: Number, default: 60 },
  weekly: [{ _id: false, day: Number, enabled: Boolean, start: String, end: String, breaks: [{ _id: false, start: String, end: String }] }],
  daysOff: [{ _id: false, date: String, reason: String }],
}, { timestamps: true });
export default mongoose.models.DoctorAvailability || mongoose.model("DoctorAvailability", schema);
