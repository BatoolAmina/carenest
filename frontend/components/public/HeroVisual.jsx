"use client";
import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, CalendarCheck, Star } from "lucide-react";
import { SceneLoader } from "../three/SceneLoader.jsx";

/** Interactive 3D hero: a WebGL emblem (cross + DNA helix) reacting to the pointer, framed in glass with floating info cards. */
export function HeroVisual() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const move = (event) => {
    if (!ref.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    ref.current.style.setProperty("--hero-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty("--hero-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };
  const leave = () => {
    if (!ref.current) return;
    ref.current.style.setProperty("--hero-x", "50%");
    ref.current.style.setProperty("--hero-y", "38%");
  };
  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={leave} className="hero-visual relative mx-auto aspect-square w-full max-w-xl lg:aspect-[4/5]">
      <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-gold/25 via-transparent to-primary/30 blur-3xl" aria-hidden />
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="glass absolute inset-0 overflow-hidden rounded-[2.5rem] border-gold/40 shadow-gold">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgb(var(--primary)/.22),transparent_62%)]" aria-hidden />
        <div className="hero-cursor-glow" aria-hidden />
        <div className="hero-refraction" aria-hidden />
        <SceneLoader className="absolute inset-0 cursor-grab active:cursor-grabbing" progress={progress} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-bg/40 to-transparent" aria-hidden />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 24 }}
        className="glass-strong absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-2 shadow-soft"
      >
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_rgb(var(--primary))]"
        />
        <span className="whitespace-nowrap text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted">Care ecosystem online</span>
      </motion.div>
      <motion.div className="glass-strong absolute -left-3 top-12 flex items-center gap-3 rounded-2xl p-3 shadow-soft sm:-left-10" initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
        <motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="rounded-xl bg-primary/15 p-2 text-primary"><ShieldCheck className="h-5 w-5" /></motion.span>
        <div><p className="text-sm font-semibold">Verified specialists</p><p className="text-xs text-muted">Credentials reviewed</p></div>
      </motion.div>
      <motion.div className="glass-strong absolute -right-3 bottom-20 rounded-2xl p-3 shadow-soft sm:-right-9" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
        <div className="flex items-center gap-3"><motion.span animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="rounded-xl bg-gold/20 p-2 text-gold"><CalendarCheck className="h-5 w-5" /></motion.span><div><p className="text-sm font-semibold">Instant booking</p><p className="text-xs text-muted">Live availability</p></div></div>
        <svg viewBox="0 0 160 30" className="mt-2 h-6 w-full text-primary" aria-hidden><motion.path d="M0 15h40l8-12 10 24 8-12h94" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} /></svg>
      </motion.div>
      <motion.div className="glass-strong absolute -bottom-4 left-8 flex items-center gap-2 rounded-full px-4 py-2 shadow-soft" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
        <Star className="h-4 w-4 fill-gold text-gold" /><span className="text-xs font-semibold">Drag to explore</span>
      </motion.div>
    </div>
  );
}
