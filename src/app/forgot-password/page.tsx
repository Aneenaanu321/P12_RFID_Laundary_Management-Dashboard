"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we’ll prepare a password reset link."
    >
      {state?.success ? (
        <div className="space-y-3">
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {state.success}
          </p>
          {state.resetLink && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Demo reset link
              </p>
              <Link
                href={state.resetLink}
                className="block text-sm text-blue-600 font-medium break-all hover:underline"
              >
                {state.resetLink}
              </Link>
            </div>
          )}
          <Link href="/login" className="block text-center text-xs text-blue-600 font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form action={formAction} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input name="email" type="email" required autoComplete="email" className={authInputClass} />
            </div>
            {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
            <button type="submit" disabled={pending} className={authButtonClass}>
              {pending ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <p className="mt-5 text-center text-xs text-slate-500">
            Remembered your password?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
