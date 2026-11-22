"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
const items = [
  ["How do I book an appointment?", "Create a free patient account, choose a department and an approved doctor, pick an available date and time, and confirm. You will receive an e-mail and in-app confirmation."],
  ["Can I cancel or reschedule?", "Yes. From your dashboard you can cancel or reschedule up to 2 hours before the visit. Closer to the time, please contact reception."],
  ["Why are some doctors not listed?", "Only doctors who verified their hospital e-mail AND were approved by our administration after a credential review appear publicly and accept bookings."],
  ["Who can see my medical records?", "You, and the doctors currently treating you. Reception and administrative staff cannot open clinical records. Every doctor access is logged."],
  ["What should I bring to my visit?", "A photo ID, any previous reports or prescriptions, and a list of current medicines. You can also upload reports to your record beforehand."],
  ["Is online booking for emergencies?", "No. In an emergency call your local emergency number or go to the nearest emergency department immediately."],
  ["I forgot my password.", "Use “Forgot password” on the sign-in page. A reset link valid for 30 minutes will be sent to your e-mail."],
];
export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-3">
      {items.map(([q, a], i) => (
        <div key={q} className="card overflow-hidden">
          <button className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            {q}<ChevronDown className={`h-5 w-5 shrink-0 text-gold transition ${open === i ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence initial={false}>{open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm text-muted">{a}</p></motion.div>}</AnimatePresence>
        </div>
      ))}
    </div>
  );
}
