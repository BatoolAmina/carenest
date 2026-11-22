// Creates (or resets the password of) a real administrator. Use this in production instead of the seed.
// ADMIN_EMAIL="you@hospital.org" ADMIN_NAME="Full Name" ADMIN_PASSWORD='long-Strong-Pass-123' npm run create-admin
import "./_env.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User, Staff } from "../models/index.js";

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_NAME || !ADMIN_PASSWORD) { console.error("Set MONGODB_URI, ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD."); process.exit(1); }
if (ADMIN_PASSWORD.length < 12 || !/[a-z]/.test(ADMIN_PASSWORD) || !/[A-Z]/.test(ADMIN_PASSWORD) || !/\d/.test(ADMIN_PASSWORD)) { console.error("ADMIN_PASSWORD must be 12+ chars with upper-case, lower-case and a digit."); process.exit(1); }

await mongoose.connect(MONGODB_URI);
const email = ADMIN_EMAIL.trim().toLowerCase();
const existing = await User.findOne({ email });
if (existing && existing.role !== "admin") { console.error(`${email} already exists with role "${existing.role}". Refusing to change its role.`); process.exit(1); }
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
const user = await User.findOneAndUpdate({ email }, { $set: { passwordHash, failedLogins: 0, lockUntil: null, status: "active" }, $setOnInsert: { email, name: ADMIN_NAME, role: "admin", emailVerified: new Date() } }, { upsert: true, new: true });
await Staff.updateOne({ user: user._id }, { $setOnInsert: { staffType: "admin", employeeId: `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`, designation: "Hospital Administrator" } }, { upsert: true });
console.log(`Administrator ready: ${email}. Clear ADMIN_PASSWORD from your shell history/environment now.`);
await mongoose.disconnect();
