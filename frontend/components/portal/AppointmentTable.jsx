"use client";
import { useState } from "react";
import Link from "next/link";
import { CalendarX2, CalendarClock, LogIn, CheckCheck, UserX, XCircle, Star } from "lucide-react";
import { api, fmtDate, fmtTime } from "@/lib/client.js";
import { Button } from "../ui/Button.jsx";
import { Modal } from "../ui/Modal.jsx";
import { Field, Input, Textarea } from "../ui/Form.jsx";
import { AppointmentBadge, EmptyState, ErrorState, SkeletonRows } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";
import { useFetch } from "@/hooks/useFetch.js";
import { nowToday } from "../public/today.js";

const ACTIONS = {
  patient: ["reschedule", "cancel", "review"], doctor: ["complete", "no_show"],
  receptionist: ["check_in", "reschedule", "cancel", "no_show"], admin: ["check_in", "reschedule", "cancel", "no_show"],
};
const ICON = { check_in: LogIn, reschedule: CalendarClock, cancel: XCircle, complete: CheckCheck, no_show: UserX, review: Star };
const LABEL = { check_in: "Check in", reschedule: "Reschedule", cancel: "Cancel", complete: "Complete", no_show: "No-show", review: "Review" };
const allowed = (a, s) => ({ cancel: ["booked", "checked_in"], reschedule: ["booked"], check_in: ["booked"], complete: ["booked", "checked_in"], no_show: ["booked", "checked_in"], review: ["completed"] }[a] || []).includes(s);

/** Role-aware appointment list. `query` is the querystring for /api/appointments. */
export function AppointmentTable({ role, query = "", showPatient, showDoctor, empty, reloadKey }) {
  const { toast } = useToast();
  const { data, loading, error, reload } = useFetch(`/api/appointments?${query}&_=${reloadKey || 0}`);
  const [modal, setModal] = useState(null); // {type, appt}
  const [form, setForm] = useState({ date: "", time: "", reason: "", rating: 5, comment: "" });
  const [busy, setBusy] = useState(false); const [slots, setSlots] = useState(null);

  async function run(appt, action, extra = {}) {
    setBusy(true);
    try { await api(`/api/appointments/${appt.id}`, { method: "PATCH", body: { action, ...extra } }); toast(`Appointment ${LABEL[action].toLowerCase()} done`); setModal(null); reload(); window.dispatchEvent(new Event("cn:notifications")); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  }
  async function loadSlots(appt, date) {
    setForm((f) => ({ ...f, date, time: "" })); if (!date) return setSlots(null);
    try { setSlots((await api(`/api/doctors/${appt.doctor.id}/slots?date=${date}`)).slots); } catch (e) { toast(e.message, "error"); }
  }
  async function review(appt) {
    setBusy(true);
    try { await api("/api/reviews", { method: "POST", body: { appointmentId: appt.id, rating: Number(form.rating), comment: form.comment } }); toast("Thank you for your feedback"); setModal(null); reload(); }
    catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  }
  const open = (type, appt) => { setForm({ date: "", time: "", reason: "", rating: 5, comment: "" }); setSlots(null); setModal({ type, appt }); };
  const onAction = (a, appt) => (a === "reschedule" || a === "cancel" || a === "review") ? open(a, appt) : run(appt, a);

  if (loading) return <SkeletonRows />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const rows = data.appointments;
  if (!rows.length) return empty || <EmptyState icon={CalendarX2} title="No appointments" text="Nothing to show here yet." />;
  return (
    <>
      <div className="space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
            <div className="w-36 shrink-0"><p className="font-semibold">{fmtDate(a.date)}</p><p className="text-sm text-muted">{fmtTime(a.time)}{a.queueNumber ? ` · Queue #${a.queueNumber}` : ""}</p></div>
            <div className="min-w-0 flex-1">
              {showPatient && a.patient && <p className="truncate font-medium">{a.patient.name} <span className="text-xs font-normal text-muted">{a.patient.mrn}</span></p>}
              {showDoctor !== false && a.doctor && <p className="truncate text-sm">{showPatient ? "with " : ""}Dr. {a.doctor.name} <span className="text-muted">· {a.department?.name}</span></p>}
              <p className="truncate text-sm text-muted">{a.reason}</p>
            </div>
            <AppointmentBadge status={a.status} />
            <div className="flex flex-wrap gap-2">
              {role === "doctor" && a.patient && !["cancelled"].includes(a.status) && <Link href={`/doctor/patients/${a.patient.id}`} className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold text-primary hover:bg-sage/60">Open record</Link>}
              {ACTIONS[role].filter((x) => allowed(x, a.status) && !(x === "review" && a.reviewed)).map((x) => { const I = ICON[x]; return <Button key={x} size="sm" variant={x === "cancel" ? "outline" : x === "check_in" || x === "complete" ? "primary" : "ghost"} onClick={() => onAction(x, a)}><I className="h-3.5 w-3.5" />{LABEL[x]}</Button>; })}
            </div>
          </div>
        ))}
      </div>
      <Modal open={modal?.type === "cancel"} onClose={() => setModal(null)} title="Cancel appointment">
        <p className="text-sm text-muted">This frees the time slot for other patients.</p>
        <Field label="Reason (optional)" className="mt-4">{(p) => <Textarea {...p} rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />}</Field>
        <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setModal(null)}>Keep it</Button><Button variant="danger" loading={busy} onClick={() => run(modal.appt, "cancel", { reason: form.reason })}>Cancel appointment</Button></div>
      </Modal>
      <Modal open={modal?.type === "reschedule"} onClose={() => setModal(null)} title="Reschedule appointment">
        <Field label="New date">{(p) => <Input {...p} type="date" min={nowToday()} value={form.date} onChange={(e) => loadSlots(modal.appt, e.target.value)} />}</Field>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots?.map((s) => <button key={s.time} type="button" onClick={() => setForm({ ...form, time: s.time })} className={`rounded-lg border px-2 py-2 text-sm ${form.time === s.time ? "border-gold bg-gold/20 font-semibold" : "border-line hover:border-primary"}`}>{fmtTime(s.time)}</button>)}
        </div>
        {slots && !slots.length && <p className="mt-3 text-sm text-muted">No free times that day.</p>}
        <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={() => setModal(null)}>Close</Button><Button loading={busy} disabled={!form.date || !form.time} onClick={() => run(modal.appt, "reschedule", { date: form.date, time: form.time })}>Confirm new time</Button></div>
      </Modal>
      <Modal open={modal?.type === "review"} onClose={() => setModal(null)} title="Rate your visit">
        <Field label="Rating">{(p) => <div className="flex gap-1" role="radiogroup" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} stars`} onClick={() => setForm({ ...form, rating: n })}><Star className={`h-8 w-8 ${n <= form.rating ? "fill-gold text-gold" : "text-line"}`} /></button>)}</div>}</Field>
        <Field label="Comment (optional)" className="mt-4">{(p) => <Textarea {...p} rows={3} maxLength={600} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />}</Field>
        <div className="mt-5 flex justify-end"><Button loading={busy} onClick={() => review(modal.appt)}>Submit review</Button></div>
      </Modal>
    </>
  );
}
