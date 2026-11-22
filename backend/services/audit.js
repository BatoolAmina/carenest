import { AuditLog } from "../models/index.js";
/** Records sensitive operations. Never throws – auditing must not break the request. */
export async function audit({ actor, action, resource, resourceId, meta, ip }) {
  try {
    await AuditLog.create({ actor: actor?.id, actorRole: actor?.role, action, resource, resourceId: resourceId ? String(resourceId) : undefined, meta, ip });
  } catch (e) { console.error("[audit:error]", e.message); }
}
