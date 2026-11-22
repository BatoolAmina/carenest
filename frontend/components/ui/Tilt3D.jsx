"use client";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";

/** Pointer-tracked 3D tilt with a moving gold glare. Mouse only (touch/pen keep the card still). */
export function Tilt3D({ children, className = "", max = 7, radius = "1rem", glare = true }) {
  const x = useMotionValue(0.5), y = useMotionValue(0.5);
  const spring = { stiffness: 220, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), spring);
  const gx = useTransform(x, (v) => `${v * 100}%`), gy = useTransform(y, (v) => `${v * 100}%`);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${gx} ${gy}, rgb(var(--gold) / .22), transparent 62%)`;
  const move = (e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); x.set((e.clientX - r.left) / r.width); y.set((e.clientY - r.top) / r.height); };
  const leave = () => { x.set(0.5); y.set(0.5); };
  return (
    <motion.div onPointerMove={move} onPointerLeave={leave} whileHover={{ scale: 1.025, z: 8 }} style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }} className={`relative will-change-transform ${className}`}>
      {children}
      {glare && <motion.div aria-hidden style={{ background: glow, borderRadius: radius }} className="pointer-events-none absolute inset-0" />}
    </motion.div>
  );
}
