"use client";

import { useMemo } from "react";
import { RfidEventRow } from "@/lib/queries";
import { fmtDateTime, titleCase } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
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

function EventsTableInner({ rows }: { rows: RfidEventRow[] }) {
  const { sortKey, sortDir } = useDataTable();
  const sorted = useMemo(
    () =>
      sortByKey(rows, sortKey, sortDir, {
        time: (r) => r.timestamp,
        item: (r) => r.itemCode,
        type: (r) => r.itemTypeName,
        customer: (r) => r.customerName,
        zone: (r) => r.zone,
        reader: (r) => r.readerCode,
        event: (r) => r.eventType,
        status: (r) => r.status,
      }),
    [rows, sortKey, sortDir]
  );

  return (
    <>
      <DataTableHead>
        <DataTableHeaderRow>
          <DataTableSortHeader sortKey="time">Time</DataTableSortHeader>
          <DataTableSortHeader sortKey="item">Item</DataTableSortHeader>
          <DataTableSortHeader sortKey="type">Type</DataTableSortHeader>
          <DataTableSortHeader sortKey="customer">Customer</DataTableSortHeader>
          <DataTableSortHeader sortKey="zone">Zone</DataTableSortHeader>
          <DataTableSortHeader sortKey="reader">Reader</DataTableSortHeader>
          <DataTableSortHeader sortKey="event">Event</DataTableSortHeader>
          <DataTableSortHeader sortKey="status">Status</DataTableSortHeader>
        </DataTableHeaderRow>
      </DataTableHead>
      <DataTableBody>
        {sorted.map((e) => (
          <DataTableRow key={e.id}>
            <DataTableCell className="text-[var(--muted)] whitespace-nowrap tabular-nums">
              {fmtDateTime(e.timestamp)}
            </DataTableCell>
            <DataTableCell>
              <Link
                href={`/inventory/${e.itemCode}`}
                className="text-[var(--status-blue)] hover:underline font-medium"
              >
                {e.itemCode}
              </Link>
              <p className="text-xs font-mono text-[var(--muted-fg)]">
                EPC-{e.itemId.slice(0, 8).toUpperCase()}
              </p>
            </DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{e.itemTypeName}</DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{e.customerName}</DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{titleCase(e.zone)}</DataTableCell>
            <DataTableCell className="text-[var(--muted)]">{e.readerCode}</DataTableCell>
            <DataTableCell>
              <StatusBadge status={e.eventType} label={titleCase(e.eventType)} />
            </DataTableCell>
            <DataTableCell>
              <StatusBadge status={e.status === "Missing" ? "MISSING" : "ACTIVE"} label={e.status} />
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </>
  );
}

export function EventsTable({ rows }: { rows: RfidEventRow[] }) {
  if (rows.length === 0) return <EmptyState title="No RFID events match these filters" />;
  return (
    <DataTable>
      <EventsTableInner rows={rows} />
    </DataTable>
  );
}
