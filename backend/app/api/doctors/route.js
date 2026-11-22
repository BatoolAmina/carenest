import { route } from "@/lib/api.js";
import { listPublicDoctors } from "@/services/doctors.js";
export const GET = route(async ({ req }) => {
  const sp = new URL(req.url).searchParams;
  return { doctors: await listPublicDoctors({ department: sp.get("department") || undefined, q: sp.get("q") || undefined }) };
});

export const dynamic = "force-dynamic";
