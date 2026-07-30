import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getSettlements, getSettlementLines } from "@/lib/queries";
import { fmtAED } from "@/lib/format";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get("customerId") ?? "";
  const format = searchParams.get("format") ?? "pdf";

  const settlement = getSettlements().find((s) => s.customerId === customerId);
  if (!settlement) return new NextResponse("Not found", { status: 404 });
  const lines = getSettlementLines(settlement.id);
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const lossCharges = lines.reduce((s, l) => s + l.missing * (l.pricePerCycle * 15), 0);
  const laundryCharges = subtotal * 0.03;
  const finalTotal = subtotal + lossCharges + laundryCharges;

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Settlement");
    ws.addRow([`Settlement — ${settlement.customerName}`]).font = { bold: true, size: 14 };
    ws.addRow([`Period: ${settlement.periodLabel}`]);
    ws.addRow([]);
    ws.columns = [
      { header: "Item Type", key: "itemTypeName", width: 20 },
      { header: "Sent", key: "sent", width: 10 },
      { header: "Returned", key: "returned", width: 10 },
      { header: "Missing", key: "missing", width: 10 },
      { header: "Wash Cycles", key: "washCycles", width: 12 },
      { header: "Price/Cycle (AED)", key: "pricePerCycle", width: 16 },
      { header: "Amount (AED)", key: "amount", width: 14 },
    ];
    const headerRow = ws.addRow({ itemTypeName: "Item Type", sent: "Sent", returned: "Returned", missing: "Missing", washCycles: "Wash Cycles", pricePerCycle: "Price/Cycle", amount: "Amount" });
    headerRow.font = { bold: true };
    lines.forEach((l) => ws.addRow(l));
    ws.addRow({});
    ws.addRow({ amount: subtotal, itemTypeName: "Subtotal" });
    ws.addRow({ amount: lossCharges, itemTypeName: "Loss Charges" });
    ws.addRow({ amount: laundryCharges, itemTypeName: "Laundry Charges" });
    const finalRow = ws.addRow({ amount: finalTotal, itemTypeName: "Final Settlement" });
    finalRow.font = { bold: true };

    const buf = await wb.xlsx.writeBuffer();
    return new NextResponse(new Uint8Array(Buffer.from(buf)), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="settlement-${settlement.customerName.replace(/\s+/g, "-")}.xlsx"`,
      },
    });
  }

  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("RFID Linen Management — Settlement", 14, 18);
  doc.setFontSize(11);
  doc.text(`Customer: ${settlement.customerName}`, 14, 28);
  doc.text(`Period: ${settlement.periodLabel}`, 14, 34);

  autoTable(doc, {
    startY: 42,
    head: [["Item Type", "Sent", "Returned", "Missing", "Wash Cycles", "Price/Cycle", "Amount"]],
    body: lines.map((l) => [
      l.itemTypeName, String(l.sent), String(l.returned), String(l.missing), String(l.washCycles), fmtAED(l.pricePerCycle), fmtAED(l.amount),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  // @ts-expect-error jspdf-autotable augments doc with lastAutoTable
  const finalY = (doc.lastAutoTable?.finalY ?? 60) + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${fmtAED(subtotal)}`, 140, finalY);
  doc.text(`Loss Charges: ${fmtAED(lossCharges)}`, 140, finalY + 6);
  doc.text(`Laundry Charges: ${fmtAED(laundryCharges)}`, 140, finalY + 12);
  doc.setFontSize(12);
  doc.text(`Final Settlement: ${fmtAED(finalTotal)}`, 140, finalY + 20);

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="settlement-${settlement.customerName.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
