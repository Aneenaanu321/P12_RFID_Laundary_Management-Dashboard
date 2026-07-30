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
import { signupAction } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <AuthShell title="Create account" subtitle="Join the RFID Linen Management platform.">
      <form action={formAction} className="space-y-4">
        <div>
          <label className={authLabelClass}>Full name</label>
          <input name="name" type="text" required autoComplete="name" className={authInputClass} />
        </div>
        <div>
          <label className={authLabelClass}>Email</label>
          <input name="email" type="email" required autoComplete="email" className={authInputClass} />
        </div>
        <div>
          <label className={authLabelClass}>Password</label>
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
          <label className={authLabelClass}>Confirm password</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={authInputClass}
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className={`${authButtonClass} mt-1`}>
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-[14px] text-[var(--auth-muted)]">
        Already have an account?{" "}
        <Link href="/login" className={authLinkClass}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
