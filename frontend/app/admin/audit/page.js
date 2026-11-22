"use client";
import { useState } from "react";
import { useFetch } from "@/hooks/useFetch.js";
import { fmtDateTime } from "@/lib/client.js";
import { Input } from "@/components/ui/Form.jsx";
import { EmptyState, PageHeader, SkeletonRows } from "@/components/ui/Misc.jsx";
export default function Page() {
  const [f, setF] = useState(""); const { data, loading } = useFetch(`/api/admin/audit?action=${encodeURIComponent(f)}`);
  return (
    <div className="mx-auto max-w-6xl"><PageHeader title="Audit log" subtitle="Sensitive operations: record access, verification decisions, account changes." />
      <Input className="mb-5 max-w-xs" placeholder="Filter by action prefix, e.g. record." value={f} onChange={(e) => setF(e.target.value)} aria-label="Filter" />
      {loading && <SkeletonRows />}
      {data && (data.logs.length ? <div className="card overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-line text-xs uppercase tracking-wide text-muted"><tr><th className="p-4">When</th><th>Actor</th><th>Action</th><th>Resource</th><th>IP</th></tr></thead>
        <tbody>{data.logs.map((l) => <tr key={l.id} className="border-b border-line/60 last:border-0"><td className="p-4 text-muted">{fmtDateTime(l.createdAt)}</td><td>{l.actor} <span className="text-xs text-muted">{l.role}</span></td><td className="font-mono text-xs">{l.action}</td><td className="text-xs text-muted">{l.resource} {l.resourceId?.slice(-6)}</td><td className="text-xs text-muted">{l.ip}</td></tr>)}</tbody></table></div> : <EmptyState title="No entries" />)}
    </div>);
}
