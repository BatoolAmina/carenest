import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/public/PageHero.jsx";
import { ContactForm } from "@/components/public/ContactForm.jsx";
export const metadata = { title: "Contact" };
export default function Contact() {
  const address = process.env.NEXT_PUBLIC_HOSPITAL_ADDRESS || "CareNest Hospital";
  const emergency = process.env.NEXT_PUBLIC_EMERGENCY_PHONE;
  const reception = process.env.NEXT_PUBLIC_RECEPTION_PHONE;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@carenest.health";
  return (<><PageHero eyebrow="Contact" title="We're here to help." text="Send us a message and our team will reply by e-mail. For emergencies, call your local emergency number." />
    <section className="section mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="card space-y-5 p-7">
        {[
          [MapPin, "Address", address],
          [Phone, "Phone", emergency ? `Reception ${reception || "number not configured"} · Emergency ${emergency}` : reception ? `Reception ${reception}` : "Reception and emergency numbers are not configured"],
          [Mail, "E-mail", supportEmail],
          [Clock, "Hours", "OPD 9:00–17:00 · Emergency 24×7"],
        ].map(([I, t, d]) => <div key={t} className="flex gap-4"><span className="rounded-xl bg-sage/70 p-2.5 text-primary"><I className="h-5 w-5" /></span><div><p className="font-semibold">{t}</p><p className="text-sm text-muted">{d}</p></div></div>)}
      </div>
      <ContactForm />
    </section></>);
}
