import { PageHero } from "@/components/public/PageHero.jsx";
import { DoctorsExplorer } from "@/components/public/DoctorsExplorer.jsx";
export const metadata = { title: "Our doctors" };
export default function DoctorsPage({ searchParams }) {
  return (<><PageHero eyebrow="Our doctors" title="Verified specialists you can trust" text="Every doctor listed here has verified their hospital identity and been approved by CareNest administration." />
    <section className="section mt-10"><DoctorsExplorer initialDepartment={searchParams?.department || ""} /></section></>);
}
