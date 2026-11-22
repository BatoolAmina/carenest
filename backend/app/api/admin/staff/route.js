import { route, body } from "@/lib/api.js";
import { createStaffSchema } from "@/lib/validators.js";
import { createStaff } from "@/services/accounts.js";
import { audit } from "@/services/audit.js";
export const POST = route(async ({ req, user, ip }) => {
  const u = await createStaff(await body(req, createStaffSchema), user);
  await audit({ actor: user, action: "staff.create", resource: "user", resourceId: u._id, meta: { role: u.role }, ip });
  return { id: String(u._id), message: "Account created. A password-setup e-mail was sent." };
}, { roles: ["admin"], limit: { limit: 30, windowMs: 3600_000 } });

export const dynamic = "force-dynamic";
