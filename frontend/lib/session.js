import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth.js";

export const getSession = () => getServerSession(authOptions);
export const homeFor = (role) => ({ patient: "/patient", doctor: "/doctor", receptionist: "/reception", admin: "/admin" }[role] || "/");

export async function requirePage(role) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  if (role && session.user.role !== role) redirect(homeFor(session.user.role));
  return session;
}
