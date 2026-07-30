import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getCustomerLocations } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";
import Link from "next/link";

export default function Page() {
  const locations = getCustomerLocations();
  return (
    <div>
      <PageHeader title="Locations" subtitle="All customer sites and branches tracked in the system." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Location</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">City</th>
              <th className="px-3 py-3 font-medium">Items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {locations.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{l.name}</td>
                <td className="px-3 py-3 text-blue-700"><Link href={`/customers`}>{l.customerName}</Link></td>
                <td className="px-3 py-3 text-slate-500">{l.city ?? "—"}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(l.itemCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
