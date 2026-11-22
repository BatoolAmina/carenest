import { route } from "@/lib/api.js";
import { receptionStats } from "@/services/stats.js";
export const GET = route(async () => receptionStats(), { roles: ["receptionist", "admin"] });
export const dynamic = "force-dynamic";
