import { requirePage } from "@/lib/session.js";
import { PortalShell } from "@/components/portal/PortalShell.jsx";
export const metadata = { robots: { index: false } };
export default async function Layout({ children }) {
  const { user } = await requirePage("receptionist");
  return <PortalShell role="receptionist" user={user}>{children}</PortalShell>;
}
