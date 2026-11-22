import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  staffType: { type: String, enum: ["receptionist", "admin"], required: true },
  employeeId: { type: String, unique: true, required: true },
  designation: { type: String, default: "" },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
export default mongoose.models.Staff || mongoose.model("Staff", schema);
