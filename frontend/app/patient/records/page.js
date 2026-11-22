import { PageHeader } from "@/components/ui/Misc.jsx";
import { RecordsPanel } from "@/components/portal/RecordsPanel.jsx";
export const metadata = { title: "Medical records" };
export default function Page() { return <div className="mx-auto max-w-4xl"><PageHeader title="Medical records" subtitle="History, allergies, medications, diagnoses and reports." /><RecordsPanel patientId="me" role="patient" /></div>; }
