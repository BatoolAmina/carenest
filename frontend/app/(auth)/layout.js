import Link from "next/link";
import { Logo } from "@/components/layout/Logo.jsx";
import { ThemeToggle } from "@/components/layout/ThemeToggle.jsx";
import { HeartPulse, ShieldCheck, Lock } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition.jsx";
import { SceneLoader } from "@/components/three/SceneLoader.jsx";

export const metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-forest via-forest to-primary/80 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgb(var(--gold)/.35),transparent_50%),radial-gradient(circle_at_0%_100%,rgb(255_255_255/.08),transparent_50%)]" aria-hidden />
        <div className="relative rounded-2xl bg-white/90 p-3 shadow-gold w-fit"><Logo className="h-20" /></div>
        <div className="relative max-w-md">
          <SceneLoader variant="compact" className="-mt-10 mb-2 h-72 w-full" />
          <h2 className="mt-5 text-4xl font-semibold leading-tight text-white">Care today,<br /><span className="italic text-champagne">brighter tomorrows.</span></h2>
          <ul className="mt-8 space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-champagne" />Admin-verified doctors and secure role-based access</li>
            <li className="flex items-center gap-3"><Lock className="h-5 w-5 text-champagne" />Your records are visible only to you and your treating doctors</li>
          </ul>
        </div>
        <p className="relative text-xs text-white/60">© CareNest Hospital</p>
      </aside>
      <main className="relative flex flex-col px-5 py-6 sm:px-10">
        <div className="mb-6 flex items-center justify-between"><Link href="/" className="lg:invisible"><Logo className="h-12" /></Link><ThemeToggle /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-10"><PageTransition>{children}</PageTransition></div>
      </main>
    </div>
  );
}
