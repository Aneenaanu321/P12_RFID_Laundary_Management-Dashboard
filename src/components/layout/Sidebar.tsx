"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NAV, hasPermission, ROLE_LABELS } from "@/lib/nav";
import {
  LayoutDashboard, Settings, LogOut, Radio, WashingMachine, Inbox,
  Droplets, Wind, Layers, Truck, Package, Bath, BedDouble, Shirt,
  UserRound, Tag, Hospital, Building2, Dumbbell, Sparkles, MapPin,
  Activity, Wifi, History, RefreshCw, Clock3, Trash2, Replace,
  AlertTriangle, Scale, TrendingDown, Users, BarChart3, PieChart,
  LineChart, FileText, Coins, Bell, Shield, Boxes, ListChecks, Cpu,
  Menu, ChevronDown, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

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

const COLLAPSED_SECTIONS_KEY = "sidebar-collapsed-sections-v2";

function loadCollapsedSections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSED_SECTIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

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
  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const activeSectionKey = useMemo(() => {
    for (let si = 0; si < NAV.length; si++) {
      const section = NAV[si];
      const key = section.heading ?? `section-${si}`;
      const match = section.items.some((item) =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
      );
      if (match) return key;
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    const stored = loadCollapsedSections();
    // First visit: collapse every section except the active one so the rail fits without scrolling.
    if (Object.keys(stored).length === 0) {
      const defaults: Record<string, boolean> = {};
      for (let si = 0; si < NAV.length; si++) {
        const section = NAV[si];
        const key = section.heading ?? `section-${si}`;
        if (!section.heading) continue;
        defaults[key] = key !== activeSectionKey;
      }
      setCollapsedSections(defaults);
      localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(defaults));
      return;
    }
    setCollapsedSections(stored);
    // activeSectionKey intentionally omitted — only seed defaults once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeSectionKey) return;
    setCollapsedSections((prev) => {
      if (!prev[activeSectionKey]) return prev;
      const next = { ...prev, [activeSectionKey]: false };
      localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, [activeSectionKey]);

  function handleNavigate() {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches && open) {
      onToggle();
    }
  }

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(next));
      return next;
    });
  }

  const showLabels = open;
  const widthClass = open ? "w-64" : "w-14";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[var(--navy-950)] text-slate-300
        transition-[width] duration-300 ease-in-out overflow-hidden
        ${widthClass}`}
    >
      <div
        className={`flex items-center h-16 border-b border-white/10 shrink-0 ${
          showLabels ? "gap-2 px-3" : "justify-center px-1"
        }`}
      >
        {showLabels && (
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="shrink-0 text-slate-300 hover:bg-white/10 hover:text-white"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={open}
        >
          <Menu size={20} aria-hidden />
        </Button>
      </div>

      <nav ref={navRef} className={`flex-1 overflow-hidden py-3 ${showLabels ? "px-3" : "px-1.5"}`}>
        {NAV.map((section, si) => {
          const visibleItems = section.items.filter((it) => hasPermission(role, it.permission));
          if (visibleItems.length === 0) return null;
          const sectionKey = section.heading ?? `section-${si}`;
          const isCollapsed = Boolean(section.heading && collapsedSections[sectionKey] && showLabels);
          const sectionHasActive = visibleItems.some((item) =>
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          );

          return (
            <div key={si} className={showLabels ? "mb-3" : "mb-1"}>
              {showLabels && section.heading && (
                <button
                  type="button"
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between px-2.5 mt-3 mb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase hover:text-slate-300 a11y-focus rounded"
                  aria-expanded={!isCollapsed}
                >
                  <span>{section.heading}</span>
                  <ChevronDown
                    size={12}
                    aria-hidden
                    className={`transition-transform ${isCollapsed ? "-rotate-90" : ""} ${
                      sectionHasActive ? "text-slate-300" : ""
                    }`}
                  />
                </button>
              )}
              {!showLabels && si > 0 && <div className="my-2 mx-auto w-6 border-t border-white/10" />}
              {!isCollapsed &&
                visibleItems.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  const Icon = NAV_ICONS[item.href] ?? Package;
                  return (
                    <Link
                      key={item.href}
                      ref={active ? activeRef : undefined}
                      href={item.href}
                      title={item.label}
                      aria-label={item.label}
                      aria-current={active ? "page" : undefined}
                      onClick={handleNavigate}
                      className={`flex items-center rounded-md text-[13px] mb-0.5 transition-colors a11y-focus ${
                        showLabels ? "gap-2.5 px-2.5 py-1.5" : "justify-center p-2"
                      } ${
                        active
                          ? "bg-white/10 text-white font-medium"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <Icon
                        size={showLabels ? 15 : 18}
                        aria-hidden
                        className={`shrink-0 ${active && item.href === "/rfid/live" ? "text-teal-400" : ""}`}
                      />
                      {showLabels && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-white/10 shrink-0 ${showLabels ? "p-3" : "p-1.5"}`}>
        {showLabels ? (
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
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-[12px] text-slate-400 hover:bg-white/5 hover:text-red-300"
                  iconLeft={<LogOut size={14} aria-hidden />}
                >
                  Logout
                </Button>
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
              aria-label="Settings"
              onClick={handleNavigate}
              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:bg-white/5 hover:text-slate-200 a11y-focus"
            >
              <Settings size={16} aria-hidden />
            </Link>
            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="ghost"
                size="iconSm"
                title="Logout"
                aria-label="Logout"
                className="text-slate-400 hover:bg-white/5 hover:text-red-300"
              >
                <LogOut size={16} aria-hidden />
              </Button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
