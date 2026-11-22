"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/client.js";
import { Button, ButtonLink } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { useToast } from "../ui/Toast.jsx";
import { Spinner } from "../ui/Misc.jsx";

export function VerifyEmail() {
  const sp = useSearchParams(); const { toast } = useToast();
  const token = sp.get("token");
  const [email, setEmail] = useState(sp.get("email") || ""); const [code, setCode] = useState("");
  const [state, setState] = useState(token ? "working" : "form"); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const ran = useRef(false);
  async function verify(body) {
    setBusy(true);
    try { const r = await api("/api/auth/verify-email", { method: "POST", body }); setMsg(r.message); setState("ok"); }
    catch (e) { setMsg(e.message); setState(token ? "fail" : "form"); if (!token) toast(e.message, "error"); } finally { setBusy(false); }
  }
  useEffect(() => { if (token && !ran.current) { ran.current = true; verify({ token }); } }, [token]); // eslint-disable-line
  async function resend() { try { const r = await api("/api/auth/resend-verification", { method: "POST", body: { email } }); toast(r.message); } catch (e) { toast(e.message, "error"); } }

  if (state === "working") return <div className="flex flex-col items-center gap-3 py-16"><Spinner /><p className="text-muted">Verifying your e-mail…</p></div>;
  if (state === "ok") return <div className="text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-primary" /><h1 className="mt-4 text-2xl font-semibold">E-mail verified</h1><p className="mt-2 text-muted">{msg}</p><ButtonLink href="/login" className="mt-6">Continue to sign in</ButtonLink></div>;
  if (state === "fail") return <div className="text-center"><XCircle className="mx-auto h-14 w-14 text-red-500" /><h1 className="mt-4 text-2xl font-semibold">Link not valid</h1><p className="mt-2 text-muted">{msg}</p><ButtonLink href="/verify-email" variant="outline" className="mt-6">Enter a code instead</ButtonLink></div>;
  return (
    <div>
      <MailCheck className="h-10 w-10 text-gold" />
      <h1 className="mt-3 text-3xl font-semibold">Verify your e-mail</h1>
      <p className="mt-1 text-sm text-muted">Enter the 6-digit code we sent you, or open the link in the e-mail.</p>
      <form onSubmit={(e) => { e.preventDefault(); verify({ email, code }); }} className="mt-7 space-y-4">
        <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Verification code" inputMode="numeric" pattern="\d{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="tracking-[0.4em]" required />
        {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
        <Button className="w-full" loading={busy} disabled={code.length !== 6}>Verify</Button>
      </form>
      <button onClick={resend} className="mt-4 w-full text-center text-sm text-primary hover:underline" disabled={!email}>Send a new code</button>
      <p className="mt-6 text-center text-sm text-muted"><Link href="/login" className="hover:underline">Back to sign in</Link></p>
    </div>
  );
}
