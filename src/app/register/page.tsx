import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Create your workspace — Atomisense",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm initialMode="register" />
    </Suspense>
  );
}
