import { z } from "zod";
import { route, body, assertId } from "@/lib/api.js";
import { ContactMessage } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
export const PATCH = route(async ({ req, params }) => {
  const { handled } = await body(req, z.object({ handled: z.boolean() }));
  if (!(await ContactMessage.findByIdAndUpdate(assertId(params.id, "Message"), { handled }))) throw notFound("Message");
  return { ok: true };
}, { roles: ["admin"] });
export const dynamic = "force-dynamic";
