import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import {
  getMissingItemsPage, getWashCycleDistribution, getReconciliations,
  getInventoryValueByCustomer, getReaders, getSettlements, getSettlementLines, getCustomers, getItemsPage,
} from "@/lib/queries";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No data available for this report.\n";
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
    ws.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k, width: 20 }));
    ws.addRows(rows);
    ws.getRow(1).font = { bold: true };
  } else {
    ws.addRow(["No data available for this report."]);
  }
  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

function getReportRows(type: string): { rows: Record<string, unknown>[]; filename: string } {
  switch (type) {
    case "missing-items":
      return { rows: getMissingItemsPage({}, 1, 5000).rows as unknown as Record<string, unknown>[], filename: "missing-item-report" };
    case "wash-cycle":
      return { rows: getWashCycleDistribution() as unknown as Record<string, unknown>[], filename: "wash-cycle-report" };
    case "reconciliation":
    case "loss-prevention":
      return { rows: getReconciliations() as unknown as Record<string, unknown>[], filename: "reconciliation-report" };
    case "inventory-valuation":
      return { rows: getInventoryValueByCustomer() as unknown as Record<string, unknown>[], filename: "inventory-valuation-report" };
    case "rfid-reader":
      return { rows: getReaders() as unknown as Record<string, unknown>[], filename: "rfid-reader-report" };
    case "customer-inventory":
      return { rows: getCustomers() as unknown as Record<string, unknown>[], filename: "customer-inventory-report" };
    case "customer-settlement": {
      const settlements = getSettlements();
      const rows = settlements.flatMap((s) =>
        getSettlementLines(s.id).map((l) => ({ customer: s.customerName, period: s.periodLabel, ...l }))
      );
      return { rows: rows as unknown as Record<string, unknown>[], filename: "customer-settlement-report" };
    }
    default:
      return { rows: getItemsPage({}, 1, 5000).rows as unknown as Record<string, unknown>[], filename: `${type || "inventory"}-report` };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "";
  const format = searchParams.get("format") ?? "csv";
  const { rows, filename } = getReportRows(type);

  if (format === "xlsx") {
    const buf = await toXlsx(rows, type || "report");
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }

  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
