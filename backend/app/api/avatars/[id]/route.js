import { route, assertId } from "@/lib/api.js";
import { UploadedDocument } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
// Avatars are intentionally public (they appear on doctor cards). Only the image bytes are served.
export const GET = route(async ({ params }) => {
  const doc = await UploadedDocument.findOne({ _id: assertId(params.id, "Image"), kind: "avatar" }).select("+data mime");
  if (!doc) throw notFound("Image");
  return new Response(doc.data, { headers: { "Content-Type": doc.mime, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600", "Content-Security-Policy": "default-src 'none'" } });
});
export const dynamic = "force-dynamic";
