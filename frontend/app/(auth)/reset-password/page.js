import { Suspense } from "react";
import { ResetPassword } from "@/components/portal/PasswordForms.jsx";
export const metadata = { title: "Reset password" };
export default function Page() { return <Suspense><ResetPassword /></Suspense>; }
