"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/AuthShell";
import { loginAction } from "./actions";

const DEMO_USERS = [
  { role: "Super Admin", email: "aneena.antony@ibtechintl.com" },
];

function LoginForm() {
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "1";
  const from = searchParams.get("from") || "/";
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <AuthShell title="Sign in" subtitle="Track. Wash. Control. Optimize.">
      {resetOk && (
        <p className="mb-3 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Password updated. You can sign in with your new password.
        </p>
      )}

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="from" value={from} />
        <div>
          <label className="text-xs font-medium text-slate-600">Email</label>
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-600">Password</label>
            <Link href="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
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
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        <button type="submit" disabled={pending} className={authButtonClass}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 font-medium hover:underline">
          Create account
        </Link>
      </p>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">Demo account</p>
        <div className="space-y-1">
          {DEMO_USERS.map((u) => (
            <p key={u.email} className="text-xs text-slate-500 flex justify-between gap-2">
              <span>{u.role}</span>
              <span className="text-slate-400 truncate">{u.email}</span>
            </p>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthShell title="Sign in" subtitle="Track. Wash. Control. Optimize.">
        <p className="text-sm text-slate-500">Loading...</p>
      </AuthShell>
    }>
      <LoginForm />
    </Suspense>
  );
}
