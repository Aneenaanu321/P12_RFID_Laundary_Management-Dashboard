import { NextRequest, NextResponse } from "next/server";
import { getCustomers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ids = (req.nextUrl.searchParams.get("customers") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!ids.length) {
    return NextResponse.json({ customers: [] });
  }

  const all = getCustomers();
  const byId = new Map(all.map((c) => [c.id, c]));
  const customers = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((c) => ({
      id: c!.id,
      name: c!.name,
      type: c!.type,
      totalItems: Number(c!.totalItems),
      missing: Number(c!.missing),
      inLaundry: Number(c!.inLaundry),
      ready: Number(c!.ready),
    }));

  return NextResponse.json({ customers });
}
