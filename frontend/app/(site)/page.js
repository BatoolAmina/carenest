import Link from "next/link";
import { ArrowRight, CalendarCheck, FileHeart, Lock, ShieldCheck, Siren, Quote, Star, Search, HeartPulse } from "lucide-react";
import { Tilt3D } from "@/components/ui/Tilt3D.jsx";
import { CountUp } from "@/components/ui/CountUp.jsx";
import { getHomeData } from "@/lib/public-data.js";
import { HomeBooking } from "@/components/public/HomeBooking.jsx";
import { HeroVisual } from "@/components/public/HeroVisual.jsx";
import { DoctorCard } from "@/components/public/DoctorCard.jsx";
import { DeptIcon } from "@/components/public/DeptIcon.jsx";
import { Photo } from "@/components/public/Photo.jsx";
import { Reveal, Stagger, StaggerItem } from "@/components/layout/Reveal.jsx";
import { ButtonLink } from "@/components/ui/Button.jsx";

export const dynamic = "force-dynamic";

const features = [
  [ShieldCheck, "Verified doctors only", "Every specialist is vetted by our administration: credentials, registration and hospital affiliation."],
  [CalendarCheck, "Real-time booking", "Live availability with instant confirmation. No double bookings, no phone tag."],
  [FileHeart, "One connected record", "Prescriptions, reports and history in one secure place, shared only with your treating doctors."],
  [Lock, "Privacy by design", "Role-based access, audit trails and encrypted sessions protect every record."],
];
const steps = [["01", Search, "Find your specialist", "Browse verified doctors by department and read real patient reviews."], ["02", CalendarCheck, "Pick a time", "See live availability and confirm in seconds. No calls, no waiting."], ["03", HeartPulse, "Get connected care", "Your records, prescriptions and follow-ups stay in one secure place."]];
const facilities = [["Building2", "Modern OPD suites"], ["Microscope", "Diagnostics & lab"], ["Pill", "In-house pharmacy"], ["BedDouble", "Comfort inpatient rooms"]];

