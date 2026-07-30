type Tone = "green" | "amber" | "red" | "blue" | "gray";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "green",
  HEALTHY: "green",
  ONLINE: "green",
  READY: "blue",
  IN_LAUNDRY: "blue",
  MONITOR: "amber",
  WARNING: "amber",
  NEAR_END_OF_LIFE: "amber",
  MISSING: "red",
  CRITICAL: "red",
  DISPOSAL_REQUIRED: "red",
  OFFLINE: "red",
  DISPOSED: "gray",
  INFO: "blue",
  SUCCESS: "green",
  DRAFT: "gray",
  FINALIZED: "green",
};

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-[var(--status-green-bg)] text-[var(--status-green)] ring-1 ring-inset ring-[var(--status-green-ring)]",
  amber: "bg-[var(--status-amber-bg)] text-[var(--status-amber)] ring-1 ring-inset ring-[var(--status-amber-ring)]",
  red: "bg-[var(--status-red-bg)] text-[var(--status-red)] ring-1 ring-inset ring-[var(--status-red-ring)]",
  blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue)] ring-1 ring-inset ring-[var(--status-blue-ring)]",
  gray: "bg-[var(--status-gray-bg)] text-[var(--status-gray)] ring-1 ring-inset ring-[var(--status-gray-ring)]",
};

const DOT: Record<Tone, string> = {
  green: "bg-[var(--status-green)]",
  amber: "bg-[var(--status-amber)]",
  red: "bg-[var(--status-red)]",
  blue: "bg-[var(--status-blue)]",
  gray: "bg-[var(--status-gray)]",
};

function toLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = STATUS_TONE[status] ?? "gray";
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${TONE_CLASSES[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      {label ?? toLabel(status)}
    </span>
  );
}
