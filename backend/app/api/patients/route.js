import { route, body } from "@/lib/api.js";
import { createPatientSchema } from "@/lib/validators.js";
import { searchPatients, patientShape } from "@/services/patients.js";
import { createPatientByStaff } from "@/services/accounts.js";
import { Patient } from "@/models/index.js";
import { audit } from "@/services/audit.js";
export const GET = route(async ({ req, user }) => ({ patients: await searchPatients({ actor: user, q: new URL(req.url).searchParams.get("q") || "" }) }), { roles: ["receptionist", "admin", "doctor"] });
export const POST = route(async ({ req, user, ip }) => {
  const p = await createPatientByStaff(await body(req, createPatientSchema), user);
  await audit({ actor: user, action: "patient.register", resource: "patient", resourceId: p._id, ip });
  return { patient: patientShape(await Patient.findById(p._id).populate("user", "name email phone").lean()) };
}, { roles: ["receptionist", "admin"], limit: { limit: 30, windowMs: 3600_000 } });

export const dynamic = "force-dynamic";
