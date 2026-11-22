import { requirePage } from "@/lib/session.js";
import { PortalShell } from "@/components/portal/PortalShell.jsx";
export const metadata = { robots: { index: false } };
export default async function Layout({ children }) {
  const { user } = await requirePage("admin");
  return <PortalShell role="admin" user={user}>{children}</PortalShell>;
}
