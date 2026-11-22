import { z } from "zod";
import { route, body } from "@/lib/api.js";
import { User } from "@/models/index.js";
const ALL = ["patient", "doctor", "receptionist", "admin"];
const schema = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Enter a valid phone number").optional().or(z.literal("")) });
export const GET = route(async ({ user }) => { const u = await User.findById(user.id).select("name email phone image role authProvider").lean(); return { account: { name: u.name, email: u.email, phone: u.phone, image: u.image, role: u.role, google: u.authProvider === "google" } }; }, { roles: ALL });
export const PUT = route(async ({ req, user }) => { const d = await body(req, schema); await User.updateOne({ _id: user.id }, { name: d.name, phone: d.phone || "" }); return { ok: true }; }, { roles: ALL });
export const dynamic = "force-dynamic";
