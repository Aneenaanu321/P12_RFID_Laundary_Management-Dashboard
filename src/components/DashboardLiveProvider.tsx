"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useToastOptional } from "@/components/ui/Toast";

export type LiveOpsKpis = {
  inLaundry: number;
  ready: number;
  withCustomers: number;
  totalItems: number;
};

export type LiveAlert = {
  id: string;
  severity: string;
  message: string;
  category: string;
  createdAt: string;
};

type DashboardLiveContextValue = {
  connected: boolean;
  liveKpis: LiveOpsKpis | null;
  criticalAlerts: LiveAlert[];
};

const DashboardLiveContext = createContext<DashboardLiveContextValue>({
  connected: false,
  liveKpis: null,
  criticalAlerts: [],
});

export function useDashboardLive() {
  return useContext(DashboardLiveContext);
}

/** Single SSE connection for dashboard KPI live updates + critical alert toasts. */
export function DashboardLiveProvider({
  initialAlerts,
  children,
}: {
  initialAlerts: LiveAlert[];
  children: ReactNode;
}) {
  const toastApi = useToastOptional();
  const [connected, setConnected] = useState(false);
  const [liveKpis, setLiveKpis] = useState<LiveOpsKpis | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<LiveAlert[]>(initialAlerts);
  const seenAlertIds = useRef(new Set(initialAlerts.map((a) => a.id)));

  const pushCritical = useCallback(
    (alert: LiveAlert) => {
      if (seenAlertIds.current.has(alert.id)) return;
      seenAlertIds.current.add(alert.id);

      setCriticalAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)].slice(0, 3));
      toastApi?.toast({
        id: `toast-${alert.id}`,
        title: "Critical alert",
        message: alert.message,
        href: "/alerts",
        hrefLabel: "View alert center",
        tone: "critical",
      });
    },
    [toastApi]
  );

  useEffect(() => {
    const es = new EventSource("/api/rfid/stream");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as {
          kpis?: LiveOpsKpis;
          alert?: LiveAlert | null;
        };
        if (data.kpis) setLiveKpis(data.kpis);
        if (data.alert?.severity === "CRITICAL") {
          pushCritical(data.alert);
        }
      } catch {
        /* ignore malformed frames */
      }
    };
    return () => es.close();
  }, [pushCritical]);

  const value = useMemo(
    () => ({ connected, liveKpis, criticalAlerts }),
    [connected, liveKpis, criticalAlerts]
  );

  return (
    <DashboardLiveContext.Provider value={value}>{children}</DashboardLiveContext.Provider>
  );
}
