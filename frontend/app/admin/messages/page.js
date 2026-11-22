"use client";
import { Mail, CheckCheck, Undo2 } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Badge, EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
export default function Page() {
  const { toast } = useToast(); const { data, loading, reload } = useFetch("/api/admin/messages");
  const toggle = async (m) => { try { await api(`/api/admin/messages/${m.id}`, { method: "PATCH", body: { handled: !m.handled } }); reload(); } catch (e) { toast(e.message, "error"); } };
  return (
    <div className="mx-auto max-w-4xl"><PageHeader title="Contact messages" subtitle={data ? `${data.open} awaiting a reply` : ""} />
      {loading && <SkeletonRows />}
      {data && (data.messages.length ? <ul className="space-y-3">{data.messages.map((m) => (
        <li key={m.id} className={`card p-5 ${m.handled ? "opacity-70" : "border-gold/50"}`}>
          <div className="flex flex-wrap items-center gap-2"><h2 className="font-sans text-base font-semibold">{m.subject}</h2>{m.handled && <Badge tone="gray">Handled</Badge>}<span className="ml-auto text-xs text-muted">{fmtDateTime(m.createdAt)}</span></div>
          <p className="mt-1 text-xs text-muted">{m.name} · <a className="text-primary hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
          <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => window.open(`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`)}><Mail className="h-3.5 w-3.5" />Reply</Button><Button size="sm" variant="ghost" onClick={() => toggle(m)}>{m.handled ? <><Undo2 className="h-3.5 w-3.5" />Reopen</> : <><CheckCheck className="h-3.5 w-3.5" />Mark handled</>}</Button></div>
        </li>))}</ul> : <EmptyState icon={Mail} title="No messages" text="Messages from the contact form appear here." />)}
    </div>);
}
