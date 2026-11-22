import { Suspense } from "react";
import { VerifyEmail } from "@/components/portal/VerifyEmail.jsx";
export const metadata = { title: "Verify e-mail" };
export default function Page() { return <Suspense><VerifyEmail /></Suspense>; }
