import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth.js";

export const getSession = () => getServerSession(authOptions);
export const homeFor = (role) => ({ patient: "/patient", doctor: "/doctor", receptionist: "/reception", admin: "/admin" }[role] || "/");

/** For server components/layouts: enforce signed-in + role, else redirect. */
export async function requirePage(role) {
  const s = await getSession();
  if (!s?.user) redirect("/login");
  if (role && s.user.role !== role) redirect(homeFor(s.user.role));
  return s;
}
