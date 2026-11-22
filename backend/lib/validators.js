import { z } from "zod";
import { DATE_RE, TIME_RE } from "./time.js";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid e-mail address").max(254);
export const passwordSchema = z.string().min(10, "Use at least 10 characters").max(128)
  .regex(/[a-z]/, "Include a lowercase letter").regex(/[A-Z]/, "Include an uppercase letter").regex(/\d/, "Include a number");
const name = z.string().trim().min(2, "Enter your full name").max(80);
const phone = z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number").optional().or(z.literal(""));
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const gender = z.enum(["female", "male", "other", "undisclosed"]);
const dateStr = z.string().regex(DATE_RE, "Use YYYY-MM-DD");

export const registerPatientSchema = z.object({ name, email: emailSchema, password: passwordSchema, phone, dob: dateStr.optional().or(z.literal("")), gender: gender.optional() });
export const registerDoctorSchema = z.object({
  name, email: emailSchema, password: passwordSchema, phone,
  departmentId: objectId, specialization: z.string().trim().min(2).max(80),
  registrationNumber: z.string().trim().min(3).max(40),
  registrationCouncil: z.string().trim().min(2).max(80),
});
export const verifyEmailSchema = z.union([
  z.object({ token: z.string().min(20).max(200) }),
  z.object({ email: emailSchema, code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }),
]);
export const resetPasswordSchema = z.object({ token: z.string().min(20).max(200), password: passwordSchema });
export const bookSchema = z.object({
  doctorId: objectId, date: z.string().regex(DATE_RE), time: z.string().regex(TIME_RE),
  reason: z.string().trim().min(3, "Tell us briefly why you are visiting").max(500),
  patientId: objectId.optional(),
});
export const appointmentActionSchema = z.object({
  action: z.enum(["cancel", "reschedule", "check_in", "complete", "no_show"]),
  date: z.string().regex(DATE_RE).optional(), time: z.string().regex(TIME_RE).optional(),
  reason: z.string().trim().max(300).optional(),
});
export const recordSchema = z.object({
  type: z.enum(["history", "allergy", "medication", "diagnosis", "consultation_note", "report"]),
  title: z.string().trim().min(2).max(120), content: z.string().trim().max(5000).optional().default(""),
  severity: z.enum(["mild", "moderate", "severe"]).optional(), appointmentId: objectId.optional(), documentId: objectId.optional(),
});
export const prescriptionSchema = z.object({
  appointmentId: objectId.optional(), notes: z.string().trim().max(1000).optional().default(""),
  items: z.array(z.object({
    medicine: z.string().trim().min(2).max(100), dosage: z.string().trim().min(1).max(60),
    frequency: z.string().trim().min(1).max(60), duration: z.string().trim().min(1).max(60), instructions: z.string().trim().max(200).optional().default(""),
  })).min(1).max(20),
});
const hhmm = z.string().regex(TIME_RE);
export const availabilitySchema = z.object({
  slotMinutes: z.number().int().min(10).max(120),
  weekly: z.array(z.object({ day: z.number().int().min(0).max(6), enabled: z.boolean(), start: hhmm, end: hhmm, breaks: z.array(z.object({ start: hhmm, end: hhmm })).max(4).default([]) })).length(7),
  daysOff: z.array(z.object({ date: dateStr, reason: z.string().max(100).optional().default("") })).max(120).default([]),
}).superRefine((v, ctx) => v.weekly.forEach((w, i) => { if (w.enabled && w.start >= w.end) ctx.addIssue({ code: "custom", path: ["weekly", i], message: "End time must be after start time" }); }));
export const doctorProfileSchema = z.object({
  specialization: z.string().trim().min(2).max(80).optional(), bio: z.string().trim().max(1500).optional(),
  experienceYears: z.number().int().min(0).max(70).optional(), consultationFee: z.number().min(0).max(100000).optional(),
  languages: z.array(z.string().trim().max(30)).max(8).optional(), departmentId: objectId.optional(),
  registrationNumber: z.string().trim().min(3).max(40).optional(), registrationCouncil: z.string().trim().min(2).max(80).optional(),
  hospitalAffiliation: z.string().trim().max(120).optional(),
  qualifications: z.array(z.object({ degree: z.string().trim().min(2).max(80), institution: z.string().trim().min(2).max(120), year: z.number().int().min(1950).max(2100) })).max(10).optional(),
});
export const patientProfileSchema = z.object({
  name: name.optional(), phone, dob: dateStr.optional().or(z.literal("")), gender: gender.optional(),
  bloodGroup: z.enum(["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  address: z.string().trim().max(250).optional(),
  emergencyContact: z.object({ name: z.string().trim().max(80).optional().default(""), phone: phone.default("") }).optional(),
});
export const createPatientSchema = z.object({ name, email: emailSchema, phone, dob: dateStr.optional().or(z.literal("")), gender: gender.optional() });
export const createStaffSchema = z.object({ name, email: emailSchema, phone, role: z.enum(["receptionist", "admin"]), designation: z.string().trim().max(80).optional().default("") });
export const reviewDecisionSchema = z.object({
  action: z.enum(["approve", "reject", "request_changes"]), note: z.string().trim().max(1000).optional().default(""),
  requestedDocs: z.array(z.string().trim().max(120)).max(10).optional().default([]),
}).superRefine((v, ctx) => { if (v.action !== "approve" && v.note.length < 5) ctx.addIssue({ code: "custom", path: ["note"], message: "Add a note explaining the decision" }); });
export const departmentSchema = z.object({ name: z.string().trim().min(2).max(60), description: z.string().trim().max(500).optional().default(""), icon: z.string().trim().max(30).optional().default("Stethoscope"), active: z.boolean().optional().default(true) });
export const reviewSchema = z.object({ appointmentId: objectId, rating: z.number().int().min(1).max(5), comment: z.string().trim().max(600).optional().default("") });
export const contactSchema = z.object({ name, email: emailSchema, subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(2000) });
