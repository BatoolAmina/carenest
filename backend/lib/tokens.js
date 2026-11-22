import crypto from "node:crypto";
export const hashToken = (t) => crypto.createHash("sha256").update(String(t)).digest("hex");
export const generateToken = () => { const token = crypto.randomBytes(32).toString("base64url"); return { token, hash: hashToken(token) }; };
export const generateOtp = () => String(crypto.randomInt(100000, 1000000));
export const safeEqual = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
