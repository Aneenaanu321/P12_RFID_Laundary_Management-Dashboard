"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DownloadAllReportsButton() {
  const [loading, setLoading] = useState(false);

  async function downloadAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports?type=all&format=xlsx");
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `all-reports-${stamp}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.location.href = "/api/reports?type=all&format=xlsx";
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      onClick={downloadAll}
      loading={loading}
      iconLeft={<Download size={14} aria-hidden />}
    >
      {loading ? "Preparing…" : "Download all reports"}
    </Button>
  );
}
