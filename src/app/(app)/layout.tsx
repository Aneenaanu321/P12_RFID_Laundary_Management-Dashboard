import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAlertCounts } from "@/lib/queries";
import { AppShell } from "@/components/layout/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const alertCounts = getAlertCounts();
  const alertCount = alertCounts.reduce((s, a) => s + a.c, 0);

  return (
    <AppShell role={session.role} name={session.name} alertCount={alertCount}>
      {children}
    </AppShell>
  );
}
