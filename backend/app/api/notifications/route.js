import { z } from "zod";
import { route, body } from "@/lib/api.js";
import { Notification } from "@/models/index.js";
import { objectId } from "@/lib/validators.js";
export const GET = route(async ({ req, user }) => {
  const unreadOnly = new URL(req.url).searchParams.get("unread") === "1";
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: user.id, ...(unreadOnly && { readAt: null }) }).sort({ createdAt: -1 }).limit(50).lean(),
    Notification.countDocuments({ user: user.id, readAt: null }),
  ]);
  return { unread, notifications: notifications.map((n) => ({ id: String(n._id), title: n.title, body: n.body, link: n.link, type: n.type, read: !!n.readAt, createdAt: n.createdAt })) };
}, { roles: ["patient", "doctor", "receptionist", "admin"] });
export const PATCH = route(async ({ req, user }) => {
  const input = await body(req, z.union([z.object({ all: z.literal(true) }), z.object({ id: objectId })]));
  await Notification.updateMany({ user: user.id, readAt: null, ...(input.id && { _id: input.id }) }, { readAt: new Date() });
  return { ok: true };
}, { roles: ["patient", "doctor", "receptionist", "admin"] });

export const dynamic = "force-dynamic";
