"use client";
import { useEffect, useState } from "react";
import { Search, UserPlus, Pencil, CalendarPlus, Download } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button, ButtonLink } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Input, TextField } from "../ui/Form.jsx";
import { EmptyState, PageHeader, SkeletonRows } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";
import { PatientProfileForm } from "./PatientProfileForm.jsx";
import { BookForPatientModal } from "./BookForPatientModal.jsx";

export function PatientsManager({ admin = false }) {
  const { toast } = useToast();
  const [q, setQ] = useState(""); const [dq, setDq] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, loading, reload } = useFetch(`/api/patients?q=${encodeURIComponent(dq)}`);
  const [modal, setModal] = useState(null); const [sel, setSel] = useState(null);
  const [v, setV] = useState({ name: "", email: "", phone: "", dob: "", gender: "undisclosed" }); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  async function register(e) {
    e.preventDefault(); setBusy(true); setErrs({});
    try { await api("/api/patients", { method: "POST", body: v }); toast("Patient registered. A password-setup e-mail was sent."); setModal(null); setV({ name: "", email: "", phone: "", dob: "", gender: "undisclosed" }); reload(); }
    catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); }
  }
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Patients" subtitle="Registration and demographics only. Clinical records are restricted to treating doctors." action={<div className="flex gap-2">{admin && <ButtonLink href="/api/admin/export?type=patients" variant="outline"><Download className="h-4 w-4" />Export CSV</ButtonLink>}<Button variant="gold" onClick={() => setModal("new")}><UserPlus className="h-4 w-4" />Register patient</Button></div>} />
      <div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Search name, MRN, phone or e-mail" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /></div>
      {loading && <SkeletonRows />}
      {data && (data.patients.length ? (
        <div className="card overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="p-4">Patient</th><th>MRN</th><th>Contact</th><th className="pr-4 text-right">Actions</th></tr></thead>
          <tbody>{data.patients.map((p) => <tr key={p.id} className="border-b border-line/60 last:border-0"><td className="p-4 font-medium">{p.name}</td><td>{p.mrn}</td><td className="text-muted">{p.phone || "–"}<br />{p.email}</td><td className="pr-4 text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost" onClick={() => { setSel(p); setModal("book"); }}><CalendarPlus className="h-3.5 w-3.5" />Book</Button><Button size="sm" variant="ghost" onClick={() => { setSel(p); setModal("edit"); }}><Pencil className="h-3.5 w-3.5" />Edit</Button></div></td></tr>)}</tbody></table></div>
      ) : <EmptyState title="No patients found" action={<Button onClick={() => setModal("new")}>Register a patient</Button>} />)}
      <Modal open={modal === "new"} onClose={() => setModal(null)} title="Register new patient">
        <form onSubmit={register} className="space-y-4" noValidate>
          <TextField label="Full name" value={v.name} onChange={set("name")} error={errs.name} required />
          <TextField label="E-mail" type="email" value={v.email} onChange={set("email")} error={errs.email} hint="The patient receives a link to set their own password." required />
          <div className="grid gap-4 sm:grid-cols-2"><TextField label="Phone" value={v.phone} onChange={set("phone")} error={errs.phone} /><TextField label="Date of birth" type="date" value={v.dob} onChange={set("dob")} /></div>
          <TextField as="select" label="Gender" value={v.gender} onChange={set("gender")}><option value="undisclosed">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></TextField>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button loading={busy}>Register</Button></div>
        </form>
      </Modal>
      <Modal open={modal === "edit"} onClose={() => { setModal(null); reload(); }} title="Edit patient" wide>{sel && <PatientProfileForm patientId={sel.id} />}</Modal>
      <BookForPatientModal open={modal === "book"} patient={sel} onClose={() => setModal(null)} />
    </div>
  );
}
