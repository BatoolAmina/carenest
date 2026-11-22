"use client";
import { useState } from "react";
import { CalendarPlus, Download } from "lucide-react";
import { PageHeader } from "../ui/Misc.jsx";
import { Button, ButtonLink } from "../ui/Button.jsx";
import { Input, Select } from "../ui/Form.jsx";
import { AppointmentTable } from "./AppointmentTable.jsx";
import { BookForPatientModal } from "./BookForPatientModal.jsx";
export function AppointmentsManager({ admin = false }) {
  const [f, setF] = useState({ q: "", date: "", status: "" }); const [open, setOpen] = useState(false); const [k, setK] = useState(0);
  const qs = new URLSearchParams(Object.entries(f).filter(([, v]) => v)).toString();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Appointments" action={<div className="flex gap-2">{admin && <ButtonLink href="/api/admin/export?type=appointments" variant="outline"><Download className="h-4 w-4" />Export CSV</ButtonLink>}<Button variant="gold" onClick={() => setOpen(true)}><CalendarPlus className="h-4 w-4" />New appointment</Button></div>} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Patient, MRN or doctor" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} aria-label="Search" />
        <Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} aria-label="Date" />
        <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} aria-label="Status"><option value="">Any status</option>{["booked", "checked_in", "completed", "cancelled", "no_show"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</Select>
      </div>
      <AppointmentTable role={admin ? "admin" : "receptionist"} showPatient query={qs} reloadKey={k} />
      <BookForPatientModal open={open} onClose={() => setOpen(false)} onBooked={() => setK((x) => x + 1)} />
    </div>
  );
}
