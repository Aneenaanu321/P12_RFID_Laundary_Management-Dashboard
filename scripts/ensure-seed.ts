/* eslint-disable no-console */
/**
 * Ensure the SQLite demo database exists before starting the server.
 * Used on Render (and similar hosts) so the first deploy is usable.
 */
import { isSeeded } from "../src/lib/db";
import { spawnSync } from "node:child_process";

if (isSeeded()) {
  console.log("[ensure-seed] Database already seeded — skipping.");
  process.exit(0);
}

console.log("[ensure-seed] Empty database detected — running npm run seed (this can take several minutes)…");
const result = spawnSync("npx", ["tsx", "scripts/seed.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
