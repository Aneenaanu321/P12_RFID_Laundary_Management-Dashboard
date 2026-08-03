import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
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
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-fg)] mb-2">404</p>
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--accent-600)] text-white hover:opacity-90 a11y-focus"
        >
          Back to dashboard
        </Link>
        <Link
          href="/alerts"
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] a11y-focus"
        >
          Alert center
        </Link>
      </div>
    </div>
  );
}
