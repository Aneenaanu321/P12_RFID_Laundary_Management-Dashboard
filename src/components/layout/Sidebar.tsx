"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, hasPermission, ROLE_LABELS } from "@/lib/nav";
import {
  LayoutDashboard, Settings, LogOut, Radio, WashingMachine, Inbox,
  Droplets, Wind, Layers, Truck, Package, Bath, BedDouble, Shirt,
  UserRound, Tag, Hospital, Building2, Dumbbell, Sparkles, MapPin,
  Activity, Wifi, History, RefreshCw, Clock3, Trash2, Replace,
  AlertTriangle, Scale, TrendingDown, Users, BarChart3, PieChart,
  LineChart, FileText, Coins, Bell, Shield, Boxes, ListChecks, Cpu,
  Menu, type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": LayoutDashboard,
  "/operations": WashingMachine,
  "/operations/receiving": Inbox,
  "/operations/washing": Droplets,
  "/operations/drying": Wind,
  "/operations/folding": Layers,
  "/operations/dispatch": Truck,
  "/inventory": Package,
  "/inventory/towels": Bath,
  "/inventory/linen": BedDouble,
  "/inventory/gowns": Shirt,
  "/inventory/uniforms": UserRound,
  "/inventory/tags": Tag,
  "/customers/hospitals": Hospital,
  "/customers/hotels": Building2,
  "/customers/gyms": Dumbbell,
  "/customers/spas": Sparkles,
  "/customers/locations": MapPin,
  "/rfid/live": Radio,
  "/rfid/events": Activity,
  "/rfid/readers": Wifi,
  "/rfid/history": History,
  "/lifecycle/wash-cycles": RefreshCw,
  "/lifecycle/near-eol": Clock3,
  "/lifecycle/disposal": Trash2,
  "/lifecycle/replacement": Replace,
  "/loss/missing": AlertTriangle,
  "/loss/reconciliation": Scale,
  "/loss/analytics": TrendingDown,
  "/analytics/customers": Users,
  "/analytics/laundry": BarChart3,
  "/analytics/inventory": PieChart,
  "/analytics/lifecycle": LineChart,
  "/reports": FileText,
  "/settlement": Coins,
  "/alerts": Bell,
  "/admin/users": Users,
  "/admin/roles": Shield,
  "/admin/item-types": Boxes,
  "/admin/wash-rules": ListChecks,
  "/admin/readers": Cpu,
  "/admin/settings": Settings,
};

export function Sidebar({
  role,
  name,
  open,
  onToggle,
}: {
  role: string;
  name: string;
  open: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  function handleNavigate() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches && open) {
      onToggle();
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--navy-950)] text-slate-300
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${open ? "w-64" : "w-14"}`}
    >
      <div
        className={`flex items-center h-16 border-b border-white/10 shrink-0 ${
          open ? "gap-2 px-3" : "justify-center px-1"
        }`}
      >
        {open && (
          <Link href="/" className="flex items-center min-w-0 flex-1" aria-label="ibTech home" onClick={handleNavigate}>
            <Image
              src="/brand/ibtech-logo-dark.png"
              alt="ibTech"
              width={140}
              height={49}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={open}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-3 ${open ? "px-3" : "px-1.5"}`}>
        {NAV.map((section, si) => {
          const visibleItems = section.items.filter((it) => hasPermission(role, it.permission));
          if (visibleItems.length === 0) return null;
          return (
            <div key={si} className={open ? "mb-3" : "mb-1"}>
              {open && section.heading && (
                <p className="px-2.5 mt-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {section.heading}
                </p>
              )}
              {!open && si > 0 && <div className="my-2 mx-auto w-6 border-t border-white/10" />}
              {visibleItems.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = NAV_ICONS[item.href] ?? Package;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    onClick={handleNavigate}
                    className={`flex items-center rounded-md text-[13px] mb-0.5 transition-colors ${
                      open ? "gap-2.5 px-2.5 py-1.5" : "justify-center p-2"
                    } ${
                      active ? "bg-white/10 text-white font-medium" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      size={open ? 15 : 18}
                      className={`shrink-0 ${active && item.href === "/rfid/live" ? "text-teal-400" : ""}`}
                    />
                    {open && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 shrink-0 ${open ? "p-3" : "p-1.5"}`}>
        {open ? (
          <>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-white font-medium truncate">{name}</p>
                <p className="text-[11px] text-slate-500 truncate">{ROLE_LABELS[role] ?? role}</p>
              </div>
            </div>
            <div className="flex mt-1">
              <Link
                href="/admin/settings"
                onClick={handleNavigate}
                className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] text-slate-400 hover:bg-white/5 hover:text-slate-200"
              >
                <Settings size={14} /> Settings
              </Link>
              <form action="/api/auth/logout" method="POST" className="flex-1">
                <button
                  type="submit"
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[12px] text-slate-400 hover:bg-white/5 hover:text-red-300"
                >
                  <LogOut size={14} /> Logout
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div
              className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-white"
              title={`${name} · ${ROLE_LABELS[role] ?? role}`}
            >
              {initials}
            </div>
            <Link
              href="/admin/settings"
              title="Settings"
              onClick={handleNavigate}
              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-200"
            >
              <Settings size={16} />
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                title="Logout"
                className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-red-300"
              >
                <LogOut size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
