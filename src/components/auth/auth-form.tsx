"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

type Mode = "login" | "register";

export function AuthForm({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { login, register, user } = useAuth();

  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [workspaceName, setWorkspaceName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, name, workspaceName });
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 shadow-sm"
      >
        <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Atomisense home">
          <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" opacity="0.55" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" opacity="0.55" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">
            Atomisense
          </span>
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
          {mode === "login" ? "Sign in to your workspace" : "Create your workspace"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "login"
            ? "Pick up where you left off — your components, files, and scans are waiting."
            : "A fresh workspace, isolated SQLite database, ready in seconds."}
        </p>

        <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
          {mode === "register" && (
            <>
              <Field
                label="Your name"
                value={name}
                onChange={setName}
                placeholder="Casey Designer"
                autoComplete="name"
              />
              <Field
                label="Workspace name"
                value={workspaceName}
                onChange={setWorkspaceName}
                placeholder="Acme Design Ops"
                autoComplete="organization"
              />
            </>
          )}
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />

          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-1 h-11 rounded-md bg-foreground text-[14px] font-medium text-background hover:bg-foreground/90"
          >
            {submitting
              ? mode === "login"
                ? "Signing in…"
                : "Creating workspace…"
              : mode === "login"
              ? "Sign in"
              : "Create workspace"}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              New to Atomisense?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Create a workspace
              </button>
            </>
          ) : (
            <>
              Already have a workspace?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  required,
  minLength,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  suffix?: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className="h-10 w-full rounded-md border border-border/70 bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-foreground/30 focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        {suffix}
      </div>
    </label>
  );
}
