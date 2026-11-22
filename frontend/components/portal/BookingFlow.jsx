"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import clsx from "clsx";
import { api, fmtDate, fmtTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "../ui/Button.jsx";
import { Field, Input, Select, Textarea } from "../ui/Form.jsx";
import { Avatar } from "../public/Photo.jsx";
import { Skeleton, EmptyState } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";
import { nowToday } from "../public/today.js";

/** Department → doctor → date → slot → details. Slots come live from the database; booking is atomic on the server. */
export function BookingFlow({ patientId, initial = {}, onBooked }) {
  const { toast } = useToast();
  const [dept, setDept] = useState(initial.department || "");
  const [doctorId, setDoctorId] = useState(initial.doctor || "");
  const [date, setDate] = useState(initial.date || "");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");
  const depts = useFetch("/api/departments");
  const docs = useFetch(`/api/doctors${dept ? `?department=${dept}` : ""}`);
  const slots = useFetch(doctorId && date ? `/api/doctors/${doctorId}/slots?date=${date}` : null);
  const doctor = docs.data?.doctors.find((d) => d.id === doctorId);
  useEffect(() => setTime(""), [doctorId, date]);

  async function confirm(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      const r = await api("/api/appointments", { method: "POST", body: { doctorId, date, time, reason, ...(patientId && { patientId }) } });
      setDone({ ...r, doctor }); toast("Appointment confirmed"); onBooked?.(r);
    } catch (e2) {
      setErr(e2.fields?.reason || e2.message);
      if (e2.status === 409) { slots.reload(); setTime(""); }
    } finally { setBusy(false); }
  }
  if (done) return (
    <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="card mx-auto max-w-lg p-8 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
      <h2 className="mt-4 text-2xl font-semibold">Appointment confirmed</h2>
      <p className="mt-2 text-muted">Dr. {done.doctor?.name} · {fmtDate(done.date)} at {fmtTime(done.time)}</p>
      <p className="mt-1 text-sm text-muted">A confirmation was sent to your notifications and e-mail.</p>
      <Button className="mt-6" variant="outline" onClick={() => { setDone(null); setTime(""); setReason(""); slots.reload(); }}>Book another</Button>
    </motion.div>
  );
  return (
    <form onSubmit={confirm} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <section className="card p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">1 · Choose department &amp; doctor</h2>
          <Field label="Department">{(a) => <Select {...a} value={dept} onChange={(e) => { setDept(e.target.value); setDoctorId(""); }}><option value="">All departments</option>{depts.data?.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>}</Field>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Doctor">
            {docs.loading && [0, 1].map((i) => <Skeleton key={i} className="h-24" />)}
            {docs.data?.doctors.map((d) => (
              <button type="button" key={d.id} role="radio" aria-checked={doctorId === d.id} onClick={() => setDoctorId(d.id)}
                className={clsx("flex items-center gap-3 rounded-xl border p-3 text-left transition", doctorId === d.id ? "border-gold bg-gold/10 shadow-gold" : "border-line hover:border-gold/50")}>
                <Avatar name={d.name} src={d.image} className="h-12 w-12" />
                <span className="min-w-0"><span className="flex items-center gap-1 truncate text-sm font-semibold">Dr. {d.name}<BadgeCheck className="h-4 w-4 shrink-0 text-primary" /></span><span className="block truncate text-xs text-muted">{d.specialization}</span></span>
              </button>
            ))}
          </div>
          {docs.data && !docs.data.doctors.length && <div className="mt-4"><EmptyState title="No verified doctors here yet" text="Try another department." /></div>}
        </section>
        <section className="card p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">2 · Pick a date &amp; time</h2>
          <Field label="Date">{(a) => <Input {...a} type="date" min={nowToday()} value={date} onChange={(e) => setDate(e.target.value)} disabled={!doctorId} />}</Field>
          <div className="mt-4">
            {slots.loading && <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-10" />)}</div>}
            {slots.data && (slots.data.slots.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Available times">
                {slots.data.slots.map((s) => <button type="button" key={s.time} role="radio" aria-checked={time === s.time} onClick={() => setTime(s.time)} className={clsx("rounded-lg border px-2 py-2 text-sm font-medium transition", time === s.time ? "border-gold bg-gradient-to-br from-champagne to-gold text-[#2b2008]" : "border-line hover:border-primary hover:text-primary")}>{fmtTime(s.time)}</button>)}
              </div>
            ) : <p className="rounded-xl bg-sage/50 p-4 text-sm text-muted">No free times on this date. Try another day.</p>)}
            {slots.error && <p className="text-sm text-red-600">{slots.error}</p>}
          </div>
        </section>
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card space-y-4 p-6">
          <h2 className="font-sans text-base font-semibold">3 · Confirm</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted">Doctor</dt><dd className="text-right font-medium">{doctor ? `Dr. ${doctor.name}` : "–"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Date</dt><dd className="font-medium">{date ? fmtDate(date) : "–"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Time</dt><dd className="font-medium">{time ? fmtTime(time) : "–"}</dd></div>
            {doctor?.consultationFee > 0 && <div className="flex justify-between gap-3"><dt className="text-muted">Fee</dt><dd className="font-medium">₹{doctor.consultationFee}</dd></div>}
          </dl>
          <Field label="Reason for visit" error={err}>{(a) => <Textarea {...a} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly describe your symptoms or purpose" maxLength={500} />}</Field>
          <Button className="w-full" variant="gold" loading={busy} disabled={!doctorId || !date || !time || reason.trim().length < 3}><CalendarCheck className="h-4 w-4" />Confirm appointment</Button>
          <p className="flex items-center gap-2 text-xs text-muted"><Clock className="h-3.5 w-3.5" />Not for emergencies. Call your local emergency number.</p>
        </div>
      </aside>
    </form>
  );
}
