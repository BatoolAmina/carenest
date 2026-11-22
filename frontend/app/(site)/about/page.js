import { Tilt3D } from "@/components/ui/Tilt3D.jsx";
import { HeartHandshake, Eye, Gem, HeartPulse, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/public/PageHero.jsx";
import { Photo } from "@/components/public/Photo.jsx";
import { Stagger, StaggerItem, Reveal } from "@/components/layout/Reveal.jsx";
import { getHomeData } from "@/lib/public-data.js";
export const metadata = { title: "About" };
const values = [[HeartHandshake, "Compassion first", "Every process is designed to reduce worry for patients and families."], [Eye, "Transparency", "Clear verification, clear schedules, clear records, always in your control."], [Gem, "Clinical excellence", "Credentialed specialists supported by connected, modern systems."]];
export default async function About() {
  const { stats } = await getHomeData();
  return (<>
    <PageHero eyebrow="About CareNest" title="One hospital. One record. One standard of care." text="CareNest brings our doctors, departments, reception and administration onto a single digital platform, so care is coordinated rather than fragmented."
      visual={
        <div className="relative aspect-square">
          <div className="absolute inset-[8%] rounded-full border border-gold/30" aria-hidden />
          <div className="absolute inset-[20%] rounded-full border border-primary/25" aria-hidden />
          <div className="absolute inset-0 rounded-[2rem] border border-line/70 bg-gradient-to-br from-surface/90 to-sage/50 shadow-soft backdrop-blur-xl" aria-hidden />
          <div className="relative flex h-full flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-primary text-champagne shadow-gold"><HeartPulse className="h-8 w-8" /></span>
            <p className="mt-5 font-display text-2xl font-semibold">Connected care</p>
            <p className="mt-1 max-w-[12rem] text-xs text-muted">One team, one record, every step coordinated.</p>
          </div>
        </div>
      } />
    <section className="section mt-16 grid items-center gap-12 lg:grid-cols-2">
      <Reveal>
        <div className="relative">
          <Photo src="/images/about.jpg" alt="CareNest care team" icon="HeartHandshake" className="aspect-[4/3] w-full rounded-[2rem] border border-gold/30" />
          <div className="glass-strong absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft">
            <span className="rounded-xl bg-primary/15 p-2 text-primary"><ShieldCheck className="h-5 w-5" /></span>
            <div><p className="text-sm font-semibold">Verified care network</p><p className="text-xs text-muted">Hospital-affiliated doctors</p></div>
          </div>
        </div>
      </Reveal>
      <Reveal delay={.1}><h2 className="text-3xl font-semibold">A digital-first hospital, built carefully</h2>
        <p className="mt-4 text-muted">Unlike a marketplace of independent clinics, CareNest is a single institution. Every doctor on this platform is affiliated with the hospital and individually verified by our administration before patients can see or book them.</p>
        <p className="mt-3 text-muted">Patients, doctors, reception and administrators each work in a dedicated portal with exactly the permissions their role requires, and sensitive clinical information is visible only to the patient and their treating doctors.</p></Reveal>
    </section>
    <section className="section mt-12">
      <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[[stats.departments || "–", "Departments"], [stats.doctors || "–", "Verified doctors"], [stats.patients || "–", "Registered patients"], ["24×7", "Emergency support"]].map(([value, label]) => (
          <StaggerItem key={label}><div className="card p-5 text-center"><p className="font-display text-2xl font-semibold text-primary">{value}</p><p className="mt-1 text-xs text-muted">{label}</p></div></StaggerItem>
        ))}
      </Stagger>
    </section>
    <section className="section mt-20"><Stagger className="grid gap-5 md:grid-cols-3">{values.map(([I, t, d]) => <StaggerItem key={t}><Tilt3D className="h-full"><div className="card h-full p-7"><span className="inline-flex rounded-xl bg-gradient-to-br from-forest to-primary p-3 text-champagne"><I className="h-6 w-6" /></span><h3 className="mt-4 font-display text-xl font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></div></Tilt3D></StaggerItem>)}</Stagger></section>
  </>);
}
