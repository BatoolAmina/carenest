import { route, body, assertId } from "@/lib/api.js";
import { patientProfileSchema } from "@/lib/validators.js";
import { forbidden } from "@/lib/errors.js";
import { resolvePatient, patientShape, updatePatientProfile } from "@/services/patients.js";
const id = (p) => (p === "me" ? p : assertId(p, "Patient"));
export const GET = route(async ({ params, user }) => ({ patient: patientShape(await resolvePatient(user, id(params.id))) }), { roles: ["patient", "doctor", "receptionist", "admin"] });
export const PUT = route(async ({ req, params, user }) => {
  if (user.role === "doctor") throw forbidden();
  const patient = await resolvePatient(user, id(params.id));
  await updatePatientProfile(patient, await body(req, patientProfileSchema));
  return { patient: patientShape(await resolvePatient(user, id(params.id))) };
}, { roles: ["patient", "receptionist", "admin"] });

export const dynamic = "force-dynamic";
