import { route, body } from "@/lib/api.js";
import { doctorProfileSchema } from "@/lib/validators.js";
import { getOwnDoctor, updateOwnProfile } from "@/services/doctors.js";
export const GET = route(async ({ user }) => getOwnDoctor(user.id), { roles: ["doctor"] });
export const PUT = route(async ({ req, user }) => {
  await updateOwnProfile(user.id, await body(req, doctorProfileSchema));
  return getOwnDoctor(user.id);
}, { roles: ["doctor"] });

export const dynamic = "force-dynamic";
