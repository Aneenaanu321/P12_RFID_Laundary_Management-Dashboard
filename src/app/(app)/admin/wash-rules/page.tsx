import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormField";
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
              <FormInput
                label="Max Cycles"
                name="maxWashCycles"
                type="number"
                defaultValue={t.maxWashCycles}
              />
              <FormInput
                label="Monitor %"
                name="monitorPct"
                type="number"
                defaultValue={t.monitorThresholdPct}
              />
              <FormInput
                label="Near EOL %"
                name="eolPct"
                type="number"
                defaultValue={t.nearEolThresholdPct}
              />
              <Button type="submit" variant="primary" className="col-span-3 mt-1">
                Save Rule
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
