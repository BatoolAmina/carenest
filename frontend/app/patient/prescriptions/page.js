import { PageHeader } from "@/components/ui/Misc.jsx";
import { RecordsPanel } from "@/components/portal/RecordsPanel.jsx";
export const metadata = { title: "Prescriptions" };
export default function Page() { return <div className="mx-auto max-w-4xl"><PageHeader title="Prescriptions" subtitle="Issued by your treating doctors." /><RecordsPanel patientId="me" role="patient" mode="prescriptions" /></div>; }
