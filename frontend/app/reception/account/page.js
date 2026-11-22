import { PageHeader } from "@/components/ui/Misc.jsx";
import { AccountPanel } from "@/components/portal/AccountPanel.jsx";
export const metadata = { title: "My account" };
export default function Page() { return <div className="mx-auto max-w-3xl"><PageHeader title="My account" subtitle="Photo, details and password." /><AccountPanel /></div>; }
