import { User, Doctor, VerificationRecord } from "../models/index.js";
import { AppError } from "../lib/errors.js";
import { generateToken, generateOtp, hashToken, safeEqual } from "../lib/tokens.js";
import { sendMail, layout, esc, siteUrl } from "./mailer.js";

const EMAIL_TTL = 60 * 60 * 1000;      // 1 hour
const RESET_TTL = 30 * 60 * 1000;      // 30 minutes
const MAX_OTP_ATTEMPTS = 5;

export async function issueEmailVerification(user) {
  await VerificationRecord.updateMany({ user: user._id, type: "email_verify", usedAt: null }, { usedAt: new Date() });
  const { token, hash } = generateToken();
  const otp = generateOtp();
  await VerificationRecord.create({ user: user._id, type: "email_verify", tokenHash: hash, otpHash: hashToken(otp), expiresAt: new Date(Date.now() + EMAIL_TTL) });
  const url = `${siteUrl()}/verify-email?token=${token}`;
  await sendMail({
    to: user.email, subject: "Verify your CareNest e-mail",
    html: layout({
      title: "Confirm your e-mail address",
      body: `<p>Hello ${esc(user.name)}, use this one-time code or the button below. It expires in 1 hour.</p><p style="font-size:30px;letter-spacing:8px;font-weight:700;color:#0f7652">${otp}</p>`,
      cta: { url, label: "Verify e-mail" },
    }),
  });
}

async function markVerified(user) {
  if (!user.emailVerified) await User.updateOne({ _id: user._id }, { emailVerified: new Date() });
  if (user.role === "doctor") {
    // E-mail ownership is proven – but the doctor is NOT approved. Admin review is a separate stage.
    await Doctor.updateOne({ user: user._id, "verification.status": "email_unverified" }, { "verification.status": "documents_pending" });
  }
}

export async function verifyEmail(input) {
  const bad = new AppError(400, "This verification link or code is invalid or has expired.", "INVALID_TOKEN");
  let record, user;
  if (input.token) {
    record = await VerificationRecord.findOne({ type: "email_verify", tokenHash: hashToken(input.token), usedAt: null });
    if (!record || record.expiresAt < new Date()) throw bad;
    user = await User.findById(record.user);
  } else {
    user = await User.findOne({ email: input.email });
    if (!user) throw bad;
    record = await VerificationRecord.findOne({ user: user._id, type: "email_verify", usedAt: null }).sort({ createdAt: -1 });
    if (!record || record.expiresAt < new Date() || record.attempts >= MAX_OTP_ATTEMPTS) throw bad;
    if (!safeEqual(record.otpHash, hashToken(input.code))) { await VerificationRecord.updateOne({ _id: record._id }, { $inc: { attempts: 1 } }); throw bad; }
  }
  if (!user) throw bad;
  await VerificationRecord.updateOne({ _id: record._id }, { usedAt: new Date() });
  await markVerified(user);
  return { role: user.role };
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email, status: "active" });
  if (!user) return; // never reveal whether the account exists
  await VerificationRecord.updateMany({ user: user._id, type: "password_reset", usedAt: null }, { usedAt: new Date() });
  const { token, hash } = generateToken();
  await VerificationRecord.create({ user: user._id, type: "password_reset", tokenHash: hash, expiresAt: new Date(Date.now() + RESET_TTL) });
  await sendMail({
    to: user.email, subject: "Reset your CareNest password",
    html: layout({ title: "Reset your password", body: `<p>We received a request to reset your password. This link expires in 30 minutes. If this wasn't you, you can ignore this message.</p>`, cta: { url: `${siteUrl()}/reset-password?token=${token}`, label: "Choose a new password" } }),
  });
}

export async function resetPassword(token, passwordHash) {
  const record = await VerificationRecord.findOne({ type: "password_reset", tokenHash: hashToken(token), usedAt: null });
  if (!record || record.expiresAt < new Date()) throw new AppError(400, "This reset link is invalid or has expired.", "INVALID_TOKEN");
  const res = await VerificationRecord.updateOne({ _id: record._id, usedAt: null }, { usedAt: new Date() });
  if (!res.modifiedCount) throw new AppError(400, "This reset link has already been used.", "INVALID_TOKEN");
  // A reset link also proves inbox ownership.
  const user = await User.findByIdAndUpdate(record.user, { passwordHash, failedLogins: 0, lockUntil: null, emailVerified: new Date() });
  if (user) await markVerified({ ...user.toObject(), emailVerified: new Date() });
}
