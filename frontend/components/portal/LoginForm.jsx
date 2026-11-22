"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getProviders, getSession, signIn } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { api } from "@/lib/client.js";

const MESSAGES = {
  INVALID_CREDENTIALS: "Incorrect e-mail or password.", EMAIL_NOT_VERIFIED: "Please verify your e-mail first.", ACCOUNT_SUSPENDED: "This account has been suspended. Contact administration.",
  ACCOUNT_LOCKED: "Too many failed attempts. Try again in 15 minutes.", RATE_LIMITED: "Too many attempts. Please wait a moment.", GOOGLE_ROLE: "Google sign-in is for patients only. Staff and doctors use their e-mail and password.",
  GOOGLE_UNVERIFIED: "Your Google e-mail is not verified.", OAuthSignin: "Google sign-in is not available right now.", Callback: "Google sign-in failed. Please try again.", AccessDenied: "Access denied.",
};
const homeFor = { patient: "/patient", doctor: "/doctor", receptionist: "/reception", admin: "/admin" };

export function LoginForm() {
  const router = useRouter(); const sp = useSearchParams();
  const [email, setEmail] = useState(sp.get("email") || ""); const [password, setPassword] = useState("");
  const [error, setError] = useState(MESSAGES[sp.get("error")] || ""); const [busy, setBusy] = useState(false);
  const [google, setGoogle] = useState(false); const [needsVerify, setNeedsVerify] = useState(false);
  useEffect(() => { getProviders().then((p) => setGoogle(!!p?.google)).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(""); setNeedsVerify(false);
    const res = await signIn("credentials", { redirect: false, email, password });
    if (res?.error) { setError(MESSAGES[res.error] || "Could not sign in."); setNeedsVerify(res.error === "EMAIL_NOT_VERIFIED"); setBusy(false); return; }
    const s = await getSession();
    const cb = sp.get("callbackUrl");
    router.push(cb && cb.startsWith("/") && !cb.startsWith("//") ? cb : homeFor[s?.user?.role] || "/");
    router.refresh();
  }
  return (
    <div>
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to your CareNest account.</p>
      <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
        <TextField label="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}{needsVerify && <> <Link className="font-semibold underline" href={`/verify-email?email=${encodeURIComponent(email)}`}>Verify now</Link></>}</p>}
        <Button className="w-full" loading={busy}><LogIn className="h-4 w-4" />Sign in</Button>
        <div className="text-right"><Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link></div>
      </form>
      {google && (<>
        <div className="my-6 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
        <Button variant="outline" className="w-full" onClick={() => signIn("google", { callbackUrl: sp.get("callbackUrl") || "/patient" })}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.5-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z" /><path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.6 13.7a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z" /><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.3l3.8 3A6.9 6.9 0 0 1 12 5.4z" /></svg>
          Continue with Google (patients)
        </Button></>)}
      <p className="mt-8 text-center text-sm text-muted">New to CareNest? <Link href="/register" className="font-semibold text-primary hover:underline">Create a patient account</Link><br />Are you a doctor? <Link href="/register/doctor" className="font-semibold text-primary hover:underline">Register here</Link></p>
    </div>
  );
}
