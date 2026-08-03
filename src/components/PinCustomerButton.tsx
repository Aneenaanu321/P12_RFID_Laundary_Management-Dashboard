"use client";

import { useEffect, useState, useTransition } from "react";
import { Pin, PinOff } from "lucide-react";
import { isPinned, togglePinCustomer } from "@/lib/personalization";

export function PinCustomerButton({
  userId,
  customerId,
  customerName,
}: {
  userId: string;
  customerId: string;
  customerName: string;
}) {
  const [pinned, setPinned] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPinned(isPinned(userId, customerId));
  }, [userId, customerId]);

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          const nowPinned = togglePinCustomer(userId, { id: customerId, name: customerName });
          setPinned(nowPinned);
        });
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
        pinned
          ? "border-[var(--status-blue)] bg-[var(--status-blue-bg)] text-[var(--status-blue)]"
          : "border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
      }`}
      aria-pressed={pinned}
      title={pinned ? "Unpin from dashboard" : "Pin to dashboard"}
    >
      {pinned ? <PinOff size={14} /> : <Pin size={14} />}
      {pinned ? "Pinned" : "Pin to dashboard"}
    </button>
  );
}
