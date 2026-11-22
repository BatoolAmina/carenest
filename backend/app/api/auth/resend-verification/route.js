import { z } from "zod";
import { route, body } from "@/lib/api.js";
import { emailSchema } from "@/lib/validators.js";
import { User } from "@/models/index.js";
import { issueEmailVerification } from "@/services/verification.js";
export const POST = route(async ({ req }) => {
  const { email } = await body(req, z.object({ email: emailSchema }));
  const user = await User.findOne({ email, emailVerified: null, status: "active" });
  if (user) await issueEmailVerification(user);
  return { message: "If that account needs verification, a new code has been sent." };
}, { limit: { limit: 4, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