export default async function Home() {
  const { departments, doctors, reviews, stats, offline } = await getHomeData();
  return (
    <>
      <section className="cinema-hero relative overflow-hidden">
        <div className="cinema-scanline" aria-hidden />
        <div className="cinema-vignette" aria-hidden />
        <div className="section relative z-10 grid min-h-[calc(100svh-4.5rem)] items-center gap-10 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="cinema-copy">
            <Reveal><p className="eyebrow">A complete digital hospital</p></Reveal>
            <Reveal delay={.06}><h1 className="cinema-title mt-4 text-[2.4rem] font-semibold leading-[.98] sm:text-5xl lg:text-[clamp(3.75rem,5vw,5.5rem)]">Care today,<br /><span className="gold-text italic">brighter tomorrows.</span></h1></Reveal>
            <Reveal delay={.12}><p className="mt-6 max-w-xl text-xl leading-relaxed text-muted">Verified specialists, connected departments and a record that follows you, all under one roof, all a few taps away.</p></Reveal>
            <Reveal delay={.2} className="mt-8 max-w-2xl"><HomeBooking departments={departments} /></Reveal>
            <Reveal delay={.28} className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2"><Siren className="h-4 w-4 text-gold" />24×7 emergency care</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" />Admin-verified doctors</span>
            </Reveal>
          </div>
          <HeroVisual />
        </div>
        <div className="cinema-scroll-cue" aria-hidden><span />Scroll to explore</div>
      </section>

      <section className="section">
        <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[[stats.patients, "Patients registered"], [stats.doctors, "Verified doctors"], [stats.departments, "Departments"], ["24×7", "Emergency desk"]].map(([v, l]) => (
            <StaggerItem key={l}><Tilt3D className="h-full"><div className="card p-5 text-center"><p className="font-display text-3xl font-semibold text-primary">{typeof v === "number" ? <CountUp to={v} /> : v}</p><p className="mt-1 text-sm text-muted">{l}</p></div></Tilt3D></StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="section mt-24">
        <Reveal><p className="eyebrow">How it works</p><h2 className="mt-2 max-w-2xl text-3xl font-semibold sm:text-4xl">Care in three calm steps</h2></Reveal>
        <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([n, I, t, d]) => (
            <StaggerItem key={n}><Tilt3D className="h-full"><div className="card relative h-full overflow-hidden p-7">
              <span aria-hidden className="absolute -right-2 -top-8 font-display text-[8rem] font-bold leading-none text-gold/15">{n}</span>
              <span className="relative inline-flex rounded-xl bg-gradient-to-br from-forest to-primary p-3 text-champagne shadow-gold"><I className="h-6 w-6" /></span>
              <h3 className="relative mt-5 font-display text-xl font-semibold">{t}</h3><p className="relative mt-2 text-sm text-muted">{d}</p>
            </div></Tilt3D></StaggerItem>))}
        </Stagger>
      </section>

      <section className="section mt-24">
        <Reveal><p className="eyebrow">Medical departments</p><h2 className="mt-2 max-w-2xl text-3xl font-semibold sm:text-4xl">Specialist care, every discipline in one place</h2></Reveal>
        {departments.length ? (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.slice(0, 8).map((d) => (
              <StaggerItem key={d.id}>
                <Tilt3D className="h-full"><Link href={`/doctors?department=${d.id}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:shadow-gold">
                  <span className="mb-4 inline-flex w-fit rounded-xl bg-gradient-to-br from-forest to-primary p-3 text-champagne"><DeptIcon name={d.icon} className="h-6 w-6" /></span>
                  <h3 className="font-display text-lg font-semibold">{d.name}</h3>
                  <p className="mt-1 line-clamp-3 text-sm text-muted">{d.description}</p>
                  <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-primary">Meet the team <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </Link></Tilt3D>
              </StaggerItem>
            ))}
          </Stagger>
        ) : <p className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center text-muted">{offline ? "Departments will appear once the database is connected." : "Departments will appear here once an administrator adds them."}</p>}
      </section>

      <section className="section mt-24 grid items-center gap-12 lg:grid-cols-2">
        <Reveal><Photo src="/images/about.jpg" alt="CareNest hospital interior" icon="Building2" className="aspect-[4/3] w-full rounded-[2rem] border border-gold/30 shadow-soft" /></Reveal>
        <div>
          <Reveal><p className="eyebrow">Why CareNest</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">A hospital designed around trust</h2></Reveal>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map(([I, t, d]) => (<StaggerItem key={t}><div><span className="mb-3 inline-flex rounded-xl bg-sage/70 p-2.5 text-primary"><I className="h-5 w-5" /></span><h3 className="font-sans text-base font-semibold">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></div></StaggerItem>))}
          </Stagger>
        </div>
      </section>

      <section className="section mt-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="eyebrow">Our doctors</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Featured specialists</h2></div>
          <ButtonLink href="/doctors" variant="outline" size="sm">All doctors <ArrowRight className="h-4 w-4" /></ButtonLink>
        </Reveal>
        {doctors.length ? <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{doctors.map((d) => <StaggerItem key={d.id}><DoctorCard d={d} /></StaggerItem>)}</Stagger>
          : <p className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center text-muted">Doctors appear here once they complete verification and are approved by administration.</p>}
      </section>

      <section className="section mt-24">
        <Reveal><p className="eyebrow">Facilities</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Everything under one roof</h2></Reveal>
        <Stagger className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {facilities.map(([I, t], i) => (<StaggerItem key={t}><Tilt3D className="h-full"><div className="card overflow-hidden"><Photo src={`/images/facility-${i + 1}.jpg`} alt={t} icon={I} className="aspect-[4/3] w-full" /><p className="p-4 text-sm font-semibold">{t}</p></div></Tilt3D></StaggerItem>))}
        </Stagger>
      </section>

      {reviews.length > 0 && (
        <section className="section mt-24">
          <Reveal><p className="eyebrow">Patient stories</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Words from our patients</h2></Reveal>
          <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {reviews.map((r) => (
              <StaggerItem key={r.id}><figure className="card h-full p-6"><Quote className="h-6 w-6 text-gold" /><blockquote className="mt-3 text-sm leading-relaxed">{r.comment}</blockquote>
                <figcaption className="mt-4 flex items-center justify-between text-sm"><span className="font-semibold">{r.author}</span><span className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</span></figcaption></figure></StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="section mt-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-forest to-primary p-10 text-center shadow-gold sm:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgb(var(--gold)/.35),transparent_55%)]" aria-hidden />
            <h2 className="relative text-3xl font-semibold text-white sm:text-4xl">Your health deserves a calmer experience.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/80">Create your free CareNest account and book your first visit in under two minutes.</p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3"><ButtonLink href="/register" variant="gold" size="lg">Create account</ButtonLink><ButtonLink href="/book" variant="outline" size="lg" className="!bg-white/10 !text-white !border-white/30">Book appointment</ButtonLink></div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
