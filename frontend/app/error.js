"use client";
import { Button } from "@/components/ui/Button.jsx";
import { AlertTriangle } from "lucide-react";
export default function Error({ reset }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-gold/30 bg-surface p-10 shadow-soft">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/15 text-gold"><AlertTriangle className="h-7 w-7" /></span>
        <h1 className="mt-5 text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-3 max-w-md text-muted">The page could not be completed. Please try again or return to the CareNest home page.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
