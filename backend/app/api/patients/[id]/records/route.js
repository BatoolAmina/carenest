import { route, body, assertId } from "@/lib/api.js";
import { recordSchema } from "@/lib/validators.js";
import { resolvePatient } from "@/services/patients.js";
import { listRecords, addRecord } from "@/services/records.js";
const id = (p) => (p === "me" ? p : assertId(p, "Patient"));
export const GET = route(async ({ params, user, ip }) => listRecords({ actor: user, patient: await resolvePatient(user, id(params.id), { clinical: true }), ip }), { roles: ["patient", "doctor", "receptionist", "admin"] });
export const POST = route(async ({ req, params, user, ip }) => {
  const patient = await resolvePatient(user, id(params.id), { clinical: true });
  const rec = await addRecord({ actor: user, patient, data: await body(req, recordSchema), ip });
  return { id: String(rec._id) };
}, { roles: ["patient", "doctor", "receptionist", "admin"] });

export const dynamic = "force-dynamic";
