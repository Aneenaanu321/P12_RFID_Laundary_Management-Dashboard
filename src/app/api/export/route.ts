import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import {
  getItemsPage,
  getEventsPage,
  getMissingItemsPage,
  getCustomers,
  getCustomerLocations,
  getReaders,
  getUsers,
  getItemTypes,
  getSettlements,
  getSettlementLines,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No data available.\n";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

async function toXlsx(rows: Record<string, unknown>[], sheetName: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName.slice(0, 31));
  if (rows.length > 0) {
    ws.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 18 }));
    ws.addRows(rows);
    ws.getRow(1).font = { bold: true };
  } else {
    ws.addRow(["No data available."]);
  }
  return Buffer.from(await wb.xlsx.writeBuffer());
}

function flatten(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === null || v === undefined) out[k] = "";
    else if (typeof v === "object") out[k] = JSON.stringify(v);
    else out[k] = v;
  }
  return out;
}

function getExportRows(resource: string, sp: URLSearchParams): { rows: Record<string, unknown>[]; filename: string } {
  const q = sp.get("q") ?? undefined;
  const customerId = sp.get("customerId") ?? undefined;
  const status = sp.get("status") ?? undefined;
  const zone = sp.get("zone") ?? undefined;
  const eventType = sp.get("eventType") ?? undefined;
  const readerId = sp.get("readerId") ?? undefined;
  const category = sp.get("category") ?? undefined;
  const lifecycleStatus = sp.get("lifecycleStatus") ?? undefined;
  const disposed = sp.get("disposed");

  switch (resource) {
    case "items": {
      const { rows } = getItemsPage(
        {
          search: q,
          customerId,
          currentStatus: status,
          currentZone: zone,
          category,
          lifecycleStatus,
          disposed: disposed === "1" ? true : disposed === "0" ? false : undefined,
        },
        1,
        10000,
        "lastReadAt DESC"
      );
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "items-export" };
    }
    case "events": {
      const { rows } = getEventsPage(
        { search: q, customerId, eventType, readerId, zone, status },
        1,
        10000
      );
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "rfid-events-export" };
    }
    case "missing": {
      const { rows } = getMissingItemsPage({ search: q, customerId }, 1, 10000);
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "missing-items-export" };
    }
    case "customers": {
      const type = sp.get("type") ?? undefined;
      const rows = getCustomers(type).filter((c) => {
        if (!q) return true;
        const hay = `${c.name} ${c.code} ${c.type}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      });
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "customers-export" };
    }
    case "locations": {
      const rows = getCustomerLocations().filter((l) => {
        if (!q) return true;
        return `${l.name} ${l.customerName} ${l.city ?? ""}`.toLowerCase().includes(q.toLowerCase());
      });
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "locations-export" };
    }
    case "readers": {
      const rows = getReaders().filter((r) => {
        if (!q) return true;
        return `${r.code} ${r.zone} ${r.status}`.toLowerCase().includes(q.toLowerCase());
      });
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "readers-export" };
    }
    case "users": {
      // ROLE_LABELS may not be from queries - check
      const rows = getUsers().map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }));
      return { rows: rows as unknown as Record<string, unknown>[], filename: "users-export" };
    }
    case "item-types": {
      const rows = getItemTypes();
      return { rows: rows.map((r) => flatten(r as unknown as Record<string, unknown>)), filename: "item-types-export" };
    }
    case "settlement": {
      const settlements = getSettlements();
      const active = customerId
        ? settlements.find((s) => s.customerId === customerId)
        : settlements[0];
      const lines = active
        ? getSettlementLines(active.id).map((l) => ({
            customer: active.customerName,
            period: active.periodLabel,
            ...l,
          }))
        : [];
      return {
        rows: lines.map((r) => flatten(r as unknown as Record<string, unknown>)),
        filename: "settlement-export",
      };
    }
    default:
      return { rows: [], filename: "export" };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get("resource") ?? "";
  const format = searchParams.get("format") ?? "csv";
  const { rows, filename } = getExportRows(resource, searchParams);
  const stamp = new Date().toISOString().slice(0, 10);
  const base = searchParams.get("filename") || filename;

  if (format === "xlsx") {
    const buf = await toXlsx(rows, base);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${base}-${stamp}.xlsx"`,
      },
    });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv;charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}-${stamp}.csv"`,
    },
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    rows?: Record<string, unknown>[];
    filename?: string;
    format?: string;
  };
  const rows = (body.rows ?? []).map(flatten);
  const base = body.filename || "table-export";
  const stamp = new Date().toISOString().slice(0, 10);
  const format = body.format ?? "csv";

  if (format === "xlsx") {
    const buf = await toXlsx(rows, base);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${base}-${stamp}.xlsx"`,
      },
    });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv;charset=utf-8",
      "Content-Disposition": `attachment; filename="${base}-${stamp}.csv"`,
    },
  });
}
