import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true, index: true },
  specialization: { type: String, required: true, trim: true },
  qualifications: [{ _id: false, degree: String, institution: String, year: Number }],
  experienceYears: { type: Number, default: 0 },
  bio: { type: String, default: "", maxlength: 1500 },
  consultationFee: { type: Number, default: 0 },
  languages: [String],
  registrationNumber: { type: String, required: true, trim: true },
  registrationCouncil: { type: String, required: true, trim: true },
  hospitalEmail: { type: String, required: true, lowercase: true },
  hospitalAffiliation: { type: String, default: "CareNest Hospital" },
  verification: {
    status: { type: String, enum: ["email_unverified", "documents_pending", "under_review", "changes_requested", "approved", "rejected"], default: "email_unverified", index: true },
    submittedAt: Date, reviewedAt: Date, reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: { type: String, default: "" }, requestedDocs: [String],
  },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ registrationNumber: 1, registrationCouncil: 1 }, { unique: true });
export default mongoose.models.Doctor || mongoose.model("Doctor", schema);
