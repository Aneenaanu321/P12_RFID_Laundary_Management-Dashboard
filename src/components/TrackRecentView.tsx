"use client";

import { useEffect } from "react";
import { trackRecentView } from "@/lib/personalization";

export function TrackRecentView({
  userId,
  view,
}: {
  userId: string;
  view:
    | { kind: "customer"; id: string; label: string; href: string }
    | { kind: "item"; id: string; label: string; href: string; sub?: string };
}) {
  useEffect(() => {
    trackRecentView(userId, view);
  }, [userId, view.kind, view.id, view.label, view.href, "sub" in view ? view.sub : undefined]);

  return null;
}
