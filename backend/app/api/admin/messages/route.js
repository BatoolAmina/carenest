import { route } from "@/lib/api.js";
import { ContactMessage } from "@/models/index.js";
export const GET = route(async () => {
  const rows = await ContactMessage.find().sort({ createdAt: -1 }).limit(200).lean();
  return { messages: rows.map((m) => ({ id: String(m._id), name: m.name, email: m.email, subject: m.subject, message: m.message, handled: m.handled, createdAt: m.createdAt })), open: rows.filter((m) => !m.handled).length };
}, { roles: ["admin"] });
export const dynamic = "force-dynamic";
