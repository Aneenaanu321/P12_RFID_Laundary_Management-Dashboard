"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

type SearchResult = {
  items: { itemCode: string; epc: string; itemTypeName: string; customerName: string }[];
  customers: { id: string; name: string; type: string }[];
};

export function AppHeader({ alertCount }: { alertCount: number }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
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

  return (
    <header className="h-16 sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center gap-4 px-4 sm:px-6">
      <div ref={boxRef} className="relative flex-1 max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search RFID, item, customer, location..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
        />
        {open && results && (results.items.length > 0 || results.customers.length > 0) && (
          <div className="absolute mt-1.5 w-full bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
            {results.items.length > 0 && (
              <div className="py-1">
                <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Items</p>
                {results.items.map((it) => (
                  <button
                    key={it.itemCode}
                    onClick={() => { setOpen(false); router.push(`/inventory/${it.itemCode}`); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700">{it.itemCode}</span>
                    <span className="text-xs text-slate-400">{it.itemTypeName} · {it.customerName}</span>
                  </button>
                ))}
              </div>
            )}
            {results.customers.length > 0 && (
              <div className="py-1 border-t border-slate-100">
                <p className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Customers</p>
                {results.customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setOpen(false); router.push(`/customers/${c.id}`); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          All Customers <ChevronDown size={13} />
        </button>
        <button className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          All Locations <ChevronDown size={13} />
        </button>
        <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
          Last 30 Days <ChevronDown size={13} />
        </button>

        <Link href="/alerts" className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
          <Bell size={17} className="text-slate-500" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
