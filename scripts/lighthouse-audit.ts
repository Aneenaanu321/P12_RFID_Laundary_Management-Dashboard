/**
 * Lighthouse audit against a running production server.
 *
 * Usage:
 *   npm run build && npm run start   # terminal 1
 *   npm run lighthouse               # terminal 2
 *
 * Or with an explicit URL:
 *   LIGHTHOUSE_URL=http://127.0.0.1:3000 npm run lighthouse
 *
 * Thresholds below are the go/no-go gate before calling the UI "done"
 * (see docs/LIGHTHOUSE_CHECKLIST.md).
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const URL = process.env.LIGHTHOUSE_URL ?? "http://127.0.0.1:3000/login";
const OUT_DIR = path.join(process.cwd(), "lighthouse-report");

/** Minimum category scores (0–100) required to pass. */
const THRESHOLDS = {
  performance: 70,
  accessibility: 90,
  "best-practices": 90,
  seo: 90,
} as const;

type CategoryKey = keyof typeof THRESHOLDS;

async function runLighthouse(url: string): Promise<Record<CategoryKey, number>> {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const reportPath = path.join(OUT_DIR, "report.json");

  await new Promise<void>((resolve, reject) => {
    const args = [
      "lighthouse",
      url,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      "--output=json",
      `--output-path=${reportPath}`,
      "--quiet",
    ];
    const child = spawn("npx", args, { stdio: "inherit", shell: true });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Lighthouse exited with code ${code}`));
    });
  });

  const raw = JSON.parse(fs.readFileSync(reportPath, "utf-8")) as {
    categories: Record<string, { score: number | null }>;
  };

  const scores = {} as Record<CategoryKey, number>;
  for (const key of Object.keys(THRESHOLDS) as CategoryKey[]) {
    const score = raw.categories[key]?.score;
    scores[key] = score == null ? 0 : Math.round(score * 100);
  }
  return scores;
}

async function main() {
  console.log(`Auditing ${URL} …`);
  const scores = await runLighthouse(URL);

  console.log("\nLighthouse scores:");
  let failed = false;
  for (const [key, min] of Object.entries(THRESHOLDS) as [CategoryKey, number][]) {
    const value = scores[key];
    const ok = value >= min;
    if (!ok) failed = true;
    console.log(`  ${ok ? "✓" : "✗"} ${key.padEnd(16)} ${value}  (min ${min})`);
  }

  console.log(`\nJSON report: ${path.join(OUT_DIR, "report.json")}`);
  if (failed) {
    console.error("\nLighthouse gate FAILED — see docs/LIGHTHOUSE_CHECKLIST.md");
    process.exit(1);
  }
  console.log("\nLighthouse gate PASSED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
