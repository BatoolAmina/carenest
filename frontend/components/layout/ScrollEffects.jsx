"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";
import { CalendarPlus, ArrowUp } from "lucide-react";

/** Gold reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-primary via-gold to-champagne" />;
}

/** Soft blurred orbs that drift at different speeds as you scroll – depth behind the content. */
export function ParallaxOrbs() {
  const { scrollY } = useScroll();
  const a = useTransform(scrollY, [0, 3000], [0, -380]), b = useTransform(scrollY, [0, 3000], [0, 260]), c = useTransform(scrollY, [0, 3000], [0, -140]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div style={{ y: a }} className="absolute -left-24 top-[18%] h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <motion.div style={{ y: b }} className="absolute -right-16 top-[45%] h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <motion.div style={{ y: c }} className="absolute left-1/3 top-[75%] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
    </div>
  );
}

/** Mobile-only floating booking bar + back-to-top. */
export function FloatingActions() {
  const path = usePathname(); const [show, setShow] = useState(false);
  useEffect(() => { const on = () => setShow(window.scrollY > 420); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  if (path.startsWith("/book")) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} className="fixed inset-x-4 bottom-4 z-40 flex gap-2 lg:hidden">
          <Link href="/book" className="glass-strong flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-champagne to-gold py-3.5 text-sm font-bold text-[#2b2008] shadow-gold"><CalendarPlus className="h-4 w-4" />Book appointment</Link>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="glass-strong rounded-2xl px-4 shadow-soft"><ArrowUp className="h-5 w-5" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
