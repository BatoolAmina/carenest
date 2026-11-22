import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Logo } from "./Logo.jsx";

export function SiteFooter() {
  const address = process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "CareNest Hospital";
  const emergency = process.env.NEXT_PUBLIC_EMERGENCY_PHONE;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@carenest.health";
  return (
    <footer className="mt-24 border-t border-line/70 bg-surface/50">
      <div className="gold-rule" />
      <div className="section grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo className="h-20" />
          <p className="mt-3 text-sm text-muted">A complete digital hospital: verified specialists, connected departments, and care that feels effortless.</p>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold">Hospital</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">{[["/about", "About CareNest"], ["/departments", "Departments"], ["/doctors", "Our doctors"], ["/services", "Services"], ["/facilities", "Facilities"]].map(([h, l]) => <li key={h}><Link className="hover:text-primary" href={h}>{l}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold">Patients &amp; staff</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">{[["/book", "Book an appointment"], ["/register", "Create patient account"], ["/login", "Sign in"], ["/register/doctor", "Doctor registration"], ["/faq", "FAQs"]].map(([h, l]) => <li key={h}><Link className="hover:text-primary" href={h}>{l}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold">Contact</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-muted">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{address}</li>
            {emergency
              ? <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold" />Emergency: {emergency}</li>
              : <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold" />Emergency: call your local emergency service</li>}
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold" />{supportEmail}</li>
            <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-gold" />OPD 9:00–17:00 · Emergency 24×7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} CareNest Hospital. For emergencies, call your local emergency number immediately — online booking is not for urgent care.
      </div>
    </footer>
  );
}
