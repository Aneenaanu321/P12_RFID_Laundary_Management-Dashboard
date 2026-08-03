"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 text-center">
      <Image
        src="/brand/ibtech-logo.png"
        alt="ibTech"
        width={140}
        height={49}
        className="h-10 w-auto object-contain mb-8 dark:hidden"
      />
      <Image
        src="/brand/ibtech-logo-dark.png"
        alt="ibTech"
        width={140}
        height={49}
        className="h-10 w-auto object-contain mb-8 hidden dark:block"
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--status-red)] mb-2">
        Something went wrong
      </p>
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Unexpected error</h1>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8">
        An error occurred while loading this page. You can try again or return to the dashboard.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="primary" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] a11y-focus"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
