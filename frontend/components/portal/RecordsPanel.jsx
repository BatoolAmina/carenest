"use client";
import { useState } from "react";
import { FileText, Pill, Plus, Upload, Paperclip, ShieldAlert } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Field, Input, Select, Textarea, TextField } from "../ui/Form.jsx";
import { Badge, EmptyState, ErrorState, SkeletonRows } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";

const TYPES = { history: "Medical history", allergy: "Allergy", medication: "Medication", diagnosis: "Diagnosis", consultation_note: "Consultation note", report: "Report" };
const PATIENT_TYPES = ["history", "allergy", "medication", "report"];
const DOCTOR_TYPES = Object.keys(TYPES);
const tone = { allergy: "red", diagnosis: "blue", consultation_note: "green", medication: "gold", report: "gray", history: "gray" };

/** mode: "records" | "prescriptions". patientId "me" for patients. The server enforces who may read/write. */
export function RecordsPanel({ patientId, role, mode = "records" }) {
  const { toast } = useToast();
  const { data, loading, error, reload } = useFetch(`/api/patients/${patientId}/records`);
  const [modal, setModal] = useState(null);
  const [rec, setRec] = useState({ type: "history", title: "", content: "", severity: "" });
  const [file, setFile] = useState(null);
  const [rx, setRx] = useState({ notes: "", items: [{ medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }] });
  const [busy, setBusy] = useState(false);
  const types = role === "doctor" ? DOCTOR_TYPES : PATIENT_TYPES;

  async function saveRecord(e) {
    e.preventDefault(); setBusy(true);
    try {
      let documentId;
      if (file) { const fd = new FormData(); fd.append("file", file); fd.append("label", rec.title); documentId = (await api("/api/uploads", { method: "POST", form: fd })).id; }
      await api(`/api/patients/${patientId}/records`, { method: "POST", body: { ...rec, severity: rec.severity || undefined, documentId } });
      toast("Record added"); setModal(null); setFile(null); setRec({ type: "history", title: "", content: "", severity: "" }); reload();
    } catch (err) { toast(err.message, "error"); } finally { setBusy(false); }
  }
  async function saveRx(e) {
    e.preventDefault(); setBusy(true);
    try { await api(`/api/patients/${patientId}/prescriptions`, { method: "POST", body: rx }); toast("Prescription issued"); setModal(null); setRx({ notes: "", items: [{ medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }] }); reload(); }
    catch (err) { toast(err.message, "error"); } finally { setBusy(false); }
  }
  const setItem = (i, k, v) => setRx({ ...rx, items: rx.items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) });

  if (loading) return <SkeletonRows />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const action = mode === "records"
    ? <Button onClick={() => setModal("record")}><Plus className="h-4 w-4" />Add record</Button>
    : role === "doctor" && <Button onClick={() => setModal("rx")}><Plus className="h-4 w-4" />New prescription</Button>;
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-muted"><ShieldAlert className="h-4 w-4 text-gold" />Confidential. Access is limited to the patient and treating doctors, and doctor access is logged.</p>{action}
      </div>
      {mode === "records" ? (data.records.length ? (
        <ul className="space-y-3">{data.records.map((r) => (
          <li key={r._id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2"><Badge tone={tone[r.type]}>{TYPES[r.type]}</Badge>{r.severity && <Badge tone={r.severity === "severe" ? "red" : "amber"}>{r.severity}</Badge>}<span className="ml-auto text-xs text-muted">{fmtDateTime(r.createdAt)}</span></div>
            <h3 className="mt-2 font-sans font-semibold">{r.title}</h3>
            {r.content && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{r.content}</p>}
            <p className="mt-2 text-xs text-muted">{r.createdByRole === "doctor" ? `Dr. ${r.doctor?.user?.name || ""}` : "Added by patient"}</p>
            {r.document && <a href={`/api/documents/${r.document._id}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm text-primary hover:border-gold"><Paperclip className="h-4 w-4" />{r.document.filename}</a>}
          </li>))}</ul>
      ) : <EmptyState icon={FileText} title="No records yet" text="Medical history, allergies, diagnoses and reports will appear here." />)
      : (data.prescriptions.length ? (
        <ul className="space-y-3">{data.prescriptions.map((p) => (
          <li key={p._id} className="card p-5">
            <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><Pill className="h-4 w-4 text-gold" />Dr. {p.doctor?.user?.name}</p><span className="text-xs text-muted">{fmtDateTime(p.createdAt)}</span></div>
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-muted"><tr><th className="pb-1 pr-4">Medicine</th><th className="pr-4">Dosage</th><th className="pr-4">Frequency</th><th>Duration</th></tr></thead>
              <tbody>{p.items.map((it, i) => <tr key={i} className="border-t border-line/60"><td className="py-2 pr-4 font-medium">{it.medicine}{it.instructions && <span className="block text-xs font-normal text-muted">{it.instructions}</span>}</td><td className="pr-4">{it.dosage}</td><td className="pr-4">{it.frequency}</td><td>{it.duration}</td></tr>)}</tbody></table></div>
            {p.notes && <p className="mt-3 text-sm text-muted">{p.notes}</p>}
          </li>))}</ul>
      ) : <EmptyState icon={Pill} title="No prescriptions" text="Prescriptions issued by your doctors appear here." />)}

      <Modal open={modal === "record"} onClose={() => setModal(null)} title="Add medical record">
        <form onSubmit={saveRecord} className="space-y-4">
          <TextField as="select" label="Type" value={rec.type} onChange={(e) => setRec({ ...rec, type: e.target.value })}>{types.map((t) => <option key={t} value={t}>{TYPES[t]}</option>)}</TextField>
          <TextField label="Title" value={rec.title} onChange={(e) => setRec({ ...rec, title: e.target.value })} required />
          {["allergy", "diagnosis"].includes(rec.type) && <TextField as="select" label="Severity" value={rec.severity} onChange={(e) => setRec({ ...rec, severity: e.target.value })}><option value="">Not specified</option><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></TextField>}
          <TextField as="textarea" label="Details" value={rec.content} onChange={(e) => setRec({ ...rec, content: e.target.value })} />
          {role === "patient" && <Field label="Attach report (PDF, PNG, JPG, WebP · max 5 MB)">{(a) => <Input {...a} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />}</Field>}
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button loading={busy}><Upload className="h-4 w-4" />Save</Button></div>
        </form>
      </Modal>
      <Modal open={modal === "rx"} onClose={() => setModal(null)} title="New prescription" wide>
        <form onSubmit={saveRx} className="space-y-4">
          {rx.items.map((it, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-4">
              <TextField className="sm:col-span-2" label="Medicine" value={it.medicine} onChange={(e) => setItem(i, "medicine", e.target.value)} required />
              <TextField label="Dosage" value={it.dosage} onChange={(e) => setItem(i, "dosage", e.target.value)} required />
              <TextField label="Frequency" value={it.frequency} onChange={(e) => setItem(i, "frequency", e.target.value)} required />
              <TextField label="Duration" value={it.duration} onChange={(e) => setItem(i, "duration", e.target.value)} required />
              <TextField className="sm:col-span-3" label="Instructions" value={it.instructions} onChange={(e) => setItem(i, "instructions", e.target.value)} />
            </div>))}
          <Button type="button" variant="outline" size="sm" onClick={() => setRx({ ...rx, items: [...rx.items, { medicine: "", dosage: "", frequency: "", duration: "", instructions: "" }] })}><Plus className="h-4 w-4" />Add medicine</Button>
          <TextField as="textarea" label="Notes" value={rx.notes} onChange={(e) => setRx({ ...rx, notes: e.target.value })} />
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button loading={busy}>Issue prescription</Button></div>
        </form>
      </Modal>
    </>
  );
}
