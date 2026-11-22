import { route } from "@/lib/api.js";
import { Doctor, UploadedDocument } from "@/models/index.js";
export const GET = route(async ({ req }) => {
  const status = new URL(req.url).searchParams.get("status");
  const doctors = await Doctor.find(status ? { "verification.status": status } : {}).populate("user", "name email emailVerified phone status").populate("department", "name").sort({ "verification.submittedAt": -1, createdAt: -1 }).lean();
  const counts = await UploadedDocument.aggregate([{ $match: { kind: "doctor_credential" } }, { $group: { _id: "$doctor", n: { $sum: 1 } } }]);
  const byDoc = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  return { doctors: doctors.map((d) => ({ ...d, id: String(d._id), documentCount: byDoc[String(d._id)] || 0 })) };
}, { roles: ["admin"] });

export const dynamic = "force-dynamic";
