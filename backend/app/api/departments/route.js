import { route, body } from "@/lib/api.js";
import { getSession } from "@/lib/session.js";
import { Department } from "@/models/index.js";
import { departmentSchema } from "@/lib/validators.js";
import { slugify } from "@/lib/slug.js";
import { audit } from "@/services/audit.js";
export const GET = route(async ({ req }) => {
  const all = new URL(req.url).searchParams.get("all");
  const isAdmin = all && (await getSession())?.user?.role === "admin";
  const departments = await Department.find(isAdmin ? {} : { active: true }).sort({ name: 1 }).lean();
  return { departments: departments.map((d) => ({ id: String(d._id), name: d.name, slug: d.slug, description: d.description, icon: d.icon, active: d.active })) };
});
export const POST = route(async ({ req, user, ip }) => {
  const data = await body(req, departmentSchema);
  const dept = await Department.create({ ...data, slug: slugify(data.name) });
  await audit({ actor: user, action: "department.create", resource: "department", resourceId: dept._id, ip });
  return { id: String(dept._id) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
