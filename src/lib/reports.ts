/** Shared report catalog for the Reports Center UI and /api/reports. */
export const REPORT_DEFINITIONS = [
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
] as const;

export type ReportKey = (typeof REPORT_DEFINITIONS)[number]["key"];
