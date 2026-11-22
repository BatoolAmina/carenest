"use client";
import { CalendarDays, CheckCheck, Star, Users, CalendarClock, UserX } from "lucide-react";

import { useFetch } from "@/hooks/useFetch.js";
import { fmtDateTime } from "@/lib/client.js";
import { PageHeader, SkeletonRows, StatCard } from "@/components/ui/Misc.jsx";
import { VerificationBanner } from "@/components/portal/VerificationBanner.jsx";
import { AppointmentTable } from "@/components/portal/AppointmentTable.jsx";
import { Panel, TrendChart, StatusChart } from "@/components/portal/AdminCharts.jsx";
import { nowToday } from "@/components/public/today.js";
import { ButtonLink } from "@/components/ui/Button.jsx";

export default function DoctorHome() {
  const me = useFetch("/api/doctor/me");
  const stats = useFetch("/api/doctor/stats");
  if (me.loading) return <SkeletonRows />;
  if (me.error) return <p className="text-red-600">{me.error}</p>;
  const { doctor, user } = me.data; const st = stats.data;
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={`Good day, Dr. ${user.name.replace(/^Dr\.?\s*/i, "").split(" ")[0]}`} subtitle={`${doctor.department?.name} · ${doctor.specialization}`} />
      <VerificationBanner verification={doctor.verification} />
      {!st?.approved && <ButtonLink href="/doctor/profile" variant="gold">Open profile &amp; verification</ButtonLink>}
      {st?.approved && (<>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard icon={CalendarDays} label="Today" value={st.counts.today} /><StatCard icon={CalendarClock} label="Upcoming" value={st.counts.upcoming} />
          <StatCard icon={CheckCheck} label="Completed this month" value={st.counts.completedThisMonth} /><StatCard icon={Users} label="Patients seen" value={st.counts.patientsSeen} />
          <StatCard icon={UserX} label="No-shows / cancelled" value={`${st.counts.noShow} / ${st.counts.cancelled}`} /><StatCard icon={Star} label="Rating" value={st.rating.count ? st.rating.avg : "New"} hint={`${st.rating.count} reviews`} />
        </div>
        <div className="grid gap-6 lg:grid-cols-3"><Panel title="Your activity (14 days back → 7 ahead)" className="lg:col-span-2"><TrendChart data={st.trend} /></Panel><Panel title="All-time outcomes"><StatusChart data={st.byStatus} /></Panel></div>
        <h2 className="font-sans text-lg font-semibold">Today’s schedule</h2>
        <AppointmentTable role="doctor" showPatient showDoctor={false} query={`date=${nowToday()}&status=booked,checked_in,completed`} />
        <section className="card p-5"><h2 className="font-sans text-sm font-semibold">Recent patient reviews</h2>
          <ul className="mt-3 divide-y divide-line/60 text-sm">{st.reviews.map((r) => <li key={r.id} className="py-3"><span className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}</span>{r.comment && <p className="mt-1">{r.comment}</p>}<p className="mt-1 text-xs text-muted">{fmtDateTime(r.createdAt)}</p></li>)}{!st.reviews.length && <li className="py-3 text-muted">No reviews yet.</li>}</ul></section>
      </>)}
    </div>
  );
}
