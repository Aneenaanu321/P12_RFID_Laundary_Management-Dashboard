"use client";

import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { ClientTableSearch } from "@/components/ClientTableSearch";

type Row = {
  id: string;
  name: string;
  type: string;
  totalItems: number;
  inLaundry: number;
  ready: number;
  missing: number;
  nearEol: number;
};

export function SearchableCustomerOverview({ rows }: { rows: Row[] }) {
  return (
    <ClientTableSearch
      rows={rows}
      getSearchText={(r) => `${r.name} ${r.type}`}
      searchPlaceholder="Search customers..."
      emptyMessage="No customers match your search."
      exportFilename="customers"
    >
      {(filtered) => <CustomerOverviewTable rows={filtered} />}
    </ClientTableSearch>
  );
}
