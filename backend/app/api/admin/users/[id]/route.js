import { z } from "zod";
import { route, body, assertId } from "@/lib/api.js";
import { User, Doctor } from "@/models/index.js";
import { cancelUpcomingForDoctor } from "@/services/appointments.js";
import { AppError, notFound } from "@/lib/errors.js";
import { audit } from "@/services/audit.js";
export const PATCH = route(async ({ req, params, user, ip }) => {
  const { status } = await body(req, z.object({ status: z.enum(["active", "suspended"]) }));
  if (params.id === user.id) throw new AppError(409, "You cannot change your own account status.", "SELF");
  const target = await User.findById(assertId(params.id, "User")).select("role status");
  if (!target) throw notFound("User");
  if (status === "suspended" && target.role === "admin" && !(await User.exists({ role: "admin", status: "active", _id: { $ne: target._id } })))
    throw new AppError(409, "You cannot suspend the last active administrator.", "LAST_ADMIN");
  const u = await User.findByIdAndUpdate(target._id, { status }, { new: true });
  if (status === "suspended" && u.role === "doctor") { const d = await Doctor.findOne({ user: u._id }).select("_id"); if (d) await cancelUpcomingForDoctor(d._id, "the doctor is no longer available at CareNest"); }
  await audit({ actor: user, action: `user.${status}`, resource: "user", resourceId: u._id, ip });
  return { ok: true };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
