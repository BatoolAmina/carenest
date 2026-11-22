import { route } from "@/lib/api.js";
import { getStats } from "@/services/admin.js";
export const GET = route(async () => getStats(), { roles: ["admin"] });

export const dynamic = "force-dynamic";
