import { route, body } from "@/lib/api.js";
import { registerDoctorSchema } from "@/lib/validators.js";
import { registerDoctor } from "@/services/accounts.js";
export const POST = route(async ({ req }) => {
  await registerDoctor(await body(req, registerDoctorSchema));
  return { message: "Check your hospital inbox: we sent a verification code and link. After verifying, you will complete your credentials for administrative review." };
}, { limit: { limit: 4, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
