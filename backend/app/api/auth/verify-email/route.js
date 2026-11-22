import { route, body } from "@/lib/api.js";
import { verifyEmailSchema } from "@/lib/validators.js";
import { verifyEmail } from "@/services/verification.js";
export const POST = route(async ({ req }) => {
  const { role } = await verifyEmail(await body(req, verifyEmailSchema));
  return { ok: true, role, message: role === "doctor" ? "E-mail verified. Sign in to submit your credentials for administrative review." : "E-mail verified. You can now sign in." };
}, { limit: { limit: 12, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
