import bcrypt from "bcryptjs";
import { z } from "zod";
import { route, body } from "@/lib/api.js";
import { passwordSchema } from "@/lib/validators.js";
import { AppError } from "@/lib/errors.js";
import { User } from "@/models/index.js";
import { audit } from "@/services/audit.js";
import { hashPassword } from "@/services/accounts.js";
export const POST = route(async ({ req, user, ip }) => {
  const { currentPassword, newPassword } = await body(req, z.object({ currentPassword: z.string().max(128).optional().default(""), newPassword: passwordSchema }));
  const u = await User.findById(user.id).select("+passwordHash authProvider");
  // Google-created accounts have no password the user knows, so they may set one without a current password.
  if (u.authProvider !== "google" && !(await bcrypt.compare(currentPassword, u.passwordHash))) throw new AppError(403, "Your current password is incorrect.", "BAD_PASSWORD", { currentPassword: "Incorrect password" });
  u.passwordHash = await hashPassword(newPassword); await u.save();
  await audit({ actor: user, action: "auth.password_change", resource: "user", resourceId: user.id, ip });
  return { message: "Password updated." };
}, { roles: ["patient", "doctor", "receptionist", "admin"], limit: { limit: 6, windowMs: 15 * 60_000 } });
export const dynamic = "force-dynamic";
