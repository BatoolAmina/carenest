import { PageHero } from "@/components/public/PageHero.jsx";
import { Faq } from "@/components/public/Faq.jsx";
export const metadata = { title: "FAQs & patient information" };
export default function FaqPage() {
  return (<><PageHero eyebrow="Patient information" title="Frequently asked questions" /><section className="section mt-12 max-w-3xl"><Faq /></section></>);
}
