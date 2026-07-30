import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getItemTypes } from "@/lib/queries";
import { fmtAED, fmtNumber } from "@/lib/format";

export default function Page() {
  const itemTypes = getItemTypes();
  return (
    <div>
      <PageHeader title="Item Types" subtitle="The catalogue of linen item types tracked across the system." />
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Item Type</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 font-medium">Unit Value</th>
              <th className="px-3 py-3 font-medium">Price / Cycle</th>
              <th className="px-3 py-3 font-medium">Max Wash Cycles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itemTypes.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-3 py-3 text-slate-500">{t.category}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtAED(t.unitValue)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtAED(t.pricePerCycle)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(t.maxWashCycles)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
