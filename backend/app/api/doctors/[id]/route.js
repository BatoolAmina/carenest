import { route, assertId } from "@/lib/api.js";
import { getPublicDoctor } from "@/services/doctors.js";
export const GET = route(async ({ params }) => getPublicDoctor(assertId(params.id, "Doctor")));

export const dynamic = "force-dynamic";
