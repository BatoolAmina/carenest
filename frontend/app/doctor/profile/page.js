"use client";
import { useEffect, useState } from "react";
import { Save, Send, Upload, Trash2, FileText, Plus } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Field, Input, TextField } from "@/components/ui/Form.jsx";
import { PageHeader, SkeletonRows, ErrorState } from "@/components/ui/Misc.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { VerificationBanner } from "@/components/portal/VerificationBanner.jsx";

export default function Page() {
  const { toast } = useToast(); const { data, loading, error, reload } = useFetch("/api/doctor/me");
  const [v, setV] = useState(null); const [busy, setBusy] = useState(""); const [label, setLabel] = useState(""); const [file, setFile] = useState(null); const [errs, setErrs] = useState({});
  const [verifyCode, setVerifyCode] = useState("");
  useEffect(() => { if (data) { const d = data.doctor; setV({ specialization: d.specialization, bio: d.bio || "", experienceYears: d.experienceYears || 0, consultationFee: d.consultationFee || 0, languages: (d.languages || []).join(", "), hospitalAffiliation: d.hospitalAffiliation || "", registrationNumber: d.registrationNumber, registrationCouncil: d.registrationCouncil, qualifications: d.qualifications?.length ? d.qualifications : [] }); } }, [data]);
  if (loading || !v) return error ? <ErrorState message={error} /> : <SkeletonRows rows={6} />;
  const { doctor, user, documents } = data; const status = doctor.verification.status;
  const editable = ["email_unverified", "documents_pending", "changes_requested"].includes(status);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const setQ = (i, k, val) => setV({ ...v, qualifications: v.qualifications.map((q, j) => (j === i ? { ...q, [k]: val } : q)) });

  async function run(key, fn, ok) { setBusy(key); setErrs({}); try { await fn(); if (ok) toast(ok); await reload(); } catch (e) { setErrs(e.fields || {}); toast(e.message, "error"); } finally { setBusy(""); } }
  const save = () => run("save", () => api("/api/doctor/me", { method: "PUT", body: {
    bio: v.bio, experienceYears: Number(v.experienceYears), consultationFee: Number(v.consultationFee), languages: v.languages.split(",").map((s) => s.trim()).filter(Boolean), specialization: v.specialization,
    ...(editable && { registrationNumber: v.registrationNumber, registrationCouncil: v.registrationCouncil, hospitalAffiliation: v.hospitalAffiliation, qualifications: v.qualifications.map((q) => ({ ...q, year: Number(q.year) })) }) } }), "Profile saved");
  const upload = () => run("upload", async () => { const fd = new FormData(); fd.append("file", file); fd.append("label", label); await api("/api/uploads", { method: "POST", form: fd }); setFile(null); setLabel(""); }, "Document uploaded");
  const del = (id) => run("del" + id, () => api(`/api/documents/${id}`, { method: "DELETE" }), "Document removed");
  const submit = () => run("submit", async () => { await api("/api/doctor/me", { method: "PUT", body: { qualifications: v.qualifications.map((q) => ({ ...q, year: Number(q.year) })), registrationNumber: v.registrationNumber, registrationCouncil: v.registrationCouncil, hospitalAffiliation: v.hospitalAffiliation, specialization: v.specialization, bio: v.bio } }); await api("/api/doctor/submit", { method: "POST" }); }, "Submitted for administrative review");
  const verifyEmail = () => run("verify", () => api("/api/auth/verify-email", { method: "POST", body: { email: user.email, code: verifyCode } }), "E-mail verified");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Profile & verification" subtitle={user.email} />
      <VerificationBanner verification={doctor.verification} />
      {!user.emailVerified && (
        <div className="card p-5"><h2 className="font-sans text-base font-semibold">Verify your hospital e-mail</h2>
          <div className="mt-3 flex flex-wrap items-end gap-3"><TextField label="6-digit code" inputMode="numeric" maxLength={6} value={verifyCode} onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))} /><Button loading={busy === "verify"} disabled={verifyCode.length !== 6} onClick={verifyEmail}>Verify</Button>
            <Button variant="ghost" onClick={() => api("/api/auth/resend-verification", { method: "POST", body: { email: user.email } }).then((r) => toast(r.message))}>Resend code</Button></div></div>)}
      <section className="card space-y-4 p-6">
        <h2 className="font-sans text-base font-semibold">Professional details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Specialization" value={v.specialization} onChange={set("specialization")} error={errs.specialization} />
          <TextField label="Hospital affiliation" value={v.hospitalAffiliation} onChange={set("hospitalAffiliation")} disabled={!editable} />
          <TextField label="Registration number" value={v.registrationNumber} onChange={set("registrationNumber")} disabled={!editable} error={errs.registrationNumber} />
          <TextField label="Medical council" value={v.registrationCouncil} onChange={set("registrationCouncil")} disabled={!editable} error={errs.registrationCouncil} />
          <TextField label="Experience (years)" type="number" min={0} value={v.experienceYears} onChange={set("experienceYears")} />
          <TextField label="Consultation fee (₹)" type="number" min={0} value={v.consultationFee} onChange={set("consultationFee")} />
        </div>
        <TextField label="Languages (comma separated)" value={v.languages} onChange={set("languages")} />
        <TextField as="textarea" label="Public biography" value={v.bio} onChange={set("bio")} error={errs.bio} />
        <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Qualifications</h3>{editable && <Button variant="outline" size="sm" onClick={() => setV({ ...v, qualifications: [...v.qualifications, { degree: "", institution: "", year: new Date().getFullYear() }] })}><Plus className="h-4 w-4" />Add</Button>}</div>
          {v.qualifications.map((q, i) => (<div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1fr_6rem_auto]"><Input placeholder="Degree (e.g. MD Cardiology)" disabled={!editable} value={q.degree} onChange={(e) => setQ(i, "degree", e.target.value)} /><Input placeholder="Institution" disabled={!editable} value={q.institution} onChange={(e) => setQ(i, "institution", e.target.value)} /><Input type="number" placeholder="Year" disabled={!editable} value={q.year} onChange={(e) => setQ(i, "year", e.target.value)} />{editable && <button aria-label="Remove qualification" onClick={() => setV({ ...v, qualifications: v.qualifications.filter((_, j) => j !== i) })}><Trash2 className="h-4 w-4 text-muted hover:text-red-500" /></button>}</div>))}
          {!v.qualifications.length && <p className="text-sm text-muted">Add at least one qualification.</p>}{errs.qualifications && <p className="text-xs text-red-600">{errs.qualifications}</p>}</div>
        <Button loading={busy === "save"} onClick={save}><Save className="h-4 w-4" />Save profile</Button>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="font-sans text-base font-semibold">Credential documents</h2>
        <p className="text-sm text-muted">Upload your medical degree, registration certificate and ID (PDF, PNG, JPG or WebP, max 5 MB each). Only you and reviewing administrators can open them.</p>
        <ul className="space-y-2">{documents.map((d) => <li key={d._id} className="flex items-center justify-between rounded-lg bg-sage/40 px-3 py-2 text-sm"><a className="flex items-center gap-2 text-primary hover:underline" target="_blank" rel="noopener noreferrer" href={`/api/documents/${d._id}`}><FileText className="h-4 w-4" />{d.label || d.filename}</a>{editable && <button aria-label="Delete document" onClick={() => del(d._id)}><Trash2 className="h-4 w-4 text-muted hover:text-red-500" /></button>}</li>)}{!documents.length && <li className="text-sm text-muted">No documents uploaded.</li>}</ul>
        {editable && user.emailVerified && <div className="flex flex-wrap items-end gap-3"><TextField label="Label" placeholder="e.g. MD certificate" value={label} onChange={(e) => setLabel(e.target.value)} /><Field label="File">{(a) => <Input {...a} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />}</Field><Button variant="outline" loading={busy === "upload"} disabled={!file} onClick={upload}><Upload className="h-4 w-4" />Upload</Button></div>}
      </section>
      {["documents_pending", "changes_requested"].includes(status) && <div className="flex justify-end"><Button variant="gold" size="lg" loading={busy === "submit"} disabled={!user.emailVerified} onClick={submit}><Send className="h-4 w-4" />Submit for administrative review</Button></div>}
    </div>
  );
}
