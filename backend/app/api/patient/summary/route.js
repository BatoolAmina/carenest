import { route } from "@/lib/api.js";
import { patientSummary } from "@/services/stats.js";
export const GET = route(async ({ user }) => ({ summary: await patientSummary(user.id) }), { roles: ["patient"] });
export const dynamic = "force-dynamic";
