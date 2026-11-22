"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, CalendarPlus, LayoutDashboard } from "lucide-react";
import clsx from "clsx";
import { Logo } from "./Logo.jsx";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { ButtonLink } from "../ui/Button.jsx";

const links = [["/", "Home"], ["/about", "About"], ["/departments", "Departments"], ["/doctors", "Doctors"], ["/services", "Services"], ["/facilities", "Facilities"], ["/contact", "Contact"]];
const homeFor = { patient: "/patient", doctor: "/doctor", receptionist: "/reception", admin: "/admin" };

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { data } = useSession();
  const role = data?.user?.role;
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/65 shadow-[0_12px_30px_-24px_rgb(var(--shadow)/.8)] backdrop-blur-xl">
      <div className="section flex h-[4.5rem] items-center justify-between gap-4">
        <Logo className="h-12 sm:h-14" priority />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map(([href, label]) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={clsx("relative rounded-lg px-3 py-2 text-[0.95rem] font-medium transition", active ? "text-ink" : "text-muted hover:text-ink")}>
                {label}
                {active && <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-gold to-primary" />}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {role ? (
            <ButtonLink href={homeFor[role]} variant="outline" size="sm" className="hidden sm:inline-flex"><LayoutDashboard className="h-4 w-4" />Dashboard</ButtonLink>
          ) : (
            <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</ButtonLink>
          )}
          <ButtonLink href="/book" variant="gold" size="sm" className="hidden sm:inline-flex"><CalendarPlus className="h-4 w-4" />Book</ButtonLink>
          <button className="glass rounded-lg p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-line/60 lg:hidden" aria-label="Mobile">
            <div className="section flex flex-col gap-1 py-4">
              {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sage/60">{label}</Link>)}
              <div className="mt-2 flex gap-2">
                <ButtonLink href={role ? homeFor[role] : "/login"} variant="outline" size="sm" className="flex-1">{role ? "Dashboard" : "Sign in"}</ButtonLink>
                <ButtonLink href="/book" variant="gold" size="sm" className="flex-1">Book appointment</ButtonLink>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
