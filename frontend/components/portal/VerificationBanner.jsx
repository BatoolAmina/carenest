import { ShieldCheck, ShieldAlert, Hourglass, MailWarning, FileWarning, ShieldX } from "lucide-react";
import { VerificationBadge } from "../ui/Misc.jsx";
const COPY = {
  email_unverified: [MailWarning, "Verify your hospital e-mail", "Enter the code we e-mailed you (or open the link) to prove you own this address. Then you can submit credentials."],
  documents_pending: [FileWarning, "Complete your credentials", "Add your qualifications, registration details and supporting documents, then submit for review."],
  under_review: [Hourglass, "Application under review", "Administration is reviewing your credentials. You’ll be notified by e-mail and in-app."],
  changes_requested: [ShieldAlert, "Corrections requested", "Please address the administrator’s note below and resubmit."],
  approved: [ShieldCheck, "You’re verified", "You’re visible to patients and can accept appointments."],
  rejected: [ShieldX, "Application not approved", "Contact administration if you believe this is a mistake."],
};
export function VerificationBanner({ verification }) {
  const [I, title, text] = COPY[verification.status];
  return (
    <div className="card flex gap-4 border-gold/40 bg-gradient-to-r from-gold/10 to-transparent p-5">
      <I className="mt-0.5 h-7 w-7 shrink-0 text-gold" />
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-sans text-base font-semibold">{title}</h2><VerificationBadge status={verification.status} /></div>
        <p className="mt-1 text-sm text-muted">{text}</p>
        {verification.note && <p className="mt-2 rounded-lg bg-surface/70 p-3 text-sm"><b>Administrator note:</b> {verification.note}</p>}
        {verification.requestedDocs?.length > 0 && <p className="mt-2 text-sm"><b>Requested:</b> {verification.requestedDocs.join(", ")}</p>}</div>
    </div>
  );
}
