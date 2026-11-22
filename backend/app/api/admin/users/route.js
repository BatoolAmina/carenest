import { route } from "@/lib/api.js";
import { User } from "@/models/index.js";
export const GET = route(async ({ req }) => {
  const sp = new URL(req.url).searchParams;
  const role = sp.get("role"); const q = (sp.get("q") || "").toLowerCase();
  let users = await User.find(role ? { role } : {}).select("name email role status emailVerified phone createdAt lastLoginAt").sort({ createdAt: -1 }).limit(500).lean();
  if (q) users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.includes(q));
  return { users: users.map((u) => ({ ...u, id: String(u._id), emailVerified: !!u.emailVerified })) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
