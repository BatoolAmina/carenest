import { route } from "@/lib/api.js";
import { submitForReview } from "@/services/doctors.js";
import { audit } from "@/services/audit.js";
export const POST = route(async ({ user, ip }) => {
  const d = await submitForReview(user.id);
  await audit({ actor: user, action: "doctor.submit", resource: "doctor", resourceId: d._id, ip });
  return { ok: true, status: d.verification.status };
}, { roles: ["doctor"], limit: { limit: 10, windowMs: 3600_000 } });

export const dynamic = "force-dynamic";
