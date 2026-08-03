/* eslint-disable no-console */
/**
 * Ensure the SQLite demo database exists before starting the server.
 * Used on Render (and similar hosts) so the first deploy is usable.
 *
 * 1) Always ensure the demo admin exists (fast).
 * 2) If inventory data is missing, run the full seed (slow — prefer build-time).
 */
import { isSeeded } from "../src/lib/db";
import { spawnSync } from "node:child_process";

function runTsx(script: string): number {
  const result = spawnSync("npx", ["tsx", script], {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  return result.status ?? 1;
}

const demoStatus = runTsx("scripts/ensure-demo-user.ts");
if (demoStatus !== 0) process.exit(demoStatus);

if (isSeeded()) {
  console.log("[ensure-seed] Database already seeded — skipping full seed.");
  process.exit(0);
}

console.log(
  "[ensure-seed] Empty database detected — running npm run seed (this can take several minutes)…"
);
process.exit(runTsx("scripts/seed.ts"));
