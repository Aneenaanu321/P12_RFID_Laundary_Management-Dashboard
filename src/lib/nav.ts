export type NavItem = {
  label: string;
  href: string;
  permission?: string; // matches Role permission key; undefined = always visible
};
export type NavSection = {
  heading?: string;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  { items: [{ label: "Dashboard", href: "/" }] },
  {
    heading: "Operations",
    items: [
      { label: "Laundry Operations", href: "/operations", permission: "laundry" },
      { label: "Receiving", href: "/operations/receiving", permission: "laundry" },
      { label: "Washing", href: "/operations/washing", permission: "laundry" },
      { label: "Drying", href: "/operations/drying", permission: "laundry" },
      { label: "Folding", href: "/operations/folding", permission: "laundry" },
      { label: "Dispatch", href: "/operations/dispatch", permission: "laundry" },
    ],
  },
  {
    heading: "Inventory",
    items: [
      { label: "All Items", href: "/inventory", permission: "inventory" },
      { label: "Towels", href: "/inventory/towels", permission: "inventory" },
      { label: "Linen", href: "/inventory/linen", permission: "inventory" },
      { label: "Gowns", href: "/inventory/gowns", permission: "inventory" },
      { label: "Uniforms", href: "/inventory/uniforms", permission: "inventory" },
      { label: "RFID Tags", href: "/inventory/tags", permission: "inventory" },
    ],
  },
  {
    heading: "Customers",
    items: [
      { label: "Hospitals", href: "/customers/hospitals", permission: "customers" },
      { label: "Hotels", href: "/customers/hotels", permission: "customers" },
      { label: "Gyms", href: "/customers/gyms", permission: "customers" },
      { label: "Spas", href: "/customers/spas", permission: "customers" },
      { label: "Locations", href: "/customers/locations", permission: "customers" },
    ],
  },
  {
    heading: "RFID Tracking",
    items: [
      { label: "Live Tracking", href: "/rfid/live", permission: "rfid" },
      { label: "RFID Events", href: "/rfid/events", permission: "rfid" },
      { label: "Reader Health", href: "/rfid/readers", permission: "rfid" },
      { label: "Read History", href: "/rfid/history", permission: "rfid" },
    ],
  },
  {
    heading: "Lifecycle",
    items: [
      { label: "Wash Cycles", href: "/lifecycle/wash-cycles", permission: "inventory" },
      { label: "Near End of Life", href: "/lifecycle/near-eol", permission: "inventory" },
      { label: "Disposal", href: "/lifecycle/disposal", permission: "inventory" },
      { label: "Replacement", href: "/lifecycle/replacement", permission: "inventory" },
    ],
  },
  {
    heading: "Loss Prevention",
    items: [
      { label: "Missing Items", href: "/loss/missing", permission: "inventory" },
      { label: "Reconciliation", href: "/loss/reconciliation", permission: "accounting" },
      { label: "Loss Analytics", href: "/loss/analytics", permission: "reports" },
    ],
  },
  {
    heading: "Analytics",
    items: [
      { label: "Customer Analytics", href: "/analytics/customers", permission: "reports" },
      { label: "Laundry Analytics", href: "/analytics/laundry", permission: "reports" },
      { label: "Inventory Analytics", href: "/analytics/inventory", permission: "reports" },
      { label: "Lifecycle Analytics", href: "/analytics/lifecycle", permission: "reports" },
    ],
  },
  { items: [{ label: "Reports", href: "/reports", permission: "reports" }] },
  { items: [{ label: "Settlement", href: "/settlement", permission: "accounting" }] },
  { items: [{ label: "Alert Center", href: "/alerts" }] },
  {
    heading: "Administration",
    items: [
      { label: "Users", href: "/admin/users", permission: "administration" },
      { label: "Roles & Permissions", href: "/admin/roles", permission: "administration" },
      { label: "Item Types", href: "/admin/item-types", permission: "administration" },
      { label: "Wash Cycle Rules", href: "/admin/wash-rules", permission: "administration" },
      { label: "RFID Readers", href: "/admin/readers", permission: "administration" },
      { label: "System Settings", href: "/admin/settings", permission: "administration" },
    ],
  },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["dashboard", "inventory", "rfid", "laundry", "customers", "reports", "accounting", "administration"],
  LAUNDRY_MANAGER: ["dashboard", "inventory", "rfid", "laundry", "customers", "reports"],
  CUSTOMER_MANAGER: ["dashboard", "inventory", "customers", "reports"],
  OPERATIONS_MANAGER: ["dashboard", "inventory", "rfid", "laundry", "reports"],
  OPERATOR: ["dashboard", "laundry", "rfid"],
  FINANCE_USER: ["dashboard", "customers", "reports", "accounting"],
  VIEWER: ["dashboard", "inventory", "customers", "reports"],
};

export function hasPermission(role: string, permission?: string): boolean {
  if (!permission) return true;
  return (ROLE_PERMISSIONS[role] ?? []).includes(permission);
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  LAUNDRY_MANAGER: "Laundry Manager",
  CUSTOMER_MANAGER: "Customer Manager",
  OPERATIONS_MANAGER: "Operations Manager",
  OPERATOR: "Operator",
  FINANCE_USER: "Finance User",
  VIEWER: "Viewer",
};
