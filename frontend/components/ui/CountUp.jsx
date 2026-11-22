"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
export function CountUp({ to = 0, suffix = "", className }) {
  const ref = useRef(null); const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => { if (!inView) return; const c = animate(0, Number(to) || 0, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: (n) => setV(Math.round(n)) }); return () => c.stop(); }, [inView, to]);
  return <span ref={ref} className={className}>{v.toLocaleString()}{suffix}</span>;
}
