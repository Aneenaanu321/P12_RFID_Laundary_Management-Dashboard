"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Input } from "@/components/ui/Input";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";

type SearchResult = {
  items: { itemCode: string; epc: string; itemTypeName: string; customerName: string }[];
  customers: { id: string; name: string; type: string }[];
};

const CUSTOMER_LINKS = [
  { href: "/customers/hospitals", label: "Hospitals" },
  { href: "/customers/hotels", label: "Hotels" },
  { href: "/customers/gyms", label: "Gyms" },
  { href: "/customers/spas", label: "Spas" },
];

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 30 Days" },
  { value: "90", label: "Last 90 Days" },
] as const;

const RECENT_KEY = "header-recent-searches";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  const next = [q, ...loadRecent().filter((x) => x !== q)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function AppHeader({
  alertCount,
  userName,
  userRole,
}: {
  alertCount: number;
  userName?: string;
  userRole?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const range = searchParams.get("range") ?? "30";
  const rangeLabel =
    RANGE_OPTIONS.find((r) => r.value === range)?.label ?? "Last 30 Days";

  const flatResults = [
    ...(results?.items.map((it) => ({
      key: `i-${it.itemCode}`,
      label: it.itemCode,
      sub: `${it.itemTypeName} · ${it.customerName}`,
      href: `/inventory/${it.itemCode}`,
    })) ?? []),
    ...(results?.customers.map((c) => ({
      key: `c-${c.id}`,
      label: c.name,
      sub: c.type,
      href: `/customers/${c.id}`,
    })) ?? []),
  ];

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
        else setResults({ items: [], customers: [] });
      } catch {
        setResults({ items: [], customers: [] });
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const onScroll = () => {
      if (!mq.matches) {
        setCondensed(false);
        return;
      }
      setCondensed(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", onScroll);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [results, query, open]);

  const goTo = useCallback(
    (href: string, q?: string) => {
      setOpen(false);
      if (q) {
        saveRecent(q);
        setRecent(loadRecent());
      }
      router.push(href);
    },
    [router]
  );

  function setDashboardRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "30") params.delete("range");
    else params.set("range", value);
    params.delete("from");
    params.delete("to");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const list =
      query.length < 2
        ? recent.map((q) => ({ key: q, label: q, href: null as string | null }))
        : flatResults.map((r) => ({ key: r.key, label: r.label, href: r.href as string | null }));

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, list.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && list[activeIndex]) {
        const item = list[activeIndex];
        if (item.href) goTo(item.href, query);
        else {
          setQuery(item.label);
          setOpen(true);
        }
      } else if (query.length >= 2 && flatResults[0]) {
        goTo(flatResults[0].href, query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const initials = (userName ?? "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const showRecent = open && query.length < 2 && recent.length > 0;
  const showResults = open && query.length >= 2 && !loading && results;
  const showEmpty = open && query.length >= 2 && !loading && results && flatResults.length === 0;

  return (
    <header
      className={`sticky top-0 z-30 bg-[var(--header-bg)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center gap-3 sm:gap-4 px-3 sm:px-6 transition-[height,padding] duration-200 ${
        condensed ? "h-12" : "h-14 sm:h-16"
      }`}
    >
      <div ref={boxRef} className="relative flex-1 max-w-xl min-w-0">
        <Search
          size={condensed ? 14 : 16}
          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)]"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setRecent(loadRecent());
            setOpen(true);
          }}
          onKeyDown={onSearchKeyDown}
          placeholder={condensed ? "Search…" : "Search RFID, item, customer…"}
          aria-label="Search RFID, item, customer, or location"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
          className={`pl-8 sm:pl-9 pr-8 bg-[var(--surface-muted)] focus:bg-[var(--card-bg)] ${
            condensed ? "py-1.5" : "py-2"
          }`}
        />
        {loading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] animate-spin"
            aria-label="Searching"
          />
        )}

        {showRecent && (
          <div className="absolute mt-1.5 w-full bg-[var(--card-bg)] rounded-lg border border-[var(--border-subtle)] shadow-lg overflow-hidden z-50">
            <p className="px-3 py-1.5 text-[10px] font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
              Recent searches
            </p>
            {recent.map((q, i) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  setOpen(true);
                }}
                className={`w-full text-left px-3 py-2 text-sm ${
                  i === activeIndex ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]"
                }`}
              >
                <span className="text-[var(--foreground)]">{q}</span>
              </button>
            ))}
          </div>
        )}

        {showEmpty && (
          <div className="absolute mt-1.5 w-full bg-[var(--card-bg)] rounded-lg border border-[var(--border-subtle)] shadow-lg z-50 px-3 py-4 text-sm text-[var(--muted)]">
            No results for &ldquo;{query}&rdquo;
          </div>
        )}

        {showResults && flatResults.length > 0 && (
          <div className="absolute mt-1.5 w-full bg-[var(--card-bg)] rounded-lg border border-[var(--border-subtle)] shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto z-50">
            {results!.items.length > 0 && (
              <div className="py-1">
                <p className="px-3 py-1 text-[10px] font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                  Items
                </p>
                {results!.items.map((it) => {
                  const idx = flatResults.findIndex((r) => r.key === `i-${it.itemCode}`);
                  return (
                    <button
                      key={it.itemCode}
                      type="button"
                      onClick={() => goTo(`/inventory/${it.itemCode}`, query)}
                      className={`w-full text-left px-3 py-2 text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 ${
                        idx === activeIndex ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      <span className="font-medium text-[var(--foreground)]">{it.itemCode}</span>
                      <span className="text-xs text-[var(--muted)] truncate">
                        {it.itemTypeName} · {it.customerName}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {results!.customers.length > 0 && (
              <div className="py-1 border-t border-[var(--border-subtle)]">
                <p className="px-3 py-1 text-[10px] font-semibold text-[var(--muted-fg)] uppercase tracking-wider">
                  Customers
                </p>
                {results!.customers.map((c) => {
                  const idx = flatResults.findIndex((r) => r.key === `c-${c.id}`);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goTo(`/customers/${c.id}`, query)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 ${
                        idx === activeIndex ? "bg-[var(--surface-muted)]" : "hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      <span className="font-medium text-[var(--foreground)] truncate">{c.name}</span>
                      <span className="text-xs text-[var(--muted)] shrink-0">{c.type}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`ml-auto flex items-center shrink-0 transition-all ${condensed ? "gap-1" : "gap-2"}`}>
        <Dropdown className="hidden md:inline-flex">
          <DropdownTrigger>All Customers</DropdownTrigger>
          <DropdownMenu>
            {CUSTOMER_LINKS.map((c) => (
              <DropdownItem key={c.href} href={c.href} active={pathname.startsWith(c.href)}>
                {c.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>

        <Dropdown className="hidden md:inline-flex">
          <DropdownTrigger>All Locations</DropdownTrigger>
          <DropdownMenu>
            <DropdownItem href="/customers/locations" active={pathname.startsWith("/customers/locations")}>
              Browse locations
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Dropdown className="hidden lg:inline-flex">
          <DropdownTrigger>{rangeLabel}</DropdownTrigger>
          <DropdownMenu>
            {RANGE_OPTIONS.map((r) => (
              <DropdownItem
                key={r.value}
                active={range === r.value || (!searchParams.get("range") && r.value === "30")}
                onSelect={() => setDashboardRange(r.value)}
              >
                {r.label}
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem href="/">Open dashboard filters</DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <div className={condensed ? "scale-90 origin-center" : undefined}>
          <ThemeToggle />
        </div>

        <Link
          href="/alerts"
          className={`relative flex items-center justify-center rounded-lg hover:bg-[var(--surface-muted)] border border-transparent hover:border-[var(--border-subtle)] a11y-focus ${
            condensed ? "h-8 w-8" : "h-9 w-9"
          }`}
          aria-label={alertCount > 0 ? `Alerts, ${alertCount} unread` : "Alerts"}
        >
          <Bell size={condensed ? 15 : 17} className="text-[var(--muted)]" aria-hidden />
          {alertCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-[var(--status-red)] text-white text-[9px] font-bold flex items-center justify-center"
              aria-hidden
            >
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Link>

        {userName && (
          <Dropdown className="hidden sm:inline-flex">
            <DropdownTrigger
              className="!px-1.5 gap-2"
              aria-label={`Account menu for ${userName}`}
              showChevron={false}
            >
              <span className="h-7 w-7 rounded-full bg-[var(--surface-muted)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-semibold text-[var(--foreground)]">
                {initials || "?"}
              </span>
              {!condensed && (
                <span className="hidden xl:inline text-xs font-medium text-[var(--muted)] max-w-[100px] truncate">
                  {userName}
                </span>
              )}
            </DropdownTrigger>
            <DropdownMenu>
              <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{userName}</p>
                {userRole && <p className="text-xs text-[var(--muted)]">{userRole}</p>}
              </div>
              <DropdownItem href="/admin/settings">Settings</DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onSelect={() => {
                  const form = document.createElement("form");
                  form.method = "POST";
                  form.action = "/api/auth/logout";
                  document.body.appendChild(form);
                  form.submit();
                }}
              >
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </header>
  );
}
