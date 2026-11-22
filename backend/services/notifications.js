import { Notification, User } from "../models/index.js";
import { sendMail, layout, esc, siteUrl } from "./mailer.js";

/** In-app notification + optional e-mail. Never throws. */
export async function notifyUser(userId, { title, body = "", link = "", type = "info", email = true, cta }) {
  try {
    const user = await User.findById(userId).select("email name").lean();
    if (!user) return;
    await Notification.create({ user: userId, title, body, link, type });
    if (email) {
      await sendMail({
        to: user.email, subject: title,
        html: layout({ title, body: `<p>Hello ${esc(user.name)},</p><p>${esc(body)}</p>`, cta: link ? { url: siteUrl() + link, label: cta || "Open CareNest" } : undefined }),
      });
    }
  } catch (e) { console.error("[notify:error]", e.message); }
}
export async function notifyRoles(roles, payload) {
  const users = await User.find({ role: { $in: roles }, status: "active" }).select("_id").lean();
  await Promise.all(users.map((u) => notifyUser(u._id, { email: false, ...payload })));
}
export async function notifyAdmins(payload) {
  const admins = await User.find({ role: "admin", status: "active" }).select("_id").lean();
  await Promise.all(admins.map((a) => notifyUser(a._id, { email: false, ...payload })));
}
