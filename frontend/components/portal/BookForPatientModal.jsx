"use client";
import { useEffect, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useFetch } from "@/hooks/useFetch.js";
import { Modal } from "../ui/Modal.jsx";
import { Input } from "../ui/Form.jsx";
import { BookingFlow } from "./BookingFlow.jsx";

/** Reception/admin scheduling: pick a patient (or pass one), then use the same atomic booking flow. */
export function BookForPatientModal({ open, onClose, patient: fixed, onBooked }) {
  const [patient, setPatient] = useState(fixed || null);
  const [q, setQ] = useState(""); const [dq, setDq] = useState("");
  useEffect(() => setPatient(fixed || null), [fixed, open]);
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  const { data } = useFetch(open && !patient ? `/api/patients?q=${encodeURIComponent(dq)}` : null);
  return (
    <Modal open={open} onClose={onClose} title={patient ? `Schedule for ${patient.name}` : "Select a patient"} wide>
      {!patient ? (
        <div>
          <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><Input className="pl-9" autoFocus placeholder="Search name, MRN, phone or e-mail" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search patients" /></div>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">{data?.patients.map((p) => <li key={p.id}><button onClick={() => setPatient(p)} className="flex w-full items-center gap-3 rounded-xl border border-line p-3 text-left hover:border-gold"><UserRound className="h-5 w-5 text-gold" /><span><span className="block font-medium">{p.name}</span><span className="text-xs text-muted">{p.mrn} · {p.phone || p.email}</span></span></button></li>)}
            {data && !data.patients.length && <li className="p-4 text-center text-sm text-muted">No patients found. Register them first from the Patients page.</li>}</ul>
        </div>
      ) : <BookingFlow patientId={patient.id} onBooked={onBooked} />}
    </Modal>
  );
}
