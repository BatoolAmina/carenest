import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { connectDB } from "./db.js";
import { rateLimit } from "./rate-limit.js";
import { emailSchema } from "./validators.js";
import { User, Patient } from "../models/index.js";
import { newMrn } from "../services/accounts.js";
import { audit } from "../services/audit.js";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const CredentialsProvider = (options) => ({
  id: "credentials",
  name: "Credentials",
  type: "credentials",
  credentials: {},
  authorize: () => null,
  options,
});
const GoogleProvider = (options) => ({
  id: "google",
  name: "Google",
  type: "oauth",
  wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
  authorization: { params: { scope: "openid email profile" } },
  idToken: true,
  checks: ["pkce", "state"],
  profile: (profile) => ({ id: profile.sub, name: profile.name, email: profile.email, image: profile.picture }),
  style: { logo: "/google.svg", bg: "#fff", text: "#000" },
  options,
});
// Compared against when the user does not exist, so response time doesn't reveal valid e-mails.
let dummyHash;
const getDummyHash = () => (dummyHash ||= bcrypt.hashSync("carenest-timing-equaliser", 12));

export const authOptions = {
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  useSecureCookies: process.env.NODE_ENV === "production" || process.env.NEXTAUTH_URL?.startsWith("https://"),
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production" || process.env.NEXTAUTH_URL?.startsWith("https://"),
      },
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: { email: {}, password: {} },
      async authorize(credentials, req) {
        const parsed = emailSchema.safeParse(credentials?.email);
        if (!parsed.success || !credentials?.password) throw new Error("INVALID_CREDENTIALS");
        const email = parsed.data;
        const ip = String(req?.headers?.["x-forwarded-for"] || "unknown").split(",")[0].trim();
        try { rateLimit(`login:${ip}`, { limit: 20, windowMs: 10 * 60_000 }); rateLimit(`login-email:${email}`, { limit: 8, windowMs: 10 * 60_000 }); }
        catch { throw new Error("RATE_LIMITED"); }
        await connectDB();
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !user.passwordHash) { await bcrypt.compare(String(credentials.password), getDummyHash()); throw new Error("INVALID_CREDENTIALS"); }
        if (user.lockUntil && user.lockUntil > new Date()) throw new Error("ACCOUNT_LOCKED");
        const ok = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!ok) {
          const fails = (user.failedLogins || 0) + 1;
          await User.updateOne({ _id: user._id }, fails >= MAX_FAILS ? { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MS) } : { failedLogins: fails });
          if (fails >= MAX_FAILS) await audit({ actor: { id: user._id, role: user.role }, action: "auth.locked", resource: "user", resourceId: user._id, ip });
          throw new Error("INVALID_CREDENTIALS");
        }
        if (user.status !== "active") throw new Error("ACCOUNT_SUSPENDED");
        if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
        await User.updateOne({ _id: user._id }, { failedLogins: 0, lockUntil: null, lastLoginAt: new Date() });
        await audit({ actor: { id: user._id, role: user.role }, action: "auth.login", resource: "user", resourceId: user._id, ip });
        return { id: String(user._id), email: user.email, name: user.name };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })] : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      if (!profile?.email || profile.email_verified === false) return "/login?error=GOOGLE_UNVERIFIED";
      await connectDB();
      const email = profile.email.toLowerCase();
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, name: profile.name || email.split("@")[0], role: "patient", emailVerified: new Date(), image: profile.picture || "", authProvider: "google", passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12) });
        await Patient.create({ user: user._id, mrn: newMrn() });
      } else if (user.role !== "patient") return "/login?error=GOOGLE_ROLE"; // staff & doctors must use password + their verified hospital e-mail
      if (user.status !== "active") return "/login?error=ACCOUNT_SUSPENDED";
      if (!user.emailVerified) await User.updateOne({ _id: user._id }, { emailVerified: new Date() });
      await audit({ actor: { id: user._id, role: user.role }, action: "auth.login", resource: "user", resourceId: user._id, meta: { provider: "google" } });
      return true;
    },
    async jwt({ token }) {
      // Re-read role/status from the database on every token refresh: never trust a stale or client-held role.
      await connectDB();
      const u = token.uid ? await User.findById(token.uid).select("role status name image email").lean() : await User.findOne({ email: token.email }).select("role status name image email").lean();
      if (!u || u.status !== "active") return { expired: true };
      token.uid = String(u._id); token.role = u.role; token.name = u.name; token.picture = u.image; token.email = u.email;
      return token;
    },
    async session({ session, token }) {
      if (token.expired) return { ...session, user: undefined, expires: new Date(0).toISOString() };
      session.user = { id: token.uid, role: token.role, name: token.name, email: token.email, image: token.picture };
      return session;
    },
  },
};
