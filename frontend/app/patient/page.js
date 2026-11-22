"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CalendarPlus, CalendarDays, FileHeart, Pill, AlertTriangle, Bell } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { fmtDate, fmtTime } from "@/lib/client.js";
import { PageHeader, StatCard, EmptyState, Badge } from "@/components/ui/Misc.jsx";
import { ButtonLink } from "@/components/ui/Button.jsx";
import { AppointmentTable } from "@/components/portal/AppointmentTable.jsx";

export default function PatientHome() {
  const { data: s } = useSession();
  const up = useFetch("/api/appointments?scope=upcoming");
  const sum = useFetch("/api/patient/summary");
  const next = up.data?.appointments[0];
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title={`Welcome${s?.user?.name ? `, ${s.user.name.split(" ")[0]}` : ""}`} subtitle="Your care, at a glance." action={<ButtonLink href="/book" variant="gold"><CalendarPlus className="h-4 w-4" />Book appointment</ButtonLink>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Upcoming visits" value={sum.data?.summary?.upcoming} />
        <StatCard icon={FileHeart} label="Completed visits" value={sum.data?.summary?.completed} hint={`${sum.data?.summary?.records ?? 0} records on file`} />
        <Link href="/patient/prescriptions" className="block"><StatCard icon={Pill} label="Prescriptions" value={sum.data?.summary?.prescriptions} hint="View all" /></Link>
        <Link href="/patient/notifications" className="block"><StatCard icon={Bell} label="Unread notifications" value={sum.data?.summary?.unread} /></Link>
      </div>
      {sum.data?.summary?.allergies?.length > 0 && <div className="card mt-6 flex flex-wrap items-center gap-2 border-red-400/40 p-4"><AlertTriangle className="h-5 w-5 text-red-500" /><span className="text-sm font-semibold">Allergies on file:</span>{sum.data.summary.allergies.map((a, i) => <Badge key={i} tone={a.severity === "severe" ? "red" : "amber"}>{a.title}</Badge>)}</div>}
      {sum.data?.summary?.latestPrescription && <div className="card mt-6 p-5"><p className="eyebrow">Latest prescription</p><p className="mt-2 font-medium">Dr. {sum.data.summary.latestPrescription.doctor}</p><p className="text-sm text-muted">{sum.data.summary.latestPrescription.medicines.join(", ")}</p></div>}
      {next && <div className="card mt-6 border-gold/50 bg-gradient-to-r from-gold/10 to-transparent p-6"><p className="eyebrow">Next appointment</p><p className="mt-2 font-display text-2xl font-semibold">{fmtDate(next.date)} · {fmtTime(next.time)}</p><p className="text-muted">Dr. {next.doctor?.name} · {next.department?.name}</p></div>}
      <h2 className="mb-4 mt-10 font-sans text-lg font-semibold">Upcoming appointments</h2>
      <AppointmentTable role="patient" query="scope=upcoming" empty={<EmptyState icon={CalendarDays} title="No upcoming appointments" text="Book a visit with a verified specialist." action={<ButtonLink href="/book">Book now</ButtonLink>} />} />
    </div>
  );
}
