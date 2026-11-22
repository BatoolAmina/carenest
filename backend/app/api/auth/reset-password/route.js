import { route, body } from "@/lib/api.js";
import { resetPasswordSchema } from "@/lib/validators.js";
import { resetPassword } from "@/services/verification.js";
import { hashPassword } from "@/services/accounts.js";
export const POST = route(async ({ req }) => {
  const { token, password } = await body(req, resetPasswordSchema);
  await resetPassword(token, await hashPassword(password));
  return { message: "Password updated. You can now sign in." };
}, { limit: { limit: 8, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
