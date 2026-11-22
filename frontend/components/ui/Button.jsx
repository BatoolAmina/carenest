"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-gradient-to-br from-primary to-primary/85 text-onprimary shadow-soft hover:brightness-110",
  gold: "bg-gradient-to-br from-champagne to-gold text-[#2b2008] shadow-gold hover:brightness-105",
  outline: "border border-line bg-surface/60 text-ink hover:border-gold/70 hover:bg-surface",
  ghost: "text-ink hover:bg-sage/60",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const sizes = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2.5 text-sm gap-2", lg: "px-6 py-3.5 text-base gap-2.5" };
const base = "depth-control inline-flex items-center justify-center rounded-xl font-semibold transition-[transform,box-shadow,filter] disabled:pointer-events-none disabled:opacity-55";
const cls = (v, s, c) => clsx(base, variants[v], sizes[s], c);

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...props }) {
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className={cls(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}{children}
    </motion.button>
  );
}
export function ButtonLink({ href, variant = "primary", size = "md", className, children, ...props }) {
  return (
    <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} className="inline-flex">
      <Link href={href} className={cls(variant, size, className)} {...props}>{children}</Link>
    </motion.span>
  );
}
