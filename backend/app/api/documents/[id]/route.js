import { route, assertId } from "@/lib/api.js";
import { UploadedDocument, Doctor, MedicalRecord } from "@/models/index.js";
import { forbidden, notFound } from "@/lib/errors.js";
import { assertDoctorRelationship } from "@/services/patients.js";
import { audit } from "@/services/audit.js";

async function authorize(user, doc) {
  if (String(doc.owner) === user.id) return "owner";
  if (doc.kind === "doctor_credential" && user.role === "admin") return "admin";          // reviewers see credentials
  if (doc.kind === "medical_report" && user.role === "doctor") { await assertDoctorRelationship(user.id, doc.patient); return "doctor"; }
  throw forbidden();
}
export const GET = route(async ({ params, user, ip }) => {
  const doc = await UploadedDocument.findById(assertId(params.id, "Document")).select("+data");
  if (!doc) throw notFound("Document");
  const who = await authorize(user, doc);
  if (who !== "owner") await audit({ actor: user, action: "document.read", resource: "document", resourceId: doc._id, ip });
  return new Response(doc.data, { headers: { "Content-Type": doc.mime, "Content-Disposition": `inline; filename="${doc.filename.replace(/"/g, "")}"`, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-store", "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'" } });
}, { roles: ["patient", "doctor", "admin"] });
export const DELETE = route(async ({ params, user, ip }) => {
  const doc = await UploadedDocument.findById(assertId(params.id, "Document"));
  if (!doc || String(doc.owner) !== user.id) throw notFound("Document");
  if (doc.kind === "doctor_credential") {
    const d = await Doctor.findById(doc.doctor).select("verification.status");
    if (!["documents_pending", "changes_requested"].includes(d.verification.status)) throw forbidden("Documents are locked after submission.");
  }
  await MedicalRecord.updateMany({ document: doc._id }, { $unset: { document: 1 } });
  await doc.deleteOne();
  await audit({ actor: user, action: "document.delete", resource: "document", resourceId: params.id, ip });
  return { ok: true };
}, { roles: ["patient", "doctor"] });

export const dynamic = "force-dynamic";
