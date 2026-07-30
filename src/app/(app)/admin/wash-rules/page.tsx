import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { getItemTypes } from "@/lib/queries";
import { updateWashRuleAction } from "@/lib/adminActions";

export default function Page() {
  const itemTypes = getItemTypes();
  return (
    <div>
      <PageHeader title="Wash Cycle Rules" subtitle="Configure the maximum wash cycles and lifecycle thresholds per item type." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {itemTypes.map((t) => (
          <Card key={t.id}>
            <CardHeader title={t.name} subtitle={t.category} />
            <form action={updateWashRuleAction} className="px-5 pb-5 grid grid-cols-3 gap-3">
              <input type="hidden" name="id" value={t.id} />
              <label className="text-xs text-slate-500">
                Max Cycles
                <input name="maxWashCycles" type="number" defaultValue={t.maxWashCycles} className="mt-1 w-full px-2 py-1.5 text-sm rounded-md border border-slate-200" />
              </label>
              <label className="text-xs text-slate-500">
                Monitor %
                <input name="monitorPct" type="number" defaultValue={t.monitorThresholdPct} className="mt-1 w-full px-2 py-1.5 text-sm rounded-md border border-slate-200" />
              </label>
              <label className="text-xs text-slate-500">
                Near EOL %
                <input name="eolPct" type="number" defaultValue={t.nearEolThresholdPct} className="mt-1 w-full px-2 py-1.5 text-sm rounded-md border border-slate-200" />
              </label>
              <button type="submit" className="col-span-3 mt-1 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Save Rule
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
