import { route } from "@/lib/api.js";
import { AppError } from "@/lib/errors.js";
import { toCsv } from "@/lib/csv.js";
import { Appointment, Patient } from "@/models/index.js";
import { audit } from "@/services/audit.js";
// Operational exports only: no clinical data (records, notes, prescriptions) is ever included.
export const GET = route(async ({ req, user, ip }) => {
  const type = new URL(req.url).searchParams.get("type");
  let csv, name;
  if (type === "appointments") {
    const rows = await Appointment.find().sort({ date: -1, time: -1 }).limit(20000).populate({ path: "patient", select: "mrn user", populate: { path: "user", select: "name" } }).populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } }).populate("department", "name").lean();
    csv = toCsv(["Date", "Time", "Status", "Patient", "MRN", "Doctor", "Department"], rows.map((a) => [a.date, a.time, a.status, a.patient?.user?.name, a.patient?.mrn, a.doctor?.user?.name, a.department?.name])); name = "appointments";
  } else if (type === "patients") {
    const rows = await Patient.find().sort({ createdAt: -1 }).limit(20000).populate("user", "name email phone").lean();
    csv = toCsv(["MRN", "Name", "E-mail", "Phone", "Registered"], rows.map((p) => [p.mrn, p.user?.name, p.user?.email, p.user?.phone, p.createdAt?.toISOString().slice(0, 10)])); name = "patients";
  } else throw new AppError(422, "type must be appointments or patients", "VALIDATION");
  await audit({ actor: user, action: `export.${type}`, resource: "export", ip });
  return new Response("\ufeff" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="carenest-${name}.csv"`, "Cache-Control": "no-store" } });
}, { roles: ["admin"], limit: { limit: 10, windowMs: 3600_000 } });
export const dynamic = "force-dynamic";
