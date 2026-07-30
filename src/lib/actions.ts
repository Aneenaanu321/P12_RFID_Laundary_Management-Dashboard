"use server";

import { revalidatePath } from "next/cache";
import { run, get } from "./db";
import crypto from "node:crypto";

function id() { return crypto.randomUUID(); }

export async function markItemFound(itemId: string, path: string) {
  run(`UPDATE Item SET missing = 0, missingSince = NULL, currentStatus = 'ACTIVE', currentZone = 'WITH_CUSTOMER', lastReadAt = datetime('now') WHERE id = ?`, [itemId]);
  revalidatePath(path);
}

export async function markItemLost(itemId: string, path: string) {
  const item = get<{ itemCode: string; value: number }>(`SELECT itemCode, value FROM Item WHERE id = ?`, [itemId]);
  run(`UPDATE Item SET disposed = 1, disposedAt = datetime('now'), currentStatus = 'DISPOSED', currentZone = 'DISPOSED' WHERE id = ?`, [itemId]);
  if (item) {
    run(
      `INSERT INTO Alert (id, severity, message, category, relatedType, relatedId, createdAt) VALUES (?,?,?,?,?,?,datetime('now'))`,
      [id(), "WARNING", `${item.itemCode} confirmed lost and written off inventory.`, "MISSING", "Item", itemId]
    );
  }
  revalidatePath(path);
}

export async function flagItem(itemId: string, path: string) {
  const item = get<{ itemCode: string }>(`SELECT itemCode FROM Item WHERE id = ?`, [itemId]);
  run(
    `INSERT INTO Alert (id, severity, message, category, relatedType, relatedId, createdAt) VALUES (?,?,?,?,?,?,datetime('now'))`,
    [id(), "WARNING", `${item?.itemCode ?? itemId} flagged for manual review.`, "WASH_LIMIT", "Item", itemId]
  );
  revalidatePath(path);
}

export async function approveDisposal(itemId: string, path: string) {
  run(`UPDATE Item SET lifecycleStatus = 'DISPOSAL_REQUIRED' WHERE id = ?`, [itemId]);
  revalidatePath(path);
}

export async function markItemDisposed(itemId: string, path: string) {
  run(`UPDATE Item SET disposed = 1, disposedAt = datetime('now'), currentStatus = 'DISPOSED', currentZone = 'DISPOSED', lifecycleStatus = 'DISPOSAL_REQUIRED' WHERE id = ?`, [itemId]);
  revalidatePath(path);
}

export async function requestReplacement(itemId: string, path: string) {
  const item = get<{ itemCode: string }>(`SELECT itemCode FROM Item WHERE id = ?`, [itemId]);
  run(
    `INSERT INTO Alert (id, severity, message, category, relatedType, relatedId, createdAt) VALUES (?,?,?,?,?,?,datetime('now'))`,
    [id(), "INFO", `Replacement requested for disposed item ${item?.itemCode ?? itemId}.`, "BATCH", "Item", itemId]
  );
  revalidatePath(path);
}

export async function resolveAlert(alertId: string, path: string) {
  run(`UPDATE Alert SET resolved = 1 WHERE id = ?`, [alertId]);
  revalidatePath(path);
}
