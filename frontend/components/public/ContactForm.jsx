"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/client.js";
import { Button } from "../ui/Button.jsx";
import { TextField } from "../ui/Form.jsx";
import { useToast } from "../ui/Toast.jsx";

export function ContactForm() {
  const { toast } = useToast();
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErrs({});
    try { const r = await api("/api/contact", { method: "POST", body: v }); toast(r.message); setV({ name: "", email: "", subject: "", message: "" }); }
    catch (err) { setErrs(err.fields || {}); toast(err.message, "error"); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className="card space-y-4 p-7" noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><TextField label="Your name" value={v.name} onChange={set("name")} error={errs.name} autoComplete="name" required /><TextField label="E-mail" type="email" value={v.email} onChange={set("email")} error={errs.email} autoComplete="email" required /></div>
      <TextField label="Subject" value={v.subject} onChange={set("subject")} error={errs.subject} required />
      <TextField as="textarea" label="Message" value={v.message} onChange={set("message")} error={errs.message} required />
      <Button loading={busy}><Send className="h-4 w-4" />Send message</Button>
    </form>
  );
}
