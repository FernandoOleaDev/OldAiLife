import { catalog } from "../src/catalog";
import { createModel } from "../src/models";
import { writeFileSync } from "node:fs";
const results = [];
for (const d of catalog) {
  const m = createModel(d.id, d.defaults, 1997),
    initial = m.tick,
    start = performance.now();
  for (let i = 0; i < 1000; i++) m.step();
  const ms = performance.now() - start;
  const r = {
    id: d.id,
    steps: 1000,
    initialTick: initial,
    milliseconds: Math.round(ms),
    stepsPerSecond: Math.round(1000000 / ms),
    metrics: m.frame().metrics,
  };
  results.push(r);
  console.log(JSON.stringify(r));
}
writeFileSync(
  "docs/benchmark.json",
  JSON.stringify(
    {
      date: "2026-10-24",
      runtime: process.version,
      note: "Motor en Node en este Mac; no representa los FPS del navegador.",
      results,
    },
    null,
    2,
  ) + "\n",
);
