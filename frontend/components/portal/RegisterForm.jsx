"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { useToast } from "../ui/Toast.jsx";

const PW_HINT = "At least 10 characters with upper-case, lower-case and a number.";

export function RegisterForm({ doctor = false }) {
  const router = useRouter(); const { toast } = useToast();
  const depts = useFetch(doctor ? "/api/departments" : null);
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "", dob: "", gender: "undisclosed", departmentId: "", specialization: "", registrationNumber: "", registrationCouncil: "" });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErrs({});
    try {
      const payload = doctor ? { name: v.name, email: v.email, phone: v.phone, password: v.password, departmentId: v.departmentId, specialization: v.specialization, registrationNumber: v.registrationNumber, registrationCouncil: v.registrationCouncil } : { name: v.name, email: v.email, phone: v.phone, password: v.password, dob: v.dob, gender: v.gender };
      const r = await api(doctor ? "/api/auth/register-doctor" : "/api/auth/register", { method: "POST", body: payload });
      toast(r.message); router.push(`/verify-email?email=${encodeURIComponent(v.email)}`);
    } catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); }
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold">{doctor ? "Doctor registration" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-muted">{doctor ? "Use your official CareNest hospital e-mail. After verifying it you’ll submit credentials for administrative review." : "Book appointments and keep your health records in one secure place."}</p>
      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <TextField label="Full name" value={v.name} onChange={set("name")} error={errs.name} autoComplete="name" required />
        <TextField label={doctor ? "Official hospital e-mail" : "E-mail"} type="email" value={v.email} onChange={set("email")} error={errs.email} autoComplete="email" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Phone" value={v.phone} onChange={set("phone")} error={errs.phone} autoComplete="tel" />
          {!doctor && <TextField label="Date of birth" type="date" value={v.dob} onChange={set("dob")} error={errs.dob} />}
        </div>
        {!doctor && <TextField as="select" label="Gender" value={v.gender} onChange={set("gender")}><option value="undisclosed">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></TextField>}
        {doctor && (<>
          <TextField as="select" label="Department" value={v.departmentId} onChange={set("departmentId")} error={errs.departmentId} required><option value="">Select…</option>{depts.data?.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</TextField>
          <TextField label="Specialization" value={v.specialization} onChange={set("specialization")} error={errs.specialization} required />
          <div className="grid gap-4 sm:grid-cols-2"><TextField label="Registration number" value={v.registrationNumber} onChange={set("registrationNumber")} error={errs.registrationNumber} required /><TextField label="Medical council" value={v.registrationCouncil} onChange={set("registrationCouncil")} error={errs.registrationCouncil} required /></div>
        </>)}
        <TextField label="Password" type="password" value={v.password} onChange={set("password")} error={errs.password} hint={PW_HINT} autoComplete="new-password" required />
        <Button className="w-full" loading={busy}><UserPlus className="h-4 w-4" />{doctor ? "Submit registration" : "Create account"}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>{!doctor && <> · <Link href="/register/doctor" className="font-semibold text-primary hover:underline">I’m a doctor</Link></>}</p>
    </div>
  );
}
