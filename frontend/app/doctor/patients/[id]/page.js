"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Droplet, Phone } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { ErrorState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { RecordsPanel } from "@/components/portal/RecordsPanel.jsx";
import { AppointmentTable } from "@/components/portal/AppointmentTable.jsx";
export default function Page() {
  const { id } = useParams(); const [tab, setTab] = useState("records");
  const { data, loading, error } = useFetch(`/api/patients/${id}`);
  if (loading) return <SkeletonRows />;
  if (error) return <ErrorState message={error} />;
  const p = data.patient;
  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/doctor/patients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" />Patients</Link>
      <PageHeader title={p.name} subtitle={`${p.mrn} · ${p.gender}${p.dob ? ` · DOB ${p.dob}` : ""}`} />
      <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted">{p.bloodGroup && <span className="flex items-center gap-1.5"><Droplet className="h-4 w-4 text-red-500" />{p.bloodGroup}</span>}{p.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gold" />{p.phone}</span>}</div>
      <div className="mb-5 inline-flex rounded-xl border border-line p-1" role="tablist">{[["records", "Records"], ["prescriptions", "Prescriptions"], ["visits", "Visits"]].map(([t, l]) => <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${tab === t ? "bg-gradient-to-br from-forest to-primary text-white" : "text-muted"}`}>{l}</button>)}</div>
      {tab === "records" && <RecordsPanel patientId={id} role="doctor" />}
      {tab === "prescriptions" && <RecordsPanel patientId={id} role="doctor" mode="prescriptions" />}
      {tab === "visits" && <AppointmentTable role="doctor" showDoctor={false} query="scope=past" />}
    </div>
  );
}
