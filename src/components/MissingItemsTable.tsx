"use client";

import { useMemo } from "react";
import { Item } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { ActionToastButton } from "@/components/ui/ActionToastButton";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { fmtAED, fmtDateTime, daysSince } from "@/lib/format";
import { markItemFound, markItemLost, flagItem } from "@/lib/actions";
import Link from "next/link";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
  DataTableSortHeader,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  sortByKey,
  useDataTable,
} from "@/components/ui/DataTable";

function MissingItemsTableInner({ rows, path }: { rows: Item[]; path: string }) {
  const { sortKey, sortDir } = useDataTable();
  const sorted = useMemo(
    () =>
      sortByKey(rows, sortKey, sortDir, {
        item: (r) => r.itemCode,
        customer: (r) => r.customerName,
        lastSeen: (r) => r.missingSince ?? "",
        days: (r) => (r.missingSince ? daysSince(r.missingSince) : 0),
        value: (r) => r.value,
      }),
    [rows, sortKey, sortDir]
  );

  return (
    <>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableSortHeader sortKey="item">RFID / Item</DataTableSortHeader>
          <DataTableSortHeader sortKey="customer">Customer</DataTableSortHeader>
          <DataTableSortHeader sortKey="lastSeen">Last Seen</DataTableSortHeader>
          <DataTableSortHeader sortKey="days">Days Missing</DataTableSortHeader>
          <DataTableSortHeader sortKey="value">Value</DataTableSortHeader>
          <DataTableHeader align="right">Actions</DataTableHeader>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {sorted.map((it) => (
          <DataTableRow key={it.id}>
            <DataTableCell>
              <Link
                href={`/inventory/${it.itemCode}`}
                className="font-medium text-[var(--status-blue)] hover:underline"
              >
                {it.itemCode}
              </Link>
              <p className="text-xs text-[var(--muted-fg)]">{it.itemTypeName}</p>
              <p className="text-xs font-mono text-[var(--muted-fg)]">{it.epc}</p>
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{it.customerName}</DataTableCell>
            <DataTableCell className="text-[var(--muted)]">
              {it.missingSince ? fmtDateTime(it.missingSince) : "—"}
            </DataTableCell>
            <DataTableCell className="tabular-nums text-[var(--foreground)]">
              {it.missingSince ? daysSince(it.missingSince) : "—"}
            </DataTableCell>
            <DataTableCell className="tabular-nums text-[var(--foreground)]">{fmtAED(it.value)}</DataTableCell>
            <DataTableCell>
              <div className="flex justify-end gap-1.5">
                <ActionToastButton
                  variant="secondary"
                  size="sm"
                  formAction={flagItem.bind(null, it.id, path)}
                  successTitle="Flagged for investigation"
                  successMessage={it.itemCode}
                >
                  Investigate
                </ActionToastButton>
                <ActionToastButton
                  variant="success"
                  size="sm"
                  formAction={markItemFound.bind(null, it.id, path)}
                  successTitle="Item marked as found"
                  successMessage={it.itemCode}
                >
                  Mark Found
                </ActionToastButton>
                <ConfirmButton
                  variant="danger"
                  size="sm"
                  confirmTitle="Mark as lost?"
                  confirmDescription={`Permanently mark ${it.itemCode} as lost. This affects loss analytics and settlements.`}
                  confirmLabel="Mark Lost"
                  confirmVariant="danger"
                  formAction={markItemLost.bind(null, it.id, path)}
                  successTitle="Item marked as lost"
                  successMessage={it.itemCode}
                >
                  Mark Lost
                </ConfirmButton>
              </div>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </>
  );
}

export function MissingItemsTable({ rows, path }: { rows: Item[]; path: string }) {
  if (rows.length === 0) {
    return <EmptyState title="No missing items" subtitle="Everything currently tracked is accounted for." />;
  }
  return (
    <DataTable>
      <MissingItemsTableInner rows={rows} path={path} />
    </DataTable>
  );
}
