import { Suspense } from "react";
import { LoginForm } from "@/components/portal/LoginForm.jsx";
export const metadata = { title: "Sign in" };
export default function Login() { return <Suspense><LoginForm /></Suspense>; }
