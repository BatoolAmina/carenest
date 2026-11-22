"use client";
import { useEffect, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { Input, Select } from "../ui/Form.jsx";
import { Skeleton, EmptyState, ErrorState } from "../ui/Misc.jsx";
import { DoctorCard } from "./DoctorCard.jsx";

export function DoctorsExplorer({ initialDepartment = "" }) {
  const [dept, setDept] = useState(initialDepartment);
  const [q, setQ] = useState(""); const [dq, setDq] = useState("");
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const depts = useFetch("/api/departments");
  const params = new URLSearchParams(); if (dept) params.set("department", dept); if (dq) params.set("q", dq);
  const docs = useFetch(`/api/doctors?${params}`);
  return (
    <div>
      <div className="glass-strong grid gap-3 rounded-2xl p-4 sm:grid-cols-[1fr_16rem]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" placeholder="Search by name or specialty" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search doctors" /></div>
        <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department"><option value="">All departments</option>{depts.data?.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
      </div>
      <div className="mt-8">
        {docs.error && <ErrorState message={docs.error} onRetry={docs.reload} />}
        {docs.loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40" />)}</div>}
        {docs.data && (docs.data.doctors.length
          ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{docs.data.doctors.map((d) => <DoctorCard key={d.id} d={d} />)}</div>
          : <EmptyState icon={Stethoscope} title="No doctors found" text="Only verified, approved doctors are listed. Adjust your search or department." />)}
      </div>
    </div>
  );
}
