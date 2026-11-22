import { PageHeader } from "@/components/ui/Misc.jsx";
import { PatientProfileForm } from "@/components/portal/PatientProfileForm.jsx";
import { AccountPanel } from "@/components/portal/AccountPanel.jsx";
export const metadata = { title: "My profile" };
export default function Page() {
  return (<div className="mx-auto max-w-3xl space-y-8"><PageHeader title="My profile" subtitle="Your details, photo and security." /><PatientProfileForm /><AccountPanel showProfile={false} showExport /></div>);
}
