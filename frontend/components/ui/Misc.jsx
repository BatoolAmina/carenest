import clsx from "clsx";
import { Inbox } from "lucide-react";
import { Tilt3D } from "./Tilt3D.jsx";

export const Skeleton = ({ className }) => <div className={clsx("skeleton rounded-lg", className)} aria-hidden />;
export const SkeletonRows = ({ rows = 4 }) => <div className="space-y-3" aria-busy="true" aria-label="Loading">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>;

export function EmptyState({ icon: Icon = Inbox, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-sage/70 p-4 text-primary"><Icon className="h-7 w-7" /></div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return <div className="rounded-2xl border border-red-300/60 bg-red-50/60 p-5 text-sm text-red-800 dark:border-red-400/30 dark:bg-red-950/30 dark:text-red-200" role="alert">{message || "Something went wrong."} {onRetry && <button onClick={onRetry} className="ml-2 font-semibold underline">Try again</button>}</div>;
}
const tones = {
  green: "bg-primary/15 text-primary", gold: "bg-gold/20 text-[rgb(var(--gold))]", gray: "bg-sage/70 text-muted",
  red: "bg-red-500/15 text-red-600 dark:text-red-300", blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300", amber: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
};
export const Badge = ({ tone = "gray", children, className }) => <span className={clsx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;

const APPT = { booked: ["green", "Booked"], checked_in: ["blue", "Checked in"], completed: ["gray", "Completed"], cancelled: ["red", "Cancelled"], no_show: ["amber", "No-show"] };
export const AppointmentBadge = ({ status }) => <Badge tone={APPT[status]?.[0]}>{APPT[status]?.[1] || status}</Badge>;
const VERIF = { email_unverified: ["gray", "E-mail unverified"], documents_pending: ["amber", "Documents needed"], under_review: ["blue", "Under review"], changes_requested: ["amber", "Changes requested"], approved: ["green", "Verified"], rejected: ["red", "Rejected"] };
export const VerificationBadge = ({ status }) => <Badge tone={VERIF[status]?.[0]}>{VERIF[status]?.[1] || status}</Badge>;

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <Tilt3D max={4} className="h-full">
      <div className="card relative h-full overflow-hidden p-5">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/10 blur-2xl" aria-hidden />
        <div className="flex items-center justify-between"><p className="text-sm text-muted">{label}</p>{Icon && <span className="rounded-lg bg-sage/70 p-2 text-primary"><Icon className="h-4 w-4" /></span>}</div>
        <p className="mt-3 font-display text-3xl font-semibold">{value ?? "–"}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
    </Tilt3D>
  );
}
export const Spinner = () => <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-primary" role="status" aria-label="Loading" />;
