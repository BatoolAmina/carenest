"use client";
import { useState } from "react";
import { BadgeCheck, FileText, ShieldCheck, MailCheck, MailX } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { TextField } from "@/components/ui/Form.jsx";
import { EmptyState, ErrorState, PageHeader, SkeletonRows, VerificationBadge } from "@/components/ui/Misc.jsx";
import { Avatar } from "@/components/public/Photo.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

const TABS = [["under_review", "Awaiting review"], ["changes_requested", "Changes requested"], ["approved", "Approved"], ["documents_pending", "Incomplete"], ["rejected", "Rejected"], ["", "All"]];
export default function Page() {
  const { toast } = useToast(); const [tab, setTab] = useState("under_review");
  const list = useFetch(`/api/admin/doctors${tab ? `?status=${tab}` : ""}`);
  const [sel, setSel] = useState(null); const detail = useFetch(sel ? `/api/admin/doctors/${sel}` : null);
  const [note, setNote] = useState(""); const [docs, setDocs] = useState(""); const [busy, setBusy] = useState(""); const [err, setErr] = useState("");
  async function decide(action) {
    setBusy(action); setErr("");
    try { await api(`/api/admin/doctors/${sel}/review`, { method: "POST", body: { action, note, requestedDocs: docs.split(",").map((s) => s.trim()).filter(Boolean) } }); toast(action === "approve" ? "Doctor approved and now visible to patients" : action === "reject" ? "Application rejected" : "Corrections requested"); setSel(null); setNote(""); setDocs(""); list.reload(); }
    catch (e) { setErr(e.fields?.note || e.message); } finally { setBusy(""); }
  }
  const d = detail.data?.doctor;
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Doctor verification" subtitle="E-mail ownership and credential approval are separate stages. Only approved doctors are public and bookable." />
      <div className="mb-5 flex flex-wrap gap-2">{TABS.map(([k, l]) => <button key={l} onClick={() => setTab(k)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${tab === k ? "border-gold bg-gold/20" : "border-line text-muted hover:border-gold/50"}`}>{l}</button>)}</div>
      {list.loading && <SkeletonRows />}{list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {list.data && (list.data.doctors.length ? (
        <ul className="space-y-3">{list.data.doctors.map((x) => (
          <li key={x.id} className="card flex flex-wrap items-center gap-4 p-4">
            <Avatar name={x.user.name} className="h-12 w-12 text-sm" />
            <div className="min-w-0 flex-1"><p className="font-semibold">Dr. {x.user.name}</p><p className="text-sm text-muted">{x.specialization} · {x.department?.name}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted">{x.user.emailVerified ? <MailCheck className="h-3.5 w-3.5 text-primary" /> : <MailX className="h-3.5 w-3.5 text-red-500" />}{x.hospitalEmail} · {x.documentCount} document(s)</p></div>
            <VerificationBadge status={x.verification.status} /><Button size="sm" variant="outline" onClick={() => { setSel(x.id); setNote(""); setDocs(""); setErr(""); }}>Review</Button>
          </li>))}</ul>
      ) : <EmptyState icon={ShieldCheck} title="Nothing here" text="No applications match this filter." />)}
      <Modal open={!!sel} onClose={() => setSel(null)} title="Review application" wide>
        {detail.loading && <SkeletonRows rows={3} />}
        {d && (<div className="space-y-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="text-muted">Name</span><br /><b>Dr. {d.user.name}</b></p><p><span className="text-muted">Status</span><br /><VerificationBadge status={d.verification.status} /></p>
            <p><span className="text-muted">Hospital e-mail</span><br /><b>{d.hospitalEmail}</b> {d.user.emailVerified ? <span className="text-primary">· verified</span> : <span className="text-red-500">· NOT verified</span>}</p>
            <p><span className="text-muted">Department / specialization</span><br /><b>{d.department?.name} · {d.specialization}</b></p>
            <p><span className="text-muted">Registration</span><br /><b>{d.registrationNumber}</b> · {d.registrationCouncil}</p>
            <p><span className="text-muted">Hospital affiliation</span><br /><b>{d.hospitalAffiliation || "–"}</b></p>
            {d.verification.submittedAt && <p><span className="text-muted">Submitted</span><br />{fmtDateTime(d.verification.submittedAt)}</p>}
          </div>
          <div><h3 className="text-sm font-semibold">Qualifications</h3><ul className="mt-1 text-sm">{d.qualifications?.length ? d.qualifications.map((q, i) => <li key={i}>{q.degree} — {q.institution}, {q.year}</li>) : <li className="text-muted">None provided</li>}</ul></div>
          <div><h3 className="text-sm font-semibold">Submitted documents</h3><ul className="mt-1 space-y-1">{detail.data.documents.map((x) => <li key={x.id}><a className="inline-flex items-center gap-2 text-sm text-primary hover:underline" href={`/api/documents/${x.id}`} target="_blank" rel="noopener noreferrer"><FileText className="h-4 w-4" />{x.label || x.filename}</a></li>)}{!detail.data.documents.length && <li className="text-sm text-muted">No documents</li>}</ul></div>
          {["under_review", "approved", "rejected"].includes(d.verification.status) && (<>
            <TextField as="textarea" label="Decision note (required for reject / request changes)" value={note} onChange={(e) => setNote(e.target.value)} error={err} />
            <TextField label="Additional documents to request (comma separated)" value={docs} onChange={(e) => setDocs(e.target.value)} />
            <div className="flex flex-wrap justify-end gap-2">
              {d.verification.status !== "rejected" && <Button variant="danger" loading={busy === "reject"} onClick={() => decide("reject")}>{d.verification.status === "approved" ? "Revoke & reject" : "Reject"}</Button>}
              <Button variant="outline" loading={busy === "request_changes"} onClick={() => decide("request_changes")}>Request corrections</Button>
              {d.verification.status === "under_review" && <Button loading={busy === "approve"} onClick={() => decide("approve")}><BadgeCheck className="h-4 w-4" />Approve</Button>}
            </div></>)}
          {err && !note && <p className="text-sm text-red-600">{err}</p>}
        </div>)}
      </Modal>
    </div>
  );
}
