"use server";

import { revalidatePath } from "next/cache";
import { updateWashRule } from "./queries";

export async function updateWashRuleAction(formData: FormData) {
  const id = String(formData.get("id"));
  const maxWashCycles = Number(formData.get("maxWashCycles"));
  const monitorPct = Number(formData.get("monitorPct"));
  const eolPct = Number(formData.get("eolPct"));
  updateWashRule(id, maxWashCycles, monitorPct, eolPct);
  revalidatePath("/admin/wash-rules");
  revalidatePath("/lifecycle/wash-cycles");
}
