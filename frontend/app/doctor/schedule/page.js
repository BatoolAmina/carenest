"use client";
import { useEffect, useState } from "react";
import { Save, Plus, Trash2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Input, Select } from "@/components/ui/Form.jsx";
import { PageHeader, SkeletonRows, ErrorState } from "@/components/ui/Misc.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
import { nowToday } from "@/components/public/today.js";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export default function Page() {
  const { toast } = useToast(); const { data, loading, error } = useFetch("/api/doctor/availability");
  const [conflicts, setConflicts] = useState([]); const [a, setA] = useState(null); const [busy, setBusy] = useState(false); const [off, setOff] = useState({ date: "", reason: "" });
  useEffect(() => { if (data) setA(JSON.parse(JSON.stringify(data.availability))); }, [data]);
  if (loading || !a) return error ? <ErrorState message={error} /> : <SkeletonRows rows={7} />;
  const setDay = (i, patch) => setA({ ...a, weekly: a.weekly.map((w, j) => (j === i ? { ...w, ...patch } : w)) });
  const brk = (w) => w.breaks?.[0] || { start: "", end: "" };
  async function save() {
    setBusy(true);
    try {
      const payload = { slotMinutes: Number(a.slotMinutes), daysOff: a.daysOff.map(({ date, reason }) => ({ date, reason: reason || "" })), weekly: a.weekly.map((w) => ({ day: w.day, enabled: w.enabled, start: w.start, end: w.end, breaks: w.breaks?.[0]?.start && w.breaks[0].end ? [{ start: w.breaks[0].start, end: w.breaks[0].end }] : [] })) };
      const r = await api("/api/doctor/availability", { method: "PUT", body: payload }); setConflicts(r.conflicts || []); toast(r.conflicts?.length ? "Schedule saved. Some bookings need your attention." : "Schedule saved");
    } catch (e) { toast(e.message, "error"); } finally { setBusy(false); }
  }
  async function resolve() {
    if (!confirm(`Cancel ${conflicts.length} appointment(s) and notify the patients?`)) return;
    try { const r = await api("/api/doctor/schedule-conflicts", { method: "POST" }); toast(`${r.cancelled} appointment(s) cancelled and patients notified`); setConflicts([]); } catch (e) { toast(e.message, "error"); }
  }
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader title="Schedule" subtitle="Working hours, breaks and days off. Patients can only book inside these windows." action={<Button loading={busy} onClick={save}><Save className="h-4 w-4" />Save schedule</Button>} />
      {conflicts.length > 0 && (
        <div className="card border-amber-400/60 bg-amber-500/10 p-5" role="alert">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-5 w-5 text-amber-500" />{conflicts.length} booked appointment(s) no longer fit your schedule</p>
          <p className="mt-1 text-sm text-muted">Existing bookings are never changed silently. Reception and administrators were notified. You can cancel them now and the patients will be told to rebook.</p>
          <ul className="mt-3 max-h-40 overflow-y-auto text-sm">{conflicts.map((c) => <li key={c.id}>{c.date} · {c.time} — {c.patient}</li>)}</ul>
          <Button className="mt-3" variant="danger" size="sm" onClick={resolve}>Cancel these &amp; notify patients</Button>
        </div>)}
      <div className="card p-5"><label className="text-sm font-medium">Appointment length</label><Select className="mt-1.5 max-w-xs" value={a.slotMinutes} onChange={(e) => setA({ ...a, slotMinutes: e.target.value })}>{[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}</Select></div>
      <div className="card divide-y divide-line/70 overflow-hidden">
        {a.weekly.map((w, i) => (
          <div key={w.day} className="grid items-center gap-3 p-4 sm:grid-cols-[9rem_1fr_1fr]">
            <label className="flex items-center gap-3 font-medium"><input type="checkbox" className="h-4 w-4 accent-[rgb(var(--primary))]" checked={w.enabled} onChange={(e) => setDay(i, { enabled: e.target.checked })} />{DAYS[w.day]}</label>
            <div className={`flex items-center gap-2 text-sm ${w.enabled ? "" : "opacity-40"}`}><Input type="time" disabled={!w.enabled} value={w.start} onChange={(e) => setDay(i, { start: e.target.value })} aria-label={`${DAYS[w.day]} start`} />–<Input type="time" disabled={!w.enabled} value={w.end} onChange={(e) => setDay(i, { end: e.target.value })} aria-label={`${DAYS[w.day]} end`} /></div>
            <div className={`flex items-center gap-2 text-sm ${w.enabled ? "" : "opacity-40"}`}><span className="text-muted">Break</span><Input type="time" disabled={!w.enabled} value={brk(w).start} onChange={(e) => setDay(i, { breaks: [{ ...brk(w), start: e.target.value }] })} aria-label="Break start" />–<Input type="time" disabled={!w.enabled} value={brk(w).end} onChange={(e) => setDay(i, { breaks: [{ ...brk(w), end: e.target.value }] })} aria-label="Break end" /></div>
          </div>))}
      </div>
      <div className="card p-5"><h2 className="font-sans text-base font-semibold">Days off</h2>
        <div className="mt-3 flex flex-wrap gap-2"><Input type="date" className="max-w-[11rem]" min={nowToday()} value={off.date} onChange={(e) => setOff({ ...off, date: e.target.value })} aria-label="Date off" /><Input className="max-w-xs" placeholder="Reason (optional)" value={off.reason} onChange={(e) => setOff({ ...off, reason: e.target.value })} /><Button variant="outline" disabled={!off.date || a.daysOff.some((d) => d.date === off.date)} onClick={() => { setA({ ...a, daysOff: [...a.daysOff, off].sort((x, y) => x.date.localeCompare(y.date)) }); setOff({ date: "", reason: "" }); }}><Plus className="h-4 w-4" />Add</Button></div>
        <ul className="mt-4 space-y-2">{a.daysOff.map((d) => <li key={d.date} className="flex items-center justify-between rounded-lg bg-sage/40 px-3 py-2 text-sm"><span>{d.date}{d.reason && <span className="text-muted"> · {d.reason}</span>}</span><button aria-label={`Remove ${d.date}`} onClick={() => setA({ ...a, daysOff: a.daysOff.filter((x) => x.date !== d.date) })}><Trash2 className="h-4 w-4 text-muted hover:text-red-500" /></button></li>)}{!a.daysOff.length && <li className="text-sm text-muted">No days off scheduled.</li>}</ul></div>
    </div>
  );
}
