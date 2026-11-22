import { Tilt3D } from "@/components/ui/Tilt3D.jsx";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDepartments } from "@/lib/public-data.js";
import { PageHero } from "@/components/public/PageHero.jsx";
import { DeptIcon } from "@/components/public/DeptIcon.jsx";
import { Stagger, StaggerItem } from "@/components/layout/Reveal.jsx";
export const metadata = { title: "Departments" };
export const dynamic = "force-dynamic";
export default async function Departments() {
  const departments = await getDepartments();
  return (<>
    <PageHero eyebrow="Medical departments" title="Specialties that work together" text="Explore our departments and meet the verified doctors in each." />
    <section className="section mt-14">
      {departments.length ? <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{departments.map((d) => (
        <StaggerItem key={d.id}><Tilt3D className="h-full"><Link href={`/doctors?department=${d.id}`} className="card group flex h-full flex-col p-7 transition hover:-translate-y-1 hover:shadow-gold">
          <span className="mb-4 inline-flex w-fit rounded-xl bg-gradient-to-br from-forest to-primary p-3.5 text-champagne"><DeptIcon name={d.icon} className="h-7 w-7" /></span>
          <h2 className="text-xl font-semibold">{d.name}</h2><p className="mt-2 flex-1 text-sm text-muted">{d.description}</p>
          <span className="mt-5 flex items-center gap-1 text-sm font-medium text-primary">View doctors <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link></Tilt3D></StaggerItem>))}</Stagger>
        : <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No departments are published yet.</p>}
    </section></>);
}
