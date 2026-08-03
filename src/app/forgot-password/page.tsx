"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AuthShell,
  authButtonClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
} from "@/components/auth/AuthShell";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we’ll prepare a password reset link."
    >
      {state?.success ? (
        <div className="space-y-4">
          <p className="text-sm text-[var(--auth-green-deep)] bg-[var(--auth-green-soft)] border border-[var(--auth-green)]/20 rounded-lg px-3.5 py-2.5">
            {state.success}
          </p>
          {state.resetLink && (
            <div className="rounded-lg border border-[var(--auth-border)] bg-[var(--card-bg)]/70 p-3.5 space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--auth-muted)]">
                Demo reset link
              </p>
              <Link href={state.resetLink} className={`block text-sm break-all ${authLinkClass}`}>
                {state.resetLink}
              </Link>
            </div>
          )}
          <Link href="/login" className={`inline-block text-sm ${authLinkClass}`}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form action={formAction} className="space-y-4">
            <div>
              <label className={authLabelClass}>Email</label>
              <input name="email" type="email" required autoComplete="email" className={authInputClass} />
            </div>
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button type="submit" disabled={pending} className={authButtonClass}>
              {pending ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <p className="mt-6 text-[14px] text-[var(--auth-muted)]">
            Remembered your password?{" "}
            <Link href="/login" className={authLinkClass}>
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
