import { notFound } from "next/navigation";
import { BadgeCheck, GraduationCap, Languages, Star, Briefcase } from "lucide-react";
import { getPublicDoctor } from "@/lib/public-data.js";
import { Avatar } from "@/components/public/Photo.jsx";
import { ButtonLink } from "@/components/ui/Button.jsx";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }) { return { title: "Doctor profile" }; }
export default async function DoctorPage({ params }) {
  if (!/^[a-f\d]{24}$/i.test(params.id)) notFound();
  let data;
  try { data = await getPublicDoctor(params.id); } catch { notFound(); }
  const { doctor: d, reviews } = data;
  return (
    <div className="section py-12">
      <div className="card flex flex-col gap-8 p-8 md:flex-row">
        <Avatar name={d.name} src={d.image} className="h-32 w-32 shrink-0 text-3xl" />
        <div className="flex-1">
          <p className="eyebrow">{d.department?.name}</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-3xl font-semibold">Dr. {d.name.replace(/^Dr\.?\s*/i, "")}<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 font-sans text-xs font-semibold text-primary"><BadgeCheck className="h-4 w-4" />Verified by CareNest</span></h1>
          <p className="mt-1 text-lg text-muted">{d.specialization}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gold" />{d.experienceYears} years experience</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-gold text-gold" />{d.ratingCount ? `${d.ratingAvg} from ${d.ratingCount} reviews` : "No reviews yet"}</span>
            {d.languages.length > 0 && <span className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-gold" />{d.languages.join(", ")}</span>}
          </div>
          {d.bio && <p className="mt-5 max-w-2xl leading-relaxed">{d.bio}</p>}
          <div className="mt-6 flex items-center gap-4">
            <ButtonLink href={`/book?department=${d.department?.id}&doctor=${d.id}`} variant="gold" size="lg">Book appointment</ButtonLink>
            {d.consultationFee > 0 && <span className="text-sm text-muted">Consultation ₹{d.consultationFee}</span>}
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card p-6"><h2 className="flex items-center gap-2 font-sans text-base font-semibold"><GraduationCap className="h-5 w-5 text-gold" />Qualifications</h2>
          <ul className="mt-4 space-y-3 text-sm">{d.qualifications.length ? d.qualifications.map((q, i) => <li key={i}><p className="font-medium">{q.degree}</p><p className="text-muted">{q.institution} · {q.year}</p></li>) : <li className="text-muted">Listed on request.</li>}</ul></section>
        <section className="card p-6"><h2 className="font-sans text-base font-semibold">Patient reviews</h2>
          <ul className="mt-4 space-y-4 text-sm">{reviews.length ? reviews.map((r) => <li key={r.id}><div className="flex items-center justify-between"><span className="font-medium">{r.author}</span><span className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />)}</span></div>{r.comment && <p className="mt-1 text-muted">{r.comment}</p>}</li>) : <li className="text-muted">Reviews appear after completed appointments.</li>}</ul></section>
      </div>
    </div>
  );
}
