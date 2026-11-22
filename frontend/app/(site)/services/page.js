import { Tilt3D } from "@/components/ui/Tilt3D.jsx";
import { Stethoscope, Siren, FlaskConical, ScanLine, Syringe, Baby, Pill, HeartPulse } from "lucide-react";
import { PageHero } from "@/components/public/PageHero.jsx";
import { ButtonLink } from "@/components/ui/Button.jsx";
import { Stagger, StaggerItem } from "@/components/layout/Reveal.jsx";
export const metadata = { title: "Services" };
const services = [[Stethoscope, "Outpatient consultations", "Scheduled visits with verified specialists across all departments."], [Siren, "Emergency care", "24×7 emergency desk with rapid triage. Call emergency services for life-threatening conditions."], [FlaskConical, "Laboratory", "Pathology and diagnostics with results added to your digital record."], [ScanLine, "Imaging", "X-ray, ultrasound and advanced imaging services."], [Syringe, "Vaccination & preventive care", "Immunisation, screening and annual health checks."], [Baby, "Maternal & child health", "Antenatal, paediatric and developmental care."], [Pill, "Pharmacy", "In-house pharmacy aligned to your prescriptions."], [HeartPulse, "Chronic care programs", "Long-term management for diabetes, hypertension and heart conditions."]];
export default function Services() {
  return (<><PageHero eyebrow="Medical services" title="Comprehensive care, coordinated." text="From a first consultation to long-term follow-up, your care team shares one record." />
    <section className="section mt-14"><Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{services.map(([I, t, d]) => <StaggerItem key={t}><Tilt3D className="h-full"><div className="card h-full p-6"><I className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg font-semibold">{t}</h2><p className="mt-2 text-sm text-muted">{d}</p></div></Tilt3D></StaggerItem>)}</Stagger>
      <div className="mt-12 text-center"><ButtonLink href="/book" variant="gold" size="lg">Book an appointment</ButtonLink></div></section></>);
}
