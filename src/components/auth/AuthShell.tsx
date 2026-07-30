import Image from "next/image";
import Link from "next/link";

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
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--navy-950)] p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/login" aria-label="ibTech home">
            <Image
              src="/brand/ibtech-logo-dark.png"
              alt="ibTech"
              width={180}
              height={63}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
          <p className="mt-3 text-sm font-semibold tracking-wide text-white text-center">
            RFID Linen Management
          </p>
          <p className="mt-1 text-[11px] tracking-wider text-slate-400 uppercase text-center">
            Dashboard
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-lg font-bold text-slate-900 text-center">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1 mb-5 text-center">{subtitle}</p>}
          {!subtitle && <div className="mb-5" />}
          {children}
        </div>
      </div>
    </div>
  );
}

export const authInputClass =
  "mt-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300";

export const authButtonClass =
  "w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60";
