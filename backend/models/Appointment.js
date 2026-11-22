import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  date: { type: String, required: true, index: true },   // hospital-local YYYY-MM-DD
  time: { type: String, required: true },                // hospital-local HH:mm
  endTime: { type: String, required: true },
  reason: { type: String, required: true, maxlength: 500 },
  status: { type: String, enum: ["booked", "checked_in", "completed", "cancelled", "no_show"], default: "booked", index: true },
  // Occupancy keys: present ONLY while the slot is occupied. Unique partial indexes make double booking
  // impossible at the database level, even under simultaneous requests. Cancelling $unsets them.
  slotKey: { type: String },
  patientSlotKey: { type: String },
  queueNumber: Number,
  checkedInAt: Date, completedAt: Date,
  cancelledBy: { type: Schema.Types.ObjectId, ref: "User" }, cancelReason: { type: String, default: "" },
  bookedBy: { type: Schema.Types.ObjectId, ref: "User" }, bookedByRole: String,
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });
schema.index({ slotKey: 1 }, { unique: true, partialFilterExpression: { slotKey: { $type: "string" } } });
schema.index({ patientSlotKey: 1 }, { unique: true, partialFilterExpression: { patientSlotKey: { $type: "string" } } });
schema.index({ doctor: 1, date: 1, time: 1 });
schema.index({ patient: 1, date: -1 });
schema.index({ status: 1, date: 1 });
export default mongoose.models.Appointment || mongoose.model("Appointment", schema);
