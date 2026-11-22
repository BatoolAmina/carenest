import { route, body, assertId } from "@/lib/api.js";
import { prescriptionSchema } from "@/lib/validators.js";
import { resolvePatient } from "@/services/patients.js";
import { addPrescription } from "@/services/records.js";
export const POST = route(async ({ req, params, user, ip }) => {
  const patient = await resolvePatient(user, assertId(params.id, "Patient"), { clinical: true });
  const rx = await addPrescription({ actor: user, patient, data: await body(req, prescriptionSchema), ip });
  return { id: String(rx._id) };
}, { roles: ["doctor"] });

export const dynamic = "force-dynamic";
