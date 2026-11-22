import { Tilt3D } from "@/components/ui/Tilt3D.jsx";
import { PageHero } from "@/components/public/PageHero.jsx";
import { Photo } from "@/components/public/Photo.jsx";
import { Stagger, StaggerItem } from "@/components/layout/Reveal.jsx";
export const metadata = { title: "Facilities" };
const f = [["Building2", "Modern OPD suites", "Calm, well-lit consultation rooms with digital check-in and short waits."], ["Microscope", "Diagnostics & laboratory", "On-site pathology and imaging with results added to your record."], ["Pill", "In-house pharmacy", "Collect prescriptions on the way out."], ["BedDouble", "Inpatient comfort", "Private and shared rooms designed for rest and recovery."], ["Car", "Accessible & convenient", "Step-free access, wheelchair assistance and visitor parking."], ["Coffee", "Family lounge", "A quiet space for families to wait and refresh."]];
export default function Facilities() {
  return (<><PageHero eyebrow="Hospital facilities" title="Spaces designed for healing." text="Explore the spaces and services that make every CareNest visit calm, connected and comfortable." />
    <section className="section mt-14"><Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{f.map(([I, t, d], i) => <StaggerItem key={t}><Tilt3D className="h-full"><div className="card overflow-hidden"><Photo src={`/images/facility-${(i % 4) + 1}.jpg`} alt={t} icon={I} className="aspect-[16/10] w-full" /><div className="p-6"><h2 className="font-display text-xl font-semibold">{t}</h2><p className="mt-2 text-sm text-muted">{d}</p></div></div></Tilt3D></StaggerItem>)}</Stagger></section></>);
}
