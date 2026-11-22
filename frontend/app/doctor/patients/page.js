"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { Input } from "@/components/ui/Form.jsx";
import { EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { Avatar } from "@/components/public/Photo.jsx";
export default function Page() {
  const [q, setQ] = useState(""); const [dq, setDq] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, loading } = useFetch(`/api/patients?q=${encodeURIComponent(dq)}`);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="My patients" subtitle="Patients you have an appointment with. Access is logged." />
      <div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Search by name, MRN or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /></div>
      {loading && <SkeletonRows />}
      {data && (data.patients.length ? <ul className="space-y-3">{data.patients.map((p) => <li key={p.id}><Link href={`/doctor/patients/${p.id}`} className="card flex items-center gap-4 p-4 transition hover:border-gold/60"><Avatar name={p.name} className="h-11 w-11 text-sm" /><div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-sm text-muted">{p.mrn} · {p.gender}{p.dob ? ` · DOB ${p.dob}` : ""}</p></div><ChevronRight className="h-5 w-5 text-muted" /></Link></li>)}</ul>
        : <EmptyState icon={Users} title="No patients yet" text="Patients appear here once they book with you." />)}
    </div>
  );
}
