"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Camera, Download, KeyRound, Save, Trash2 } from "lucide-react";
import { api } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button, ButtonLink } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { Avatar } from "../public/Photo.jsx";
import { SkeletonRows } from "../ui/Misc.jsx";
import { useToast } from "../ui/Toast.jsx";

/** Photo, basic details and password for any signed-in role. */
export function AccountPanel({ showProfile = true, showExport = false }) {
  const { toast } = useToast(); const { update } = useSession();
  const { data, loading, reload } = useFetch("/api/account");
  const [v, setV] = useState({ name: "", phone: "" }); const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(""); const [errs, setErrs] = useState({}); const file = useRef(null);
  useEffect(() => { if (data) setV({ name: data.account.name, phone: data.account.phone || "" }); }, [data]);
  if (loading || !data) return <SkeletonRows rows={3} />;
  const a = data.account;
  const run = async (key, fn, ok) => { setBusy(key); setErrs({}); try { await fn(); toast(ok); } catch (e) { setErrs(e.fields || {}); toast(e.message, "error"); } finally { setBusy(""); } };
  const upload = (e) => { const f = e.target.files?.[0]; e.target.value = ""; if (!f) return; run("photo", async () => { const fd = new FormData(); fd.append("file", f); await api("/api/profile/photo", { method: "POST", form: fd }); await reload(); await update(); }, "Photo updated"); };
  const remove = () => run("photo", async () => { await api("/api/profile/photo", { method: "DELETE" }); await reload(); await update(); }, "Photo removed");
  const saveProfile = (e) => { e.preventDefault(); run("profile", async () => { await api("/api/account", { method: "PUT", body: v }); await update(); }, "Details saved"); };
  const changePw = (e) => { e.preventDefault(); if (pw.newPassword !== pw.confirm) return setErrs({ newPassword: "Passwords do not match" }); run("pw", async () => { await api("/api/account/password", { method: "POST", body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } }); setPw({ currentPassword: "", newPassword: "", confirm: "" }); }, "Password updated"); };
  return (
    <div className="space-y-6">
      <section className="card flex flex-wrap items-center gap-5 p-6">
        <Avatar name={a.name} src={a.image} className="h-20 w-20 text-xl" />
        <div className="flex-1"><p className="font-semibold">{a.name}</p><p className="text-sm text-muted">{a.email} · <span className="capitalize">{a.role}</span></p>
          <div className="mt-3 flex flex-wrap gap-2"><input ref={file} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={upload} aria-label="Upload profile photo" /><Button variant="outline" size="sm" loading={busy === "photo"} onClick={() => file.current.click()}><Camera className="h-4 w-4" />Change photo</Button>{a.image && <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="h-4 w-4" />Remove</Button>}</div>
          <p className="mt-1 text-xs text-muted">PNG, JPG or WebP · max 2 MB</p></div>
      </section>
      {showProfile && (
        <form onSubmit={saveProfile} className="card space-y-4 p-6" noValidate><h2 className="font-sans text-base font-semibold">Your details</h2>
          <div className="grid gap-4 sm:grid-cols-2"><TextField label="Full name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errs.name} /><TextField label="Phone" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} error={errs.phone} /></div>
          <Button loading={busy === "profile"}><Save className="h-4 w-4" />Save</Button></form>)}
      <form onSubmit={changePw} className="card space-y-4 p-6" noValidate><h2 className="font-sans text-base font-semibold">{a.google ? "Set a password" : "Change password"}</h2>
        {!a.google && <TextField label="Current password" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={errs.currentPassword} />}
        <div className="grid gap-4 sm:grid-cols-2"><TextField label="New password" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} error={errs.newPassword} hint="10+ characters with upper-case, lower-case and a number." /><TextField label="Confirm" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
        <Button loading={busy === "pw"} disabled={!pw.newPassword}><KeyRound className="h-4 w-4" />Update password</Button></form>
      {showExport && <section className="card flex flex-wrap items-center justify-between gap-3 p-6"><div><h2 className="font-sans text-base font-semibold">Download my data</h2><p className="text-sm text-muted">A complete JSON copy of your profile, appointments, records and prescriptions.</p></div><ButtonLink href="/api/patient/export" variant="outline"><Download className="h-4 w-4" />Export</ButtonLink></section>}
    </div>
  );
}
