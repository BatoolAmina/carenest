import { route, body, assertId } from "@/lib/api.js";
import { Department, Doctor, Appointment } from "@/models/index.js";
import { departmentSchema } from "@/lib/validators.js";
import { slugify } from "@/lib/slug.js";
import { AppError, notFound } from "@/lib/errors.js";
import { audit } from "@/services/audit.js";
export const PATCH = route(async ({ req, params, user, ip }) => {
  assertId(params.id);
  const data = await body(req, departmentSchema.partial());
  if (data.name) data.slug = slugify(data.name);
  const d = await Department.findByIdAndUpdate(params.id, data, { new: true });
  if (!d) throw notFound("Department");
  await audit({ actor: user, action: "department.update", resource: "department", resourceId: d._id, ip });
  return { ok: true };
}, { roles: ["admin"] });
export const DELETE = route(async ({ params, user, ip }) => {
  assertId(params.id);
  if ((await Doctor.exists({ department: params.id })) || (await Appointment.exists({ department: params.id }))) throw new AppError(409, "This department has doctors or appointments. Deactivate it instead.", "IN_USE");
  await Department.deleteOne({ _id: params.id });
  await audit({ actor: user, action: "department.delete", resource: "department", resourceId: params.id, ip });
  return { ok: true };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
