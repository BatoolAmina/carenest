"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} aria-pressed={dark}
      className="glass relative h-9 w-[4.25rem] rounded-full p-1 transition hover:border-gold/60">
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-gold text-[#2b2008] shadow-gold ${dark ? "ml-auto" : ""}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={dark ? "m" : "s"} initial={{ rotate: -90, opacity: 0, scale: .5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: .5 }} transition={{ duration: .2 }}>
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
