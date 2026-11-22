import { describe, it, expect } from "vitest";
import { detectFileType, sanitizeFilename } from "../lib/files.js";
import { generateToken, hashToken, generateOtp, safeEqual } from "../lib/tokens.js";
import { passwordSchema, registerDoctorSchema, bookSchema } from "../lib/validators.js";
import { hospitalEmailAllowed } from "../services/accounts.js";
import { rateLimit } from "../lib/rate-limit.js";
import nextConfig from "../next.config.mjs";
describe("file validation", () => {
  it("detects real types from magic bytes", () => {
    expect(detectFileType(Buffer.from("%PDF-1.7 ......"))?.mime).toBe("application/pdf");
    expect(detectFileType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))?.mime).toBe("image/jpeg");
  });
  it("rejects executables and scripts renamed as images", () => {
    expect(detectFileType(Buffer.from("MZ\x90\x00 fake exe data here"))).toBeNull();
    expect(detectFileType(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
  it("sanitises filenames", () => { expect(sanitizeFilename("../../etc/passwd")).not.toContain("/"); });
});
describe("tokens", () => {
  it("stores only hashes and compares safely", () => { const { token, hash } = generateToken(); expect(hash).toBe(hashToken(token)); expect(hash).not.toContain(token); expect(safeEqual(hash, hashToken(token))).toBe(true); expect(safeEqual("a", "ab")).toBe(false); });
  it("generates 6-digit OTPs", () => { for (let i = 0; i < 50; i++) expect(generateOtp()).toMatch(/^\d{6}$/); });
});
describe("validation", () => {
  it("enforces password strength", () => { expect(passwordSchema.safeParse("short1A").success).toBe(false); expect(passwordSchema.safeParse("alllowercase123").success).toBe(false); expect(passwordSchema.safeParse("GoodPassw0rdHere").success).toBe(true); });
  it("ignores client-supplied roles/verification fields on registration", () => {
    const r = registerDoctorSchema.parse({ name: "Dr Test", email: "A@Carenest.Health", password: "GoodPassw0rdHere", departmentId: "a".repeat(24), specialization: "Cardiology", registrationNumber: "REG123", registrationCouncil: "NMC", role: "admin", verification: { status: "approved" } });
    expect(r.role).toBeUndefined(); expect(r.verification).toBeUndefined(); expect(r.email).toBe("a@carenest.health");
  });
  it("rejects malformed booking input", () => { expect(bookSchema.safeParse({ doctorId: "x", date: "tomorrow", time: "9am", reason: "" }).success).toBe(false); });
  it("enforces official hospital e-mail domains", () => { expect(hospitalEmailAllowed("a@carenest.health", "carenest.health")).toBe(true); expect(hospitalEmailAllowed("a@gmail.com", "carenest.health")).toBe(false); expect(hospitalEmailAllowed("a@gmail.com", "*")).toBe(true); });
});

describe("rate limiting", () => {
  it("blocks repeated requests only after the configured limit", () => {
    const key = `test:${Date.now()}`;
    expect(() => rateLimit(key, { limit: 2, windowMs: 60_000 })).not.toThrow();
    expect(() => rateLimit(key, { limit: 2, windowMs: 60_000 })).not.toThrow();
    expect(() => rateLimit(key, { limit: 2, windowMs: 60_000 })).toThrow();
  });
});

describe("deployment security headers", () => {
  it("sets CSP and frame, MIME, referrer and HSTS protections", async () => {
    const sets = await nextConfig.headers();
    const headers = Object.fromEntries(sets[0].headers.map(({ key, value }) => [key, value]));
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBeTruthy();
    expect(headers["Strict-Transport-Security"]).toContain("max-age=");
  });
});
