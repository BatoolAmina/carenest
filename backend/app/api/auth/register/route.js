import { route, body } from "@/lib/api.js";
import { registerPatientSchema } from "@/lib/validators.js";
import { registerPatient } from "@/services/accounts.js";
export const POST = route(async ({ req }) => {
  await registerPatient(await body(req, registerPatientSchema));
  return { message: "Check your inbox: we sent a verification code and link to confirm your e-mail." };
}, { limit: { limit: 6, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
