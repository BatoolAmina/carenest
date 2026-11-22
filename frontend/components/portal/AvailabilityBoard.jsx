"use client";
import { useEffect, useState } from "react";
import { api, fmtTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Input } from "../ui/Form.jsx";
import { Avatar } from "../public/Photo.jsx";
import { EmptyState, SkeletonRows } from "../ui/Misc.jsx";
import { nowToday } from "../public/today.js";

/** Live free slots for every approved doctor on a chosen date (same endpoint the booking flow uses). */
export function AvailabilityBoard() {
  const [date, setDate] = useState(nowToday());
  const docs = useFetch("/api/doctors");
  const [rows, setRows] = useState(null);
  useEffect(() => {
    if (!docs.data) return; let live = true; setRows(null);
    Promise.all(docs.data.doctors.map(async (d) => ({ d, slots: (await api(`/api/doctors/${d.id}/slots?date=${date}`).catch(() => ({ slots: [] }))).slots })))
      .then((r) => live && setRows(r));
    return () => { live = false; };
  }, [docs.data, date]);
  return (
    <div>
      <Input type="date" min={nowToday()} value={date} onChange={(e) => setDate(e.target.value)} className="mb-6 max-w-[12rem]" aria-label="Date" />
      {(docs.loading || !rows) && <SkeletonRows />}
      {rows && (rows.length ? <ul className="space-y-3">{rows.map(({ d, slots }) => (
        <li key={d.id} className="card p-4"><div className="flex items-center gap-3"><Avatar name={d.name} src={d.image} className="h-11 w-11 text-sm" /><div><p className="font-semibold">Dr. {d.name}</p><p className="text-xs text-muted">{d.specialization} · {d.department?.name}</p></div><span className="ml-auto text-sm text-muted">{slots.length} free</span></div>
          <div className="mt-3 flex flex-wrap gap-1.5">{slots.length ? slots.map((s) => <span key={s.time} className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{fmtTime(s.time)}</span>) : <span className="text-xs text-muted">No availability on this date</span>}</div></li>))}</ul>
        : <EmptyState title="No approved doctors yet" />)}
    </div>
  );
}
