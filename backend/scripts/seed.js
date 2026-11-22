// Seeds a DEVELOPMENT database with departments, staff, verified doctors, patients and sample appointments.
// Usage: npm run seed   |   npm run seed:reset  (drops existing CareNest collections first)
import fs from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import * as M from "../models/index.js";
import { addDays, nowInTz, dayOfWeek } from "../lib/time.js";

for (const f of [".env.local", ".env"]) {
  if (fs.existsSync(f)) for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) { const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].trim(); }
}
const uri = process.env.MONGODB_URI;
if (!uri) { console.error("MONGODB_URI is not set."); process.exit(1); }
if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) { console.error("Refusing to seed in production without --force."); process.exit(1); }
const PASSWORD = process.env.SEED_PASSWORD || "CareNest#2026!";
const reset = process.argv.includes("--reset");
const slug = (s) => s.toLowerCase().replace(/[^\w]+/g, "-");
const weekly = () => Array.from({ length: 7 }, (_, day) => ({ day, enabled: day >= 1 && day <= 6, start: "09:00", end: "17:00", breaks: [{ start: "13:00", end: "14:00" }] }));

const DEPTS = [
  ["Cardiology", "HeartPulse", "Heart and vascular care, from prevention to advanced interventions."], ["Neurology", "Brain", "Diagnosis and treatment of brain, spine and nerve conditions."],
  ["Orthopaedics", "Bone", "Bone, joint and sports-injury care with modern rehabilitation."], ["Paediatrics", "Baby", "Gentle, comprehensive care for infants, children and teens."],
  ["Dermatology", "Smile", "Medical and cosmetic care for skin, hair and nails."], ["Ophthalmology", "Eye", "Vision care, from eye exams to surgery."],
  ["General Medicine", "Stethoscope", "First-line care, health checks and chronic disease management."], ["Gynaecology", "Activity", "Women’s health, maternity and reproductive care."],
];
const DOCTORS = [
  ["Aarav Mehta", 0, "Interventional Cardiologist", 14], ["Naomi Fernandes", 0, "Cardiac Electrophysiologist", 9], ["Rohan Iyer", 1, "Neurologist", 11], ["Sofia Almeida", 2, "Orthopaedic Surgeon", 16],
  ["Priya Nair", 3, "Paediatrician", 8], ["Kabir Sethi", 4, "Dermatologist", 7], ["Meera Kapoor", 5, "Ophthalmologist", 12], ["Daniel Thomas", 6, "Internal Medicine Physician", 10], ["Ananya Rao", 7, "Obstetrician & Gynaecologist", 13],
];

await mongoose.connect(uri);
if (reset) { for (const m of Object.values(M)) await m.deleteMany({}); console.log("Existing data cleared."); }
await Promise.all(Object.values(M).map((m) => m.syncIndexes()));
const hash = await bcrypt.hash(PASSWORD, 12);
const verified = new Date();
const mkUser = async (name, email, role, extra = {}) => (await M.User.findOneAndUpdate({ email }, { $setOnInsert: { name, email, role, passwordHash: hash, emailVerified: verified, ...extra } }, { upsert: true, new: true }));

const depts = [];
for (const [name, icon, description] of DEPTS) depts.push(await M.Department.findOneAndUpdate({ slug: slug(name) }, { name, slug: slug(name), icon, description, active: true }, { upsert: true, new: true }));

const admin = await mkUser("Hospital Administrator", "admin@carenest.health", "admin");
await M.Staff.updateOne({ user: admin._id }, { $setOnInsert: { staffType: "admin", employeeId: "EMP-ADMIN01", designation: "Hospital Administrator" } }, { upsert: true });
const rec = await mkUser("Reena Sharma", "reception@carenest.health", "receptionist");
await M.Staff.updateOne({ user: rec._id }, { $setOnInsert: { staffType: "receptionist", employeeId: "EMP-REC001", designation: "Front Desk" } }, { upsert: true });

