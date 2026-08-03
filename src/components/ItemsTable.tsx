"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Item } from "@/lib/queries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fmtAED, fmtDateTime, titleCase } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  DataTable,
  DataTableHead,
  DataTableHeaderRow,
  DataTableSortHeader,
  DataTableBody,
  DataTableRow,
  DataTableCell,
  sortByKey,
  useDataTable,
} from "@/components/ui/DataTable";

function ItemsTableInner({ rows }: { rows: Item[] }) {
  const { sortKey, sortDir } = useDataTable();

  const sorted = useMemo(
    () =>
      sortByKey(rows, sortKey, sortDir, {
        item: (r) => r.itemCode,
        type: (r) => r.itemTypeName,
        customer: (r) => r.customerName,
        zone: (r) => r.currentZone,
        status: (r) => (r.missing ? "MISSING" : r.currentStatus),
        washes: (r) => r.washCycles,
        lifecycle: (r) => r.lifecycleStatus,
        value: (r) => r.value,
        lastRead: (r) => r.lastReadAt ?? "",
      }),
    [rows, sortKey, sortDir]
  );

  return (
    <>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableSortHeader sortKey="item">RFID / Item</DataTableSortHeader>
          <DataTableSortHeader sortKey="type">Type</DataTableSortHeader>
          <DataTableSortHeader sortKey="customer">Customer</DataTableSortHeader>
          <DataTableSortHeader sortKey="zone">Zone</DataTableSortHeader>
          <DataTableSortHeader sortKey="status">Status</DataTableSortHeader>
          <DataTableSortHeader sortKey="washes">Wash Cycles</DataTableSortHeader>
          <DataTableSortHeader sortKey="lifecycle">Lifecycle</DataTableSortHeader>
          <DataTableSortHeader sortKey="value">Value</DataTableSortHeader>
          <DataTableSortHeader sortKey="lastRead">Last Read</DataTableSortHeader>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {sorted.map((it) => (
          <DataTableRow key={it.id}>
            <DataTableCell>
              <Link
                href={`/inventory/${it.itemCode}`}
                className="block rounded-sm a11y-focus"
                aria-label={`Item ${it.itemCode}, EPC ${it.epc}`}
              >
                <p className="font-medium text-[var(--status-blue)] hover:underline">{it.itemCode}</p>
                <p className="text-xs text-[var(--muted-fg)] font-mono">{it.epc}</p>
              </Link>
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{it.itemTypeName}</DataTableCell>
            <DataTableCell>
              <Link
                href={`/customers/${it.customerId}`}
                className="rounded-sm text-[var(--foreground)] hover:text-[var(--status-blue)] hover:underline a11y-focus"
                aria-label={`Customer ${it.customerName}`}
              >
                {it.customerName}
              </Link>
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{titleCase(it.currentZone)}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={it.missing ? "MISSING" : it.currentStatus} />
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)] tabular-nums">
              {it.washCycles} / {it.maxWashCycles}
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={it.lifecycleStatus} />
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)] tabular-nums">{fmtAED(it.value)}</DataTableCell>
            <DataTableCell className="text-[var(--muted)] whitespace-nowrap">
              {fmtDateTime(it.lastReadAt)}
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </>
  );
}

export function ItemsTable({ rows }: { rows: Item[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No items match these filters" subtitle="Try adjusting search or filter criteria." />;
  }

  return (
    <DataTable>
      <ItemsTableInner rows={rows} />
    </DataTable>
  );
}
