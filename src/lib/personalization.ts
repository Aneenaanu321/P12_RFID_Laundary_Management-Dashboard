/** Client-side personalization keys (pins + recently viewed). */

export type PinnedCustomer = {
  id: string;
  name: string;
  pinnedAt: string;
};

export type RecentView =
  | { kind: "customer"; id: string; label: string; href: string; viewedAt: string }
  | { kind: "item"; id: string; label: string; href: string; viewedAt: string; sub?: string };

const PINS_PREFIX = "rfid-dashboard-pins:";
const RECENT_PREFIX = "rfid-dashboard-recent:";
const MAX_RECENT = 8;
const MAX_PINS = 6;

export function pinsKey(userId: string) {
  return `${PINS_PREFIX}${userId}`;
}

export function recentKey(userId: string) {
  return `${RECENT_PREFIX}${userId}`;
}

export function readPins(userId: string): PinnedCustomer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(pinsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PinnedCustomer[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_PINS) : [];
  } catch {
    return [];
  }
}

export function writePins(userId: string, pins: PinnedCustomer[]) {
  localStorage.setItem(pinsKey(userId), JSON.stringify(pins.slice(0, MAX_PINS)));
}

export function isPinned(userId: string, customerId: string) {
  return readPins(userId).some((p) => p.id === customerId);
}

export function togglePinCustomer(userId: string, customer: { id: string; name: string }): boolean {
  const pins = readPins(userId);
  const exists = pins.find((p) => p.id === customer.id);
  let next: PinnedCustomer[];
  if (exists) {
    next = pins.filter((p) => p.id !== customer.id);
  } else {
    next = [{ id: customer.id, name: customer.name, pinnedAt: new Date().toISOString() }, ...pins];
  }
  writePins(userId, next);
  return !exists;
}

export function readRecent(userId: string): RecentView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(recentKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentView[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function trackRecentView(userId: string, view: Omit<RecentView, "viewedAt">) {
  const prev = readRecent(userId).filter(
    (v) => !(v.kind === view.kind && v.id === view.id)
  );
  const next: RecentView[] = [
    { ...view, viewedAt: new Date().toISOString() } as RecentView,
    ...prev,
  ].slice(0, MAX_RECENT);
  localStorage.setItem(recentKey(userId), JSON.stringify(next));
}
