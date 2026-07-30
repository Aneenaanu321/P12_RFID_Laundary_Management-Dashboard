import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { BarHorizontal } from "@/components/charts/Charts";
import {
  getCustomerById, getCustomers, getCustomerDeptBreakdown, getItemsPage, getSettlementForCustomer,
} from "@/lib/queries";
import { fmtNumber, fmtAED } from "@/lib/format";
import { Package, Users, WashingMachine, CheckCircle2, AlertTriangle, Clock3 } from "lucide-react";
import Link from "next/link";

export default async function CustomerDetailPage({
  params, searchParams,
}: { params: Promise<{ customerId: string }>; searchParams: Promise<{ page?: string }> }) {
  const { customerId } = await params;
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr ?? 1);

  const customer = getCustomerById(customerId);
  if (!customer) notFound();

  const overview = getCustomers().find((c) => c.id === customerId)!;
  const depts = getCustomerDeptBreakdown(customerId);
  const { rows, pageCount } = getItemsPage({ customerId }, page, 20, "lastReadAt DESC");
  const settlement = getSettlementForCustomer(customerId);

  return (
    <div>
      <PageHeader
        breadcrumb="Customers"
        title={customer.name}
        subtitle={`${customer.type.charAt(0) + customer.type.slice(1).toLowerCase()} customer · ${customer.code}`}
        action={settlement ? (
          <Link href="/settlement" className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
            View Settlement
          </Link>
        ) : undefined}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard icon={Package} label="Total Inventory" value={fmtNumber(overview.totalItems)} tone="blue" />
        <KpiCard icon={Users} label="In Use" value={fmtNumber(overview.withCustomer)} tone="green" />
        <KpiCard icon={WashingMachine} label="In Laundry" value={fmtNumber(overview.inLaundry)} tone="blue" />
        <KpiCard icon={CheckCircle2} label="Ready" value={fmtNumber(overview.ready)} tone="green" />
        <KpiCard icon={AlertTriangle} label="Missing" value={fmtNumber(overview.missing)} tone="red" />
        <KpiCard icon={Clock3} label="Near End of Life" value={fmtNumber(overview.nearEol)} tone="amber" />
      </div>

      {depts.length > 0 && (
        <Card className="mb-6">
          <CardHeader title="Inventory by Department" />
          <div className="px-5 pb-5">
            <BarHorizontal data={depts} dataKey="c" nameKey="name" color="#2563eb" height={240} />
          </div>
        </Card>
      )}

      {settlement && (
        <Card className="mb-6">
          <CardHeader title="Latest Settlement" subtitle={settlement.settlement.periodLabel} />
          <div className="px-5 pb-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-2 font-medium">Item Type</th>
                  <th className="py-2 font-medium">Sent</th>
                  <th className="py-2 font-medium">Returned</th>
                  <th className="py-2 font-medium">Missing</th>
                  <th className="py-2 font-medium">Price/Cycle</th>
                  <th className="py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {settlement.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 text-slate-700">{l.itemTypeName}</td>
                    <td className="py-2 tabular-nums">{fmtNumber(l.sent)}</td>
                    <td className="py-2 tabular-nums">{fmtNumber(l.returned)}</td>
                    <td className="py-2 tabular-nums text-red-600">{fmtNumber(l.missing)}</td>
                    <td className="py-2 tabular-nums">{fmtAED(l.pricePerCycle)}</td>
                    <td className="py-2 tabular-nums font-medium">{fmtAED(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Inventory" />
        <ItemsTable rows={rows} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/customers/${customerId}?page=${p}`} />
      </Card>
    </div>
  );
}
