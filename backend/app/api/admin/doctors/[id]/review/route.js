import { route, body, assertId } from "@/lib/api.js";
import { reviewDecisionSchema } from "@/lib/validators.js";
import { reviewDoctor } from "@/services/doctors.js";
import { audit } from "@/services/audit.js";
export const POST = route(async ({ req, params, user, ip }) => {
  const input = await body(req, reviewDecisionSchema);
  const d = await reviewDoctor({ actor: user, doctorId: assertId(params.id, "Doctor"), ...input });
  await audit({ actor: user, action: `doctor.${input.action}`, resource: "doctor", resourceId: d._id, meta: { note: input.note }, ip });
  return { ok: true, status: d.verification.status };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
