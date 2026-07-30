"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { resetPasswordAction } from "./actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (!token) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">This reset link is invalid or missing.</p>
        <Link href="/forgot-password" className="block text-center text-xs text-blue-600 font-medium hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="text-xs font-medium text-slate-600">New password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Confirm new password</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </div>
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className={authButtonClass}>
          {pending ? "Updating..." : "Update password"}
        </button>
      </form>
      <p className="mt-5 text-center text-xs text-slate-500">
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Reset password" subtitle="Choose a new password for your account.">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
