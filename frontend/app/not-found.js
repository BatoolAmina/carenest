import { ButtonLink } from "@/components/ui/Button.jsx";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="absolute h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative rounded-[2rem] border border-line/70 bg-surface/75 p-10 shadow-soft backdrop-blur-xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-forest to-primary text-champagne shadow-gold"><Compass className="h-8 w-8" /></span>
        <p className="eyebrow mt-5">404</p>
        <h1 className="mt-3 text-4xl font-semibold">We couldn’t find that page</h1>
        <p className="mt-3 max-w-md text-muted">The address may have changed. Continue from the CareNest home page.</p>
        <div className="mt-7"><ButtonLink href="/">Back to home</ButtonLink></div>
      </div>
    </div>
  );
}
