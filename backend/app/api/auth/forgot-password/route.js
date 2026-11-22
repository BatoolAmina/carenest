import { z } from "zod";
import { route, body } from "@/lib/api.js";
import { emailSchema } from "@/lib/validators.js";
import { requestPasswordReset } from "@/services/verification.js";
export const POST = route(async ({ req }) => {
  const { email } = await body(req, z.object({ email: emailSchema }));
  await requestPasswordReset(email);
  return { message: "If an account exists for that e-mail, a reset link is on its way." };
}, { limit: { limit: 5, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
