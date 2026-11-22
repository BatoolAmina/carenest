"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { Input, TextField } from "@/components/ui/Form.jsx";
import { Badge, EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { useToast } from "@/components/ui/Toast.jsx";

const ROLES = [["", "All"], ["patient", "Patients"], ["doctor", "Doctors"], ["receptionist", "Reception"], ["admin", "Admins"]];
export default function Page() {
  const { toast } = useToast(); const [role, setRole] = useState(""); const [q, setQ] = useState("");
  const { data, loading, reload } = useFetch(`/api/admin/users?role=${role}&q=${encodeURIComponent(q)}`);
  const [open, setOpen] = useState(false); const [v, setV] = useState({ name: "", email: "", phone: "", role: "receptionist", designation: "" }); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  async function toggle(u) { try { await api(`/api/admin/users/${u.id}`, { method: "PATCH", body: { status: u.status === "active" ? "suspended" : "active" } }); toast(u.status === "active" ? "Account suspended" : "Account reactivated"); reload(); } catch (e) { toast(e.message, "error"); } }
  async function create(e) { e.preventDefault(); setBusy(true); setErrs({}); try { const r = await api("/api/admin/staff", { method: "POST", body: v }); toast(r.message); setOpen(false); setV({ name: "", email: "", phone: "", role: "receptionist", designation: "" }); reload(); } catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); } }
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Users & staff" subtitle="Manage patients, doctors, receptionists and administrators." action={<Button variant="gold" onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" />Create staff account</Button>} />
      <div className="mb-5 flex flex-wrap gap-3"><div className="flex flex-wrap gap-2">{ROLES.map(([k, l]) => <button key={l} onClick={() => setRole(k)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${role === k ? "border-gold bg-gold/20" : "border-line text-muted"}`}>{l}</button>)}</div><Input className="max-w-xs" placeholder="Search name or e-mail" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" /></div>
      {loading && <SkeletonRows />}
      {data && (data.users.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="p-4">Name</th><th>Role</th><th>Status</th><th>Last sign-in</th><th className="pr-4 text-right">Action</th></tr></thead>
        <tbody>{data.users.map((u) => <tr key={u.id} className="border-b border-line/60 last:border-0"><td className="p-4"><b>{u.name}</b><br /><span className="text-xs text-muted">{u.email}{!u.emailVerified && " · unverified"}</span></td><td className="capitalize">{u.role}</td><td><Badge tone={u.status === "active" ? "green" : "red"}>{u.status}</Badge></td><td className="text-muted">{u.lastLoginAt ? fmtDateTime(u.lastLoginAt) : "Never"}</td><td className="pr-4 text-right"><Button size="sm" variant="outline" onClick={() => toggle(u)}>{u.status === "active" ? "Suspend" : "Reactivate"}</Button></td></tr>)}</tbody></table></div> : <EmptyState title="No users found" />)}
      <Modal open={open} onClose={() => setOpen(false)} title="Create staff account">
        <form onSubmit={create} className="space-y-4" noValidate>
          <TextField label="Full name" value={v.name} onChange={set("name")} error={errs.name} required /><TextField label="E-mail" type="email" value={v.email} onChange={set("email")} error={errs.email} hint="A password-setup link is e-mailed to this address." required />
          <div className="grid gap-4 sm:grid-cols-2"><TextField as="select" label="Role" value={v.role} onChange={set("role")}><option value="receptionist">Receptionist</option><option value="admin">Administrator</option></TextField><TextField label="Phone" value={v.phone} onChange={set("phone")} error={errs.phone} /></div>
          <TextField label="Designation" value={v.designation} onChange={set("designation")} />
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button loading={busy}>Create account</Button></div>
        </form>
      </Modal>
    </div>
  );
}
