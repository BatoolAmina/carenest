import { PageHero } from "@/components/public/PageHero.jsx";
import { BookPageClient } from "@/components/public/BookPageClient.jsx";
export const metadata = { title: "Book an appointment" };
export default function BookPage({ searchParams }) {
  return (<><PageHero eyebrow="Appointments" title="Book your visit" text="Choose a verified doctor and a time that suits you. Confirmed instantly." />
    <section className="section mt-10"><BookPageClient initial={{ department: searchParams?.department || "", doctor: searchParams?.doctor || "", date: searchParams?.date || "" }} /></section></>);
}
