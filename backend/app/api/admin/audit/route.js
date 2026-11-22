import { route } from "@/lib/api.js";
import { AuditLog } from "@/models/index.js";
export const GET = route(async ({ req }) => {
  const action = new URL(req.url).searchParams.get("action");
  const logs = await AuditLog.find(action ? { action: new RegExp(`^${action.replace(/[^\w.]/g, "")}`) } : {}).sort({ createdAt: -1 }).limit(200).populate("actor", "name email").lean();
  return { logs: logs.map((l) => ({ id: String(l._id), action: l.action, actor: l.actor?.name || "system", role: l.actorRole, resource: l.resource, resourceId: l.resourceId, ip: l.ip, createdAt: l.createdAt })) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
