"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { signupAction } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <AuthShell title="Create account" subtitle="Sign up to access RFID Linen Management.">
      <form action={formAction} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Full name</label>
          <input name="name" type="text" required autoComplete="name" className={authInputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Email</label>
          <input name="email" type="email" required autoComplete="email" className={authInputClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Password</label>
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
          <label className="text-xs font-medium text-slate-600">Confirm password</label>
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
          {pending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
