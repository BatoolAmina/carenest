import { route, assertId } from "@/lib/api.js";
import { DATE_RE } from "@/lib/time.js";
import { AppError } from "@/lib/errors.js";
import { getAvailableSlots } from "@/services/appointments.js";
export const GET = route(async ({ req, params }) => {
  const date = new URL(req.url).searchParams.get("date") || "";
  if (!DATE_RE.test(date)) throw new AppError(422, "Provide a date as YYYY-MM-DD.", "VALIDATION");
  return { slots: await getAvailableSlots(assertId(params.id, "Doctor"), date) };
});

export const dynamic = "force-dynamic";
