"use client";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { api, fmtDateTime } from "@/lib/client.js";
import { useFetch } from "@/hooks/useFetch.js";
import { Button } from "../ui/Button.jsx";
import { EmptyState, ErrorState, PageHeader, SkeletonRows } from "../ui/Misc.jsx";

export function NotificationsList() {
  const { data, loading, error, reload } = useFetch("/api/notifications");
  const mark = async (body) => { await api("/api/notifications", { method: "PATCH", body }); await reload(); window.dispatchEvent(new Event("cn:notifications")); };
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" subtitle={data ? `${data.unread} unread` : ""} action={data?.unread > 0 && <Button variant="outline" size="sm" onClick={() => mark({ all: true })}><CheckCheck className="h-4 w-4" />Mark all as read</Button>} />
      {loading && <SkeletonRows />}{error && <ErrorState message={error} onRetry={reload} />}
      {data && (data.notifications.length ? (
        <ul className="space-y-3">{data.notifications.map((n) => (
          <li key={n.id} className={`card flex gap-4 p-4 ${n.read ? "opacity-70" : "border-gold/50"}`}>
            <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-gold"}`} aria-label={n.read ? "Read" : "Unread"} />
            <div className="min-w-0 flex-1"><p className="font-medium">{n.title}</p><p className="mt-0.5 text-sm text-muted">{n.body}</p><p className="mt-1 text-xs text-muted">{fmtDateTime(n.createdAt)}</p></div>
            <div className="flex flex-col items-end gap-1 text-xs">{n.link && <Link href={n.link} onClick={() => !n.read && mark({ id: n.id })} className="font-semibold text-primary hover:underline">Open</Link>}{!n.read && <button onClick={() => mark({ id: n.id })} className="text-muted hover:text-ink">Mark read</button>}</div>
          </li>))}</ul>
      ) : <EmptyState icon={Bell} title="You’re all caught up" text="New updates about appointments and your account appear here." />)}
    </div>
  );
}
