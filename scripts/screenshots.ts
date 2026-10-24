/** Reproducible simulation snapshots, using the application's own Canvas renderer.
 * No browser automation or generated artwork: these are seeded engine states.
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { catalog } from "../src/catalog";
import { createModel } from "../src/models";
import { Renderer } from "../src/render";
import type { Params } from "../src/core/types";
const directory = new URL("../docs/images/", import.meta.url);
await mkdir(directory, { recursive: true });
Object.assign(globalThis, {
  document: { createElement: () => createCanvas(1, 1) },
  devicePixelRatio: 1,
  ResizeObserver: class {
    observe() {}
  },
});
const settings: Record<
  string,
  { name: string; steps: number; params?: Params }
> = {
  langton: { name: "Langton's Ant", steps: 2000 },
  wator: { name: "Wa-Tor", steps: 80 },
  ecosystem: { name: "Wolves, Sheep & Grass", steps: 100 },
  life: { name: "Conway's Game of Life", steps: 80 },
  wolfram: { name: "Elementary Cellular Automata", steps: 0 },
  boids: { name: "Boids", steps: 120 },
  ants: { name: "Ant Colony", steps: 600 },
  reaction: { name: "Gray–Scott Reaction–Diffusion", steps: 800 },
  particles: { name: "Particle Life", steps: 400 },
  lenia: { name: "Lenia", steps: 120, params: { pattern: "colony" } },
  physarum: { name: "Physarum Networks", steps: 300 },
  brain: { name: "Brian's Brain", steps: 120 },
  cyclic: { name: "Rock–Paper–Scissors", steps: 300 },
  forest: { name: "Forest Fire", steps: 50 },
  sandpile: { name: "Abelian Sandpile", steps: 1800 },
  dla: { name: "Diffusion-Limited Aggregation", steps: 0 },
  schelling: { name: "Schelling Segregation", steps: 80 },
  wireworld: { name: "Wireworld", steps: 12 },
  fireflies: { name: "Kuramoto Fireflies", steps: 35 },
  lsystem: { name: "L-System Garden", steps: 160 },
};
const records = [];
for (const [index, d] of catalog.entries()) {
  const config = settings[d.id],
    model = createModel(d.id, { ...d.defaults, ...config.params }, 1997);
  for (let i = 0; i < config.steps; i++) model.step();
  const frame = model.frame(),
    world = createCanvas(960, 560);
  Object.assign(world, {
    getBoundingClientRect: () => ({ width: 960, height: 560 }),
  });
  new Renderer(world as unknown as HTMLCanvasElement).set(frame);
  const sheet = createCanvas(960, 660),
    ctx = sheet.getContext("2d");
  ctx.fillStyle = "#171c17";
  ctx.fillRect(0, 0, 960, 660);
  ctx.fillStyle = d.accent;
  ctx.font = "bold 24px monospace";
  ctx.fillText(config.name, 26, 36);
  ctx.fillStyle = "#929f88";
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(
    `OLD AI / LIFE   ${String(index + 1).padStart(2, "0")} / 20`,
    934,
    34,
  );
  ctx.textAlign = "left";
  ctx.drawImage(world, 0, 54);
  ctx.strokeStyle = "#39432f";
  ctx.beginPath();
  ctx.moveTo(0, 54);
  ctx.lineTo(960, 54);
  ctx.moveTo(0, 614);
  ctx.lineTo(960, 614);
  ctx.stroke();
  ctx.fillStyle = "#aab698";
  ctx.font = "12px monospace";
  ctx.fillText(
    `SEED 1997   /   STEP ${frame.tick.toLocaleString("en-US")}   /   ${frame.width} × ${frame.height}`,
    26,
    642,
  );
  ctx.textAlign = "right";
  ctx.fillStyle = d.accent;
  ctx.fillText("SIMPLE RULES. UNEXPECTED WORLDS.", 934, 642);
  const png = sheet.toBuffer("image/png");
  await writeFile(new URL(`${d.id}.png`, directory), png);
  records.push({
    id: d.id,
    name: config.name,
    file: `${d.id}.png`,
    seed: 1997,
    stepsAfterInitialization: config.steps,
    tick: frame.tick,
    params: model.params,
    metrics: frame.metrics,
    sha256: createHash("sha256").update(png).digest("hex"),
  });
  console.log(
    `${d.id}: step ${frame.tick}, ${Math.round(png.length / 1024)} KiB`,
  );
}
const heroIds = [
  "langton",
  "wator",
  "physarum",
  "reaction",
  "boids",
  "cyclic",
  "dla",
  "lsystem",
];
const hero = createCanvas(1440, 690),
  ctx = hero.getContext("2d");
ctx.fillStyle = "#11160f";
ctx.fillRect(0, 0, 1440, 690);
ctx.fillStyle = "#c6db9d";
ctx.font = "bold 48px monospace";
ctx.fillText("oldai.life", 32, 65);
ctx.font = "14px monospace";
ctx.fillStyle = "#a8b396";
ctx.fillText("20 WORLDS / SIMPLE RULES / ENDLESS CURIOSITY", 34, 96);
ctx.textAlign = "right";
ctx.font = "italic 26px serif";
ctx.fillStyle = "#c3cdb4";
ctx.fillText("A childhood fascination, still alive.", 1406, 66);
ctx.textAlign = "left";
for (let i = 0; i < heroIds.length; i++) {
  const img = await loadImage(
      await readFile(new URL(`${heroIds[i]}.png`, directory)),
    ),
    x = 24 + (i % 4) * 352,
    y = 124 + Math.floor(i / 4) * 272;
  ctx.drawImage(img, x, y, 336, 231);
  ctx.strokeStyle = "#46513b";
  ctx.strokeRect(x - 0.5, y - 0.5, 337, 232);
}
ctx.font = "12px monospace";
ctx.fillStyle = "#81936f";
ctx.fillText("LOCAL-FIRST • TYPESCRIPT • CANVAS 2D • WEB WORKERS", 32, 672);
await writeFile(new URL("overview.png", directory), hero.toBuffer("image/png"));
await writeFile(
  new URL("manifest.json", directory),
  JSON.stringify(
    {
      generator: "npm run screenshots",
      renderer:
        "src/render.ts (application renderer), offscreen via @napi-rs/canvas",
      note: "Actual simulation states. Documentation captions are composed around the canvas; these images do not depict the full application UI. System font rasterization can differ across platforms.",
      records,
    },
    null,
    2,
  ) + "\n",
);
