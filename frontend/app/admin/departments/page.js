"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Modal } from "@/components/ui/Modal.jsx";
import { TextField } from "@/components/ui/Form.jsx";
import { Badge, EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { DeptIcon } from "@/components/public/DeptIcon.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
const ICONS = ["Stethoscope", "HeartPulse", "Brain", "Bone", "Baby", "Eye", "Ear", "Activity", "Microscope", "Pill", "Syringe", "Smile", "Scan", "Siren"];
const blank = { name: "", description: "", icon: "Stethoscope", active: true };
export default function Page() {
  const { toast } = useToast(); const { data, loading, reload } = useFetch("/api/departments?all=1");
  const [edit, setEdit] = useState(null); const [v, setV] = useState(blank); const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  const open = (d) => { setEdit(d || "new"); setV(d ? { name: d.name, description: d.description, icon: d.icon, active: d.active } : blank); setErrs({}); };
  async function save(e) { e.preventDefault(); setBusy(true); setErrs({}); try { await api(edit === "new" ? "/api/departments" : `/api/departments/${edit.id}`, { method: edit === "new" ? "POST" : "PATCH", body: v }); toast("Department saved"); setEdit(null); reload(); } catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); } }
  async function remove(d) { if (!confirm(`Delete ${d.name}?`)) return; try { await api(`/api/departments/${d.id}`, { method: "DELETE" }); toast("Department deleted"); reload(); } catch (e) { toast(e.message, "error"); } }
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Departments" action={<Button variant="gold" onClick={() => open()}><Plus className="h-4 w-4" />Add department</Button>} />
      {loading && <SkeletonRows />}
      {data && (data.departments.length ? <div className="grid gap-4 sm:grid-cols-2">{data.departments.map((d) => (
        <div key={d.id} className="card flex gap-4 p-5"><span className="h-fit rounded-xl bg-gradient-to-br from-forest to-primary p-3 text-champagne"><DeptIcon name={d.icon} className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="font-sans text-base font-semibold">{d.name}</h2>{!d.active && <Badge tone="gray">Hidden</Badge>}</div><p className="mt-1 line-clamp-2 text-sm text-muted">{d.description}</p></div>
          <div className="flex flex-col gap-1"><button aria-label={`Edit ${d.name}`} onClick={() => open(d)}><Pencil className="h-4 w-4 text-muted hover:text-ink" /></button><button aria-label={`Delete ${d.name}`} onClick={() => remove(d)}><Trash2 className="h-4 w-4 text-muted hover:text-red-500" /></button></div></div>))}</div> : <EmptyState title="No departments" text="Add your first medical department." />)}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit === "new" ? "New department" : "Edit department"}>
        <form onSubmit={save} className="space-y-4" noValidate>
          <TextField label="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errs.name} required />
          <TextField as="textarea" label="Description" value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
          <TextField as="select" label="Icon" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })}>{ICONS.map((i) => <option key={i}>{i}</option>)}</TextField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[rgb(var(--primary))]" checked={v.active} onChange={(e) => setV({ ...v, active: e.target.checked })} />Visible to the public</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button loading={busy}>Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}
