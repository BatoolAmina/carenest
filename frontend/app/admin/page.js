"use client";
import Link from "next/link";
import { Users, Stethoscope, ShieldCheck, CalendarDays, UserCog, Activity } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { ErrorState, PageHeader, Skeleton, StatCard } from "@/components/ui/Misc.jsx";
import { Panel, TrendChart, RegistrationsChart, DepartmentChart, StatusChart } from "@/components/portal/AdminCharts.jsx";
import { fmtDateTime } from "@/lib/client.js";

export default function AdminHome() {
  const { data, loading, error, reload } = useFetch("/api/admin/stats");
  const audit = useFetch("/api/admin/audit");
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const c = data?.counts;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader title="Hospital analytics" subtitle="Live figures from the CareNest database." />
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-28" />)}</div> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={Users} label="Patients" value={c.patients} /><StatCard icon={Stethoscope} label="Verified doctors" value={c.doctors} />
          <Link href="/admin/doctors"><StatCard icon={ShieldCheck} label="Awaiting review" value={c.pendingDoctors} hint="Open verification queue" /></Link>
          <StatCard icon={CalendarDays} label="Today" value={c.todayAppts} /><StatCard icon={Activity} label="All appointments" value={c.totalAppts} /><StatCard icon={UserCog} label="Admin & reception staff" value={c.staff} />
        </div>)}
      {data && (<>
        <div className="grid gap-6 lg:grid-cols-3"><Panel title="Appointment trend (last 30 days → next 14)" className="lg:col-span-2"><TrendChart data={data.trend} /></Panel><Panel title="Appointment status"><StatusChart data={data.byStatus} /></Panel></div>
        <div className="grid gap-6 lg:grid-cols-2"><Panel title="Patient registrations (30 days)"><RegistrationsChart data={data.registrations} /></Panel><Panel title="Department performance"><DepartmentChart data={data.byDepartment} /></Panel></div>
      </>)}
      <section className="card p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-sm font-semibold">Recent activity</h2><Link href="/admin/audit" className="text-xs text-primary hover:underline">Full audit log</Link></div>
        <ul className="divide-y divide-line/60 text-sm">{audit.data?.logs.slice(0, 8).map((l) => <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2"><span><b>{l.actor}</b> <span className="text-muted">· {l.action}</span></span><span className="text-xs text-muted">{fmtDateTime(l.createdAt)}</span></li>)}{audit.data && !audit.data.logs.length && <li className="py-3 text-muted">No activity yet.</li>}</ul></section>
    </div>
  );
}
