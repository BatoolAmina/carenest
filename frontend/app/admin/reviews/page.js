"use client";
import { Star, EyeOff, Eye } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "@/components/ui/Button.jsx";
import { Badge, EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
import { useToast } from "@/components/ui/Toast.jsx";
export default function Page() {
  const { toast } = useToast(); const { data, loading, reload } = useFetch("/api/admin/reviews");
  async function set(r, status) { try { await api(`/api/admin/reviews/${r.id}`, { method: "PATCH", body: { status } }); toast(status === "hidden" ? "Review hidden" : "Review restored"); reload(); } catch (e) { toast(e.message, "error"); } }
  return (
    <div className="mx-auto max-w-4xl"><PageHeader title="Patient reviews" subtitle="Hide inappropriate reviews. Hidden reviews don’t count toward ratings." />
      {loading && <SkeletonRows />}
      {data && (data.reviews.length ? <ul className="space-y-3">{data.reviews.map((r) => (
        <li key={r.id} className="card flex flex-wrap items-start gap-4 p-4"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="flex">{Array.from({ length: r.rating }, (_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}</span>{r.status === "hidden" && <Badge tone="gray">Hidden</Badge>}</div>
          <p className="mt-1 text-sm">{r.comment || <span className="text-muted">No comment</span>}</p><p className="mt-1 text-xs text-muted">{r.patient} → Dr. {r.doctor} · {fmtDateTime(r.createdAt)}</p></div>
          <Button size="sm" variant="outline" onClick={() => set(r, r.status === "visible" ? "hidden" : "visible")}>{r.status === "visible" ? <><EyeOff className="h-3.5 w-3.5" />Hide</> : <><Eye className="h-3.5 w-3.5" />Restore</>}</Button></li>))}</ul> : <EmptyState icon={Star} title="No reviews yet" />)}
    </div>);
}
