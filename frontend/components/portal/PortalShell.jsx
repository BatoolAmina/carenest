"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, LogOut, Menu, X, Home } from "lucide-react";
import clsx from "clsx";
import { NAV, ROLE_LABEL } from "@/lib/nav.js";
import { api } from "@/lib/client.js";
import { Logo } from "../layout/Logo.jsx";
import { ThemeToggle } from "../layout/ThemeToggle.jsx";
import { Avatar } from "../public/Photo.jsx";

export function PortalShell({ role, user, children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let live = true;
    const poll = () => api("/api/notifications?unread=1").then((r) => live && setUnread(r.unread)).catch(() => {});
    poll(); const t = setInterval(poll, 60000); window.addEventListener("cn:notifications", poll);
    return () => { live = false; clearInterval(t); window.removeEventListener("cn:notifications", poll); };
  }, []);
  useEffect(() => setOpen(false), [path]);
  const items = NAV[role];
  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Portal">
      {items.map(([href, label, Icon]) => {
        const active = href === items[0][0] ? path === href : path.startsWith(href);
        const isBell = label === "Notifications";
        return (
          <Link key={href} href={href} className={clsx("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "text-ink" : "text-muted hover:bg-sage/50 hover:text-ink")}>
            {active && <motion.span layoutId="portal-active" className="absolute inset-0 rounded-xl border border-gold/40 bg-gradient-to-r from-gold/15 to-primary/10" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            <Icon className="relative h-[18px] w-[18px]" /><span className="relative flex-1">{label}</span>
            {isBell && unread > 0 && <span className="relative rounded-full bg-gold px-1.5 text-[11px] font-bold text-[#2b2008]">{unread > 9 ? "9+" : unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="glass-strong sticky top-0 hidden h-screen flex-col border-y-0 border-l-0 lg:flex">
        <div className="p-5"><Logo className="h-16" href="/" /><p className="eyebrow mt-2 !text-[10px]">{ROLE_LABEL[role]}</p></div>
        <div className="gold-rule" />{nav}
        <div className="border-t border-line/70 p-4"><Link href="/" className="flex items-center gap-2 text-xs text-muted hover:text-ink"><Home className="h-4 w-4" />Public website</Link></div>
      </aside>
      <AnimatePresence>
        {open && (<motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-forest/50" onClick={() => setOpen(false)} />
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 330, damping: 34 }} className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col">
            <div className="flex items-center justify-between p-4"><Logo className="h-14" href="/" /><button onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button></div>{nav}
          </motion.div></motion.div>)}
      </AnimatePresence>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line/60 bg-bg/70 px-4 backdrop-blur-xl sm:px-8">
          <button className="glass rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden text-sm text-muted lg:block">{ROLE_LABEL[role]}</div>
          <div className="flex items-center gap-3">
            <Link href={items.find((i) => i[1] === "Notifications")[0]} className="glass relative rounded-full p-2 hover:border-gold/60" aria-label={`Notifications, ${unread} unread`}><Bell className="h-[18px] w-[18px]" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-bg" />}</Link>
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex"><Avatar name={user.name} src={user.image} className="h-9 w-9 text-xs" /><span className="max-w-[10rem] truncate text-sm font-medium">{user.name}</span></div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="glass rounded-full p-2 text-muted transition hover:border-red-400/60 hover:text-red-500" aria-label="Sign out"><LogOut className="h-[18px] w-[18px]" /></button>
          </div>
        </header>
        <main className="px-4 py-8 sm:px-8"><motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>{children}</motion.div></main>
      </div>
    </div>
  );
}
