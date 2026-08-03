"use client";

import { useActionState, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthShell,
  authButtonClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/AuthShell";
import { loginAction } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "1";
  const from = searchParams.get("from") || "/";
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthShell title="Sign in" subtitle="Access your laundry operations dashboard.">
      {resetOk && (
        <p className="mb-5 text-sm text-[var(--auth-green-deep)] bg-[var(--auth-green-soft)] border border-[var(--auth-green)]/20 rounded-lg px-3.5 py-2.5">
          Password updated. You can sign in with your new password.
        </p>
      )}

      <form action={formAction} className="space-y-4" autoComplete="on">
        <input type="hidden" name="from" value={from} />
        <p className="text-[12px] text-[var(--auth-muted)] bg-[var(--auth-green-soft)]/60 border border-[var(--auth-green)]/15 rounded-lg px-3 py-2">
          Demo: <span className="font-medium text-[var(--auth-ink)]">aneena.antony@ibtechintl.com</span>
          {" · "}
          <span className="font-medium text-[var(--auth-ink)]">Aneenaantony@123</span>
        </p>
        <div>
          <label className={authLabelClass}>Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue="aneena.antony@ibtechintl.com"
            className={authInputClass}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[13px] font-medium text-[var(--auth-ink)]">Password</label>
            <Link href="/forgot-password" className={`text-[12px] ${authLinkClass}`}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              defaultValue="Aneenaantony@123"
              className={`${authInputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--auth-muted)] hover:text-[var(--auth-ink)] hover:bg-black/5 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
            </button>
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            name="remember"
            type="checkbox"
            className="h-4 w-4 rounded border-[var(--auth-border)] text-[var(--auth-green)] accent-[var(--auth-green)] focus:ring-[var(--auth-green-soft)]"
          />
          <span className="text-[13px] text-[var(--auth-ink)]">Remember me for 30 days</span>
        </label>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className={`${authButtonClass} mt-1`}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-[var(--auth-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className={authLinkClass}>
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <AuthShell title="Sign in" subtitle="Access your laundry operations dashboard.">
          <p className="text-sm text-[var(--auth-muted)]">Loading...</p>
        </AuthShell>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