const doctors = [];
for (const [i, [name, d, spec, yrs]] of DOCTORS.entries()) {
  const email = `${name.split(" ")[0].toLowerCase()}@carenest.health`;
  const user = await mkUser(name, email, "doctor");
  const doc = await M.Doctor.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id, department: depts[d]._id, specialization: spec, experienceYears: yrs, consultationFee: 600 + i * 100, languages: ["English", "Hindi"], bio: `${name} is a ${spec.toLowerCase()} with ${yrs} years of clinical experience, committed to clear communication and evidence-based care.`, registrationNumber: `MCI-${10000 + i}`, registrationCouncil: "National Medical Commission", hospitalEmail: email, qualifications: [{ degree: "MBBS", institution: "AIIMS", year: 2026 - yrs - 6 }, { degree: `MD / MS ${depts[d].name}`, institution: "PGIMER", year: 2026 - yrs - 2 }], verification: { status: "approved", reviewedAt: new Date(), reviewedBy: admin._id, submittedAt: new Date() } } }, { upsert: true, new: true });
  await M.DoctorAvailability.updateOne({ doctor: doc._id }, { $setOnInsert: { slotMinutes: 30, weekly: weekly(), daysOff: [] } }, { upsert: true });
  doctors.push(doc);
}
// A pending doctor so the admin verification queue has something to review.
const pendUser = await mkUser("Vikram Desai", "vikram@carenest.health", "doctor");
const pend = await M.Doctor.findOneAndUpdate({ user: pendUser._id }, { $setOnInsert: { user: pendUser._id, department: depts[6]._id, specialization: "Family Physician", registrationNumber: "MCI-99001", registrationCouncil: "National Medical Commission", hospitalEmail: "vikram@carenest.health", qualifications: [{ degree: "MBBS", institution: "Grant Medical College", year: 2012 }], verification: { status: "under_review", submittedAt: new Date() } } }, { upsert: true, new: true });
await M.DoctorAvailability.updateOne({ doctor: pend._id }, { $setOnInsert: { slotMinutes: 30, weekly: weekly(), daysOff: [] } }, { upsert: true });
await M.UploadedDocument.updateOne({ doctor: pend._id }, { $setOnInsert: { owner: pendUser._id, doctor: pend._id, kind: "doctor_credential", label: "Sample certificate", filename: "certificate.pdf", mime: "application/pdf", size: 64, data: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n") } }, { upsert: true });

const patients = [];
for (const [name, email] of [["Isha Verma", "isha@example.com"], ["Rahul Menon", "rahul@example.com"]]) {
  const user = await mkUser(name, email, "patient");
  patients.push(await M.Patient.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id, mrn: `CN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, gender: "undisclosed" } }, { upsert: true, new: true }));
}

// Sample appointments (atomic keys exactly as the app creates them).
const today = nowInTz().date;
const nextWorkday = (from) => { let d = addDays(from, 1); while (dayOfWeek(d) === 0) d = addDays(d, 1); return d; };
const mkAppt = async (patient, doctor, date, time, status, reason) => {
  const occupied = ["booked", "checked_in", "completed"].includes(status);
  const [h, m] = time.split(":").map(Number); const end = `${String(Math.floor((h * 60 + m + 30) / 60)).padStart(2, "0")}:${String((m + 30) % 60).padStart(2, "0")}`;
  try { return await M.Appointment.create({ patient: patient._id, doctor: doctor._id, department: doctor.department, date, time, endTime: end, reason, status, ...(occupied && { slotKey: `${doctor._id}_${date}_${time}`, patientSlotKey: `${patient._id}_${date}_${time}` }), bookedBy: patient.user, bookedByRole: "patient" }); } catch (e) { if (e.code !== 11000) throw e; }
};
const past = await mkAppt(patients[0], doctors[0], addDays(today, -14), "10:00", "completed", "Chest discomfort follow-up");
await mkAppt(patients[0], doctors[0], nextWorkday(today), "10:30", "booked", "Blood pressure review");
await mkAppt(patients[1], doctors[7], nextWorkday(today), "11:00", "booked", "General health check");
if (past) {
  await M.MedicalRecord.create({ patient: patients[0]._id, doctor: doctors[0]._id, appointment: past._id, type: "diagnosis", title: "Mild hypertension", content: "BP 142/90. Lifestyle changes advised; review in 2 weeks.", severity: "mild", createdBy: doctors[0].user, createdByRole: "doctor" });
  await M.Prescription.create({ patient: patients[0]._id, doctor: doctors[0]._id, appointment: past._id, items: [{ medicine: "Amlodipine", dosage: "5 mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" }], notes: "Monitor blood pressure at home." });
}
console.log(`\nSeed complete. Password for all demo accounts: ${PASSWORD}\n  Admin:        admin@carenest.health\n  Receptionist: reception@carenest.health\n  Doctor:       aarav@carenest.health (approved) · vikram@carenest.health (awaiting review)\n  Patients:     isha@example.com · rahul@example.com\n\nDEVELOPMENT ONLY — change or delete these accounts before any real deployment.\n`);
await mongoose.disconnect();
