import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import { Avatar } from "./Photo.jsx";
import { Tilt3D } from "../ui/Tilt3D.jsx";

export function DoctorCard({ d }) {
  return (
    <Tilt3D className="h-full"><Link href={`/doctors/${d.id}`} className="card group block overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-gold">
      <div className="flex items-center gap-4">
        <Avatar name={d.name} src={d.image} className="h-16 w-16 text-lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate font-display text-lg font-semibold">Dr. {d.name.replace(/^Dr\.?\s*/i, "")}<BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" /></p>
          <p className="truncate text-sm text-muted">{d.specialization}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted">
        <span className="rounded-full bg-sage/70 px-2.5 py-1 font-medium text-primary">{d.department?.name}</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{d.ratingCount ? `${d.ratingAvg} (${d.ratingCount})` : "New"}</span>
      </div>
      <p className="mt-3 text-xs text-muted">{d.experienceYears} yrs experience{d.consultationFee ? ` · ₹${d.consultationFee}` : ""}</p>
    </Link></Tilt3D>
  );
}
