"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { ErrorState, SkeletonRows } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";

export function PatientProfileForm({ patientId = "me" }) {
  const { toast } = useToast();
  const { data, loading, error } = useFetch(`/api/patients/${patientId}`);
  const [v, setV] = useState(null); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  useEffect(() => { if (data) { const p = data.patient; setV({ name: p.name || "", phone: p.phone || "", dob: p.dob || "", gender: p.gender, bloodGroup: p.bloodGroup || "", address: p.address || "", ecName: p.emergencyContact?.name || "", ecPhone: p.emergencyContact?.phone || "" }); } }, [data]);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  async function save(e) {
    e.preventDefault(); setBusy(true); setErrs({});
    try { await api(`/api/patients/${patientId}`, { method: "PUT", body: { name: v.name, phone: v.phone, dob: v.dob, gender: v.gender, bloodGroup: v.bloodGroup, address: v.address, emergencyContact: { name: v.ecName, phone: v.ecPhone } } }); toast("Profile saved"); }
    catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); }
  }
  if (loading || !v) return error ? <ErrorState message={error} /> : <SkeletonRows />;
  const p = data.patient;
  return (
    <form onSubmit={save} className="card max-w-2xl space-y-4 p-6" noValidate>
      <p className="text-sm text-muted">Medical record number: <b className="text-ink">{p.mrn}</b> · {p.email}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" value={v.name} onChange={set("name")} error={errs.name} />
        <TextField label="Phone" value={v.phone} onChange={set("phone")} error={errs.phone} />
        <TextField label="Date of birth" type="date" value={v.dob} onChange={set("dob")} error={errs.dob} />
        <TextField as="select" label="Gender" value={v.gender} onChange={set("gender")}><option value="undisclosed">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></TextField>
        <TextField as="select" label="Blood group" value={v.bloodGroup} onChange={set("bloodGroup")}><option value="">Unknown</option>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <option key={b}>{b}</option>)}</TextField>
      </div>
      <TextField label="Address" value={v.address} onChange={set("address")} />
      <div className="grid gap-4 sm:grid-cols-2"><TextField label="Emergency contact name" value={v.ecName} onChange={set("ecName")} /><TextField label="Emergency contact phone" value={v.ecPhone} onChange={set("ecPhone")} error={errs["emergencyContact.phone"]} /></div>
      <Button loading={busy}><Save className="h-4 w-4" />Save changes</Button>
    </form>
  );
}
