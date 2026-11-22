import { route } from "@/lib/api.js";
import { doctorStats } from "@/services/stats.js";
export const GET = route(async ({ user }) => doctorStats(user.id), { roles: ["doctor"] });
export const dynamic = "force-dynamic";
