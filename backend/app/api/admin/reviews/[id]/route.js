import { z } from "zod";
import { route, body, assertId } from "@/lib/api.js";
import { Review } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
import { audit } from "@/services/audit.js";
import { recalcRating } from "@/services/reviews.js";
export const PATCH = route(async ({ req, params, user, ip }) => {
  const { status } = await body(req, z.object({ status: z.enum(["visible", "hidden"]) }));
  const r = await Review.findByIdAndUpdate(assertId(params.id, "Review"), { status }, { new: true });
  if (!r) throw notFound("Review");
  await recalcRating(r.doctor);
  await audit({ actor: user, action: `review.${status}`, resource: "review", resourceId: r._id, ip });
  return { ok: true };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
