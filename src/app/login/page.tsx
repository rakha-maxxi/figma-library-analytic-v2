import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in — Atomisense",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm initialMode="login" />
    </Suspense>
  );
}
