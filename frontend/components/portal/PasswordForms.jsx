"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";
import { api } from "@/lib/client.js";
import { Button } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { useToast } from "../ui/Toast.jsx";

export function ForgotPassword() {
  const { toast } = useToast(); const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false);
  async function submit(e) { e.preventDefault(); setBusy(true); try { await api("/api/auth/forgot-password", { method: "POST", body: { email } }); setSent(true); } catch (err) { toast(err.message, "error"); } finally { setBusy(false); } }
  return (
    <div>
      <KeyRound className="h-10 w-10 text-gold" /><h1 className="mt-3 text-3xl font-semibold">Forgot your password?</h1>
      {sent ? <p className="mt-4 rounded-xl bg-primary/10 p-4 text-sm">If an account exists for <b>{email}</b>, a reset link is on its way. It expires in 30 minutes.</p> : (
        <form onSubmit={submit} className="mt-7 space-y-4"><p className="text-sm text-muted">Enter your e-mail and we’ll send a reset link.</p><TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /><Button className="w-full" loading={busy}>Send reset link</Button></form>)}
      <p className="mt-6 text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to sign in</Link></p>
    </div>
  );
}
export function ResetPassword() {
  const sp = useSearchParams(); const router = useRouter(); const { toast } = useToast();
  const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setErr("");
    if (password !== confirm) return setErr("Passwords do not match.");
    setBusy(true);
    try { const r = await api("/api/auth/reset-password", { method: "POST", body: { token: sp.get("token") || "", password } }); toast(r.message); router.push("/login"); }
    catch (e2) { setErr(e2.fields?.password || e2.message); } finally { setBusy(false); }
  }
  return (
    <div><KeyRound className="h-10 w-10 text-gold" /><h1 className="mt-3 text-3xl font-semibold">Choose a new password</h1>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <TextField label="New password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} hint="At least 10 characters with upper-case, lower-case and a number." required />
        <TextField label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <Button className="w-full" loading={busy}>Update password</Button></form></div>
  );
}
