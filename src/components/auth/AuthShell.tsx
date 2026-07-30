import Image from "next/image";
import Link from "next/link";
import { Syne, Figtree } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-auth-display",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-auth-body",
});

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${syne.variable} ${figtree.variable} auth-shell min-h-screen w-full grid lg:grid-cols-2`}>
      {/* Brand plane */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden px-12 py-12 text-white auth-brand-panel">
        <div className="auth-orb auth-orb-a" aria-hidden />
        <div className="auth-orb auth-orb-b" aria-hidden />
        <div className="auth-grid" aria-hidden />

        <Link href="/login" className="relative z-10 inline-flex w-fit" aria-label="ibTech home">
          <Image
            src="/brand/ibtech-logo-dark.png"
            alt="ibTech"
            width={160}
            height={56}
            className="h-10 w-auto object-contain auth-fade-in"
            priority
          />
        </Link>

        <div className="relative z-10 max-w-md auth-rise">
          <p className="auth-display text-[clamp(2.4rem,4vw,3.6rem)] font-extrabold leading-[1.05] tracking-tight">
            RFID Linen
            <br />
            Management
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75 max-w-sm">
            Track. Wash. Control. Optimize. Live visibility across inventory, laundry, and lifecycle.
          </p>
        </div>

        <p className="relative z-10 text-xs tracking-[0.18em] uppercase text-white/45">
          ibTech · Operations Platform
        </p>
      </aside>

      {/* Form plane */}
      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 auth-form-panel">
        <div className="auth-form-wash" aria-hidden />

        <div className="relative z-10 w-full max-w-[400px] auth-form-enter">
          <div className="lg:hidden mb-8">
            <Link href="/login" className="inline-flex" aria-label="ibTech home">
              <Image
                src="/brand/ibtech-logo.png"
                alt="ibTech"
                width={140}
                height={49}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>
            <p className="auth-display mt-4 text-2xl font-extrabold tracking-tight text-[var(--auth-ink)]">
              RFID Linen Management
            </p>
          </div>

          <h1 className="auth-display text-[1.75rem] font-bold tracking-tight text-[var(--auth-ink)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-[15px] text-[var(--auth-muted)] leading-relaxed">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </div>
  );
}

export const authLabelClass = "block text-[13px] font-medium text-[var(--auth-ink)] mb-1.5";

export const authInputClass =
  "w-full px-3.5 py-2.5 text-[15px] rounded-lg border border-[var(--auth-border)] bg-white/80 text-[var(--auth-ink)] placeholder:text-slate-400 outline-none transition-[border-color,box-shadow,background] focus:bg-white focus:border-[var(--auth-green)] focus:ring-4 focus:ring-[var(--auth-green-soft)]";

export const authButtonClass =
  "w-full py-2.5 rounded-lg bg-[var(--auth-green)] text-white text-[15px] font-semibold tracking-wide hover:bg-[var(--auth-green-deep)] disabled:opacity-60 transition-colors auth-btn-press";

export const authLinkClass = "text-[var(--auth-green-deep)] font-semibold hover:underline underline-offset-2";
