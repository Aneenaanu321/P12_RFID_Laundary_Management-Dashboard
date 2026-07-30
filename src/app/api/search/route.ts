import { NextResponse } from "next/server";
import { globalSearch } from "@/lib/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const result = globalSearch(q);
  return NextResponse.json(result);
}
