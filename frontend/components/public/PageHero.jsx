import { Reveal } from "../layout/Reveal.jsx";
export function PageHero({ eyebrow, title, text, children, visual }) {
  return (
    <section className="relative overflow-hidden border-b border-line/60">
      <div className="absolute inset-0 bg-gradient-to-br from-forest/10 via-transparent to-gold/10" aria-hidden />
      <div className={`section relative py-14 sm:py-20 ${visual ? "grid items-center gap-10 lg:grid-cols-[1fr_18rem]" : ""}`}>
        <div>
          <Reveal><p className="eyebrow">{eyebrow}</p></Reveal>
          <Reveal delay={.05}><h1 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1></Reveal>
          {text && <Reveal delay={.1}><p className="mt-4 max-w-2xl text-lg text-muted">{text}</p></Reveal>}
          {children}
        </div>
        {visual && <Reveal delay={.15} className="mx-auto w-full max-w-[18rem]">{visual}</Reveal>}
      </div>
    </section>
  );
}
