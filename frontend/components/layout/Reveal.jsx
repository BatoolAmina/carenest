"use client";
import { motion } from "framer-motion";
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }) {
  const M = motion[as];
  return <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: .6, delay, ease: [.22, 1, .36, 1] }}>{children}</M>;
}
export function Stagger({ children, className, gap = .08 }) {
  return <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={{ show: { transition: { staggerChildren: gap } } }}>{children}</motion.div>;
}
export const StaggerItem = ({ children, className }) => <motion.div className={className} variants={{ hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: .55, ease: [.22, 1, .36, 1] } } }}>{children}</motion.div>;
