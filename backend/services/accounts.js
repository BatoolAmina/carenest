import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User, Patient, Doctor, Staff, Department, DoctorAvailability } from "../models/index.js";
import { AppError } from "../lib/errors.js";
import { issueEmailVerification, requestPasswordReset } from "./verification.js";
import { sendMail, layout, esc, siteUrl } from "./mailer.js";

export const hashPassword = (p) => bcrypt.hash(p, 12);
export const newMrn = () => `CN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
export const newEmployeeId = () => `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

export function hospitalEmailAllowed(email, domains = process.env.HOSPITAL_EMAIL_DOMAINS || "carenest.health") {
  const list = domains.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (list.includes("*")) return true;
  const domain = email.split("@")[1]?.toLowerCase();
  return list.includes(domain);
}

export const defaultWeekly = () => Array.from({ length: 7 }, (_, day) => ({ day, enabled: day >= 1 && day <= 6, start: "09:00", end: "17:00", breaks: [{ start: "13:00", end: "14:00" }] }));

export async function registerPatient(data) {
  if (await User.exists({ email: data.email })) {
    await sendMail({ to: data.email, subject: "You already have a CareNest account", html: layout({ title: "Welcome back", body: "<p>An account already exists for this e-mail. Sign in, or reset your password if you have forgotten it.</p>", cta: { url: `${siteUrl()}/login`, label: "Sign in" } }) });
    return;
  }
  const user = await User.create({ email: data.email, name: data.name, phone: data.phone || "", role: "patient", passwordHash: await hashPassword(data.password) });
  try {
    await Patient.create({ user: user._id, mrn: newMrn(), dob: data.dob || "", gender: data.gender || "undisclosed" });
  } catch (e) { await User.deleteOne({ _id: user._id }); throw e; }
  await issueEmailVerification(user);
}

export async function registerDoctor(data) {
  if (!hospitalEmailAllowed(data.email)) throw new AppError(422, "Doctors must register with their official CareNest hospital e-mail address.", "EMAIL_DOMAIN", { email: "Use your official hospital e-mail" });
  const dept = await Department.findOne({ _id: data.departmentId, active: true });
  if (!dept) throw new AppError(422, "Select a valid department.", "BAD_DEPARTMENT");
  if (await User.exists({ email: data.email })) return; // silent: no account enumeration
  if (await Doctor.exists({ registrationNumber: data.registrationNumber, registrationCouncil: data.registrationCouncil })) throw new AppError(409, "This professional registration number is already on file. Contact administration if this is an error.", "DUPLICATE_REGISTRATION");
  const user = await User.create({ email: data.email, name: data.name, phone: data.phone || "", role: "doctor", passwordHash: await hashPassword(data.password) });
  try {
    const doctor = await Doctor.create({ user: user._id, department: dept._id, specialization: data.specialization, registrationNumber: data.registrationNumber, registrationCouncil: data.registrationCouncil, hospitalEmail: data.email, verification: { status: "email_unverified" } });
    await DoctorAvailability.create({ doctor: doctor._id, weekly: defaultWeekly(), slotMinutes: 30 });
  } catch (e) { await User.deleteOne({ _id: user._id }); await Doctor.deleteOne({ user: user._id }); throw e; }
  await issueEmailVerification(user);
}

/** Reception/admin registers a walk-in patient. The patient receives a link to set their own password. */
export async function createPatientByStaff(data, actor) {
  if (await User.exists({ email: data.email })) throw new AppError(409, "A user with this e-mail already exists.", "DUPLICATE_EMAIL");
  const user = await User.create({ email: data.email, name: data.name, phone: data.phone || "", role: "patient", passwordHash: await hashPassword(crypto.randomBytes(24).toString("base64url") + "aA1") });
  const patient = await Patient.create({ user: user._id, mrn: newMrn(), dob: data.dob || "", gender: data.gender || "undisclosed", registeredBy: actor.id });
  await requestPasswordReset(user.email); // sets a usable password + proves e-mail ownership
  return patient;
}

export async function createStaff(data, actor) {
  if (await User.exists({ email: data.email })) throw new AppError(409, "A user with this e-mail already exists.", "DUPLICATE_EMAIL");
  const user = await User.create({ email: data.email, name: data.name, phone: data.phone || "", role: data.role, passwordHash: await hashPassword(crypto.randomBytes(24).toString("base64url") + "aA1") });
  await Staff.create({ user: user._id, staffType: data.role, employeeId: newEmployeeId(), designation: data.designation, createdBy: actor.id });
  await requestPasswordReset(user.email);
  await sendMail({ to: user.email, subject: "Your CareNest staff account", html: layout({ title: "Your staff account is ready", body: `<p>Hello ${esc(user.name)}, an administrator created a ${esc(data.role)} account for you. Use the password-reset e-mail to set your password.</p>` }) });
  return user;
}
