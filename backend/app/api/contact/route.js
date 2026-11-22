import { route, body } from "@/lib/api.js";
import { contactSchema } from "@/lib/validators.js";
import { ContactMessage } from "@/models/index.js";
import { notifyAdmins } from "@/services/notifications.js";
export const POST = route(async ({ req }) => {
  const data = await body(req, contactSchema);
  await ContactMessage.create(data);
  await notifyAdmins({ type: "contact", title: "New contact message", body: `${data.name}: ${data.subject}`, link: "/admin" });
  return { message: "Thank you. Our team will reply by e-mail shortly." };
}, { limit: { limit: 4, windowMs: 10 * 60_000 } });

export const dynamic = "force-dynamic";
