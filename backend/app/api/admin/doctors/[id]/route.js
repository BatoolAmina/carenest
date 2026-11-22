import { route, assertId } from "@/lib/api.js";
import { Doctor, UploadedDocument } from "@/models/index.js";
import { notFound } from "@/lib/errors.js";
export const GET = route(async ({ params }) => {
  const d = await Doctor.findById(assertId(params.id, "Doctor")).populate("user", "name email emailVerified phone status").populate("department", "name").lean();
  if (!d) throw notFound("Doctor");
  const documents = await UploadedDocument.find({ doctor: d._id, kind: "doctor_credential" }).select("label filename mime size createdAt").lean();
  return { doctor: { ...d, id: String(d._id) }, documents: documents.map((x) => ({ ...x, id: String(x._id) })) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
