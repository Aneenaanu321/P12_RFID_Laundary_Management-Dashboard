import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { FileText, Download } from "lucide-react";

const REPORTS = [
  { key: "daily-laundry", name: "Daily Laundry Report" },
  { key: "weekly-laundry", name: "Weekly Laundry Report" },
  { key: "monthly-laundry", name: "Monthly Laundry Report" },
  { key: "customer-inventory", name: "Customer Inventory Report" },
  { key: "rfid-tracking", name: "RFID Tracking Report" },
  { key: "missing-items", name: "Missing Item Report" },
  { key: "wash-cycle", name: "Wash Cycle Report" },
  { key: "end-of-life", name: "End-of-Life Report" },
  { key: "disposal", name: "Disposal Report" },
  { key: "loss-prevention", name: "Loss Prevention Report" },
  { key: "rfid-reader", name: "RFID Reader Report" },
  { key: "customer-settlement", name: "Customer Settlement Report" },
  { key: "inventory-valuation", name: "Inventory Valuation Report" },
];

export default function Page() {
  return (
    <div>
      <PageHeader title="Reports Center" subtitle="Generate and export operational, financial and compliance reports." />
      <Card>
        <div className="divide-y divide-slate-100">
          {REPORTS.map((r) => (
            <div key={r.key} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
              </div>
              <div className="flex gap-2">
                <a href={`/api/reports?type=${r.key}&format=csv`} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Download size={12} /> CSV
                </a>
                <a href={`/api/reports?type=${r.key}&format=xlsx`} className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Download size={12} /> Excel
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
