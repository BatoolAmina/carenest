"use client";
import { useSession } from "next-auth/react";
import { UserRound } from "lucide-react";
import { BookingFlow } from "../portal/BookingFlow.jsx";
import { ButtonLink } from "../ui/Button.jsx";
import { EmptyState, Skeleton } from "../ui/Misc.jsx";

export function BookPageClient({ initial }) {
  const { data, status } = useSession();
  if (status === "loading") return <Skeleton className="h-96" />;
  if (!data?.user) {
    const cb = encodeURIComponent(`/book?${new URLSearchParams(Object.entries(initial).filter(([, v]) => v))}`);
    return <EmptyState icon={UserRound} title="Sign in to book" text="Your appointments and records stay linked to your secure patient account." action={<div className="flex gap-3"><ButtonLink href={`/login?callbackUrl=${cb}`}>Sign in</ButtonLink><ButtonLink href="/register" variant="outline">Create account</ButtonLink></div>} />;
  }
  if (data.user.role !== "patient") return <EmptyState title="Patients book here" text="Reception staff schedule appointments from the reception portal." action={<ButtonLink href="/reception" variant="outline">Open portal</ButtonLink>} />;
  return <BookingFlow initial={initial} />;
}
