"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { Select, Input, Field } from "../ui/Form.jsx";
import { nowToday } from "./today.js";

export function HomeBooking({ departments }) {
  const router = useRouter();
  const [dept, setDept] = useState("");
  const [date, setDate] = useState("");
  const go = (e) => { e.preventDefault(); const q = new URLSearchParams(); if (dept) q.set("department", dept); if (date) q.set("date", date); router.push(`/book?${q}`); };
  return (
    <form onSubmit={go} className="glass-strong grid gap-3 rounded-2xl p-4 shadow-gold sm:grid-cols-[1fr_1fr_auto] sm:items-end" aria-label="Quick appointment search">
      <Field label="Department">{(a) => <Select {...a} value={dept} onChange={(e) => setDept(e.target.value)}><option value="">Any department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>}</Field>
      <Field label="Preferred date">{(a) => <Input {...a} type="date" min={nowToday()} value={date} onChange={(e) => setDate(e.target.value)} />}</Field>
      <Button variant="gold" className="h-[42px]"><Search className="h-4 w-4" />Find a doctor</Button>
    </form>
  );
}
