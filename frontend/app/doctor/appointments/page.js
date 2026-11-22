"use client";
import { useState } from "react";
import { PageHeader } from "@/components/ui/Misc.jsx";
import { AppointmentTable } from "@/components/portal/AppointmentTable.jsx";
export default function Page() {
  const [tab, setTab] = useState("upcoming");
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Appointments" subtitle="Manage statuses as patients arrive and visits finish." />
      <div className="mb-5 inline-flex rounded-xl border border-line p-1" role="tablist">{["upcoming", "past"].map((t) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize ${tab === t ? "bg-gradient-to-br from-forest to-primary text-white" : "text-muted"}`}>{t}</button>)}</div>
      <AppointmentTable key={tab} role="doctor" showPatient showDoctor={false} query={`scope=${tab}`} />
    </div>
  );
}
