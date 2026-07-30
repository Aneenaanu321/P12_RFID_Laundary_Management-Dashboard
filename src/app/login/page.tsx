"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

  return (
    <AuthShell title="Sign in" subtitle="Access your laundry operations dashboard.">
      {resetOk && (
        <p className="mb-5 text-sm text-[var(--auth-green-deep)] bg-[var(--auth-green-soft)] border border-[var(--auth-green)]/20 rounded-lg px-3.5 py-2.5">
          Password updated. You can sign in with your new password.
        </p>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="from" value={from} />
        <div>
          <label className={authLabelClass}>Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
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
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={authInputClass}
          />
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
