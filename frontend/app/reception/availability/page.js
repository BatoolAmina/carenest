import { PageHeader } from "@/components/ui/Misc.jsx";
import { AvailabilityBoard } from "@/components/portal/AvailabilityBoard.jsx";
export const metadata = { title: "Doctor availability" };
export default function Page() { return <div className="mx-auto max-w-4xl"><PageHeader title="Doctor availability" subtitle="Live free slots from the booking engine." /><AvailabilityBoard /></div>; }
