"use client";

import { ClientTableSearch } from "@/components/ClientTableSearch";
import { fmtAED, fmtNumber } from "@/lib/format";

type ItemType = {
  id: string;
  name: string;
  category: string;
  unitValue: number;
  pricePerCycle: number;
  maxWashCycles: number;
  monitorThresholdPct?: number;
  nearEolThresholdPct?: number;
};

export function SearchableItemTypesTable({
  itemTypes,
  mode = "catalog",
}: {
  itemTypes: ItemType[];
  mode?: "catalog" | "wash-rules";
}) {
  const categories = [...new Set(itemTypes.map((t) => t.category))].sort();

  return (
    <ClientTableSearch
      rows={itemTypes}
      getSearchText={(t) => `${t.name} ${t.category}`}
      searchPlaceholder="Search item types..."
      filters={[
        {
          key: "category",
          label: "All Categories",
          getValue: (t) => t.category,
          options: categories.map((c) => ({ value: c, label: c })),
        },
      ]}
      emptyMessage="No item types match your search."
      exportFilename={mode === "wash-rules" ? "wash-cycle-rules" : "item-types"}
    >
      {(filtered) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Item Type</th>
                <th className="px-3 py-3 font-medium">Category</th>
                {mode === "catalog" ? (
                  <>
                    <th className="px-3 py-3 font-medium">Unit Value</th>
                    <th className="px-3 py-3 font-medium">Price / Cycle</th>
                    <th className="px-3 py-3 font-medium">Max Wash Cycles</th>
                  </>
                ) : (
                  <>
                    <th className="px-3 py-3 font-medium">Max Wash Cycles</th>
                    <th className="px-3 py-3 font-medium">Monitor Threshold</th>
                    <th className="px-3 py-3 font-medium">Near EOL Threshold</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-3 font-medium text-[var(--foreground)]">{t.name}</td>
                  <td className="px-3 py-3 text-[var(--muted)]">{t.category}</td>
                  {mode === "catalog" ? (
                    <>
                      <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtAED(t.unitValue)}</td>
                      <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtAED(t.pricePerCycle)}</td>
                      <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtNumber(t.maxWashCycles)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtNumber(t.maxWashCycles)}</td>
                      <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{t.monitorThresholdPct}%</td>
                      <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{t.nearEolThresholdPct}%</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientTableSearch>
  );
}
