import test from "node:test";
import assert from "node:assert/strict";
import { catalog, definition, validateParams } from "../src/catalog";
import { createModel, restoreModel } from "../src/models";
import { Brain, Wireworld, Sandpile, DLA } from "../src/models/patterns";
import { Forest, Cyclic, Schelling } from "../src/models/ecology-extra";
import { Physarum, Fireflies, rewrite, turtle } from "../src/models/emergence";
const p = (id: string) => ({ ...definition(id).defaults });
const mass = (grid: ArrayLike<number>) =>
  Array.from(grid).reduce((s, v) => s + v, 0);

test("Brain: excitación por exactamente dos vecinos y ciclo refractario", () => {
  const m = new Brain({ ...p("brain"), size: 64, pattern: "empty" }, 1),
    k = m.index(20, 20);
  m.state.grid[k - 1] = 1;
  m.state.grid[k + 1] = 1;
  m.state.grid[k + 64 * 5] = 2;
  m.step();
  assert.equal(m.state.grid[k], 1);
  assert.equal(m.state.grid[k - 1], 2);
  assert.equal(m.state.grid[k + 64 * 5], 0);
  m.step();
  assert.equal(m.state.grid[k], 2);
  m.step();
  assert.equal(m.state.grid[k], 0);
});

test("Wireworld: señal dirigida y conservación de un pulso en un bucle", () => {
  const m = new Wireworld({ ...p("wireworld"), size: 64, pattern: "empty" }, 1);
  for (let x = 10; x <= 20; x++) m.state.grid[m.index(x, 20)] = 3;
  m.state.grid[m.index(10, 20)] = 2;
  m.state.grid[m.index(11, 20)] = 1;
  m.step();
  assert.equal(m.state.grid[m.index(10, 20)], 3);
  assert.equal(m.state.grid[m.index(11, 20)], 2);
  assert.equal(m.state.grid[m.index(12, 20)], 1);
  m.state.grid.fill(0);
  m.loop(20, 20);
  for (let i = 0; i < 400; i++) {
    m.step();
    assert.equal(m.state.grid.filter((v: number) => v === 1).length, 1);
  }
});

test("Arena: derrumbe de cuatro granos, disipación en esquinas y balance de masa", () => {
  const m = new Sandpile(
    { ...p("sandpile"), size: 64, pattern: "empty", drive: 0 },
    1,
  );
  m.state.grid[0] = 4;
  m.step();
  assert.equal(m.state.grid[0], 0);
  assert.equal(m.state.grid[1], 1);
  assert.equal(m.state.grid[64], 1);
  assert.equal(m.state.lost, 2);
  m.state.grid[m.index(32, 32)] = 10000;
  const initial = mass(m.state.grid) + m.state.lost;
  m.update({ drive: 3 });
  for (let i = 0; i < 400; i++) m.step();
  assert.equal(mass(m.state.grid) + m.state.lost, initial + m.state.added);
  assert(m.state.grid.every((v: number) => v >= 0));
});

test("DLA: crecimiento conectado, irreversible y detenido antes del borde", () => {
  const m = new DLA({ ...p("dla"), size: 64, warmup: 0 }, 1997);
  let count = 1;
  for (let i = 0; i < 500; i++) {
    m.step();
    assert(m.state.count >= count);
    count = m.state.count;
  }
  assert(count > 20);
  assert(m.state.stopped);
  const stable = m.state.grid.slice();
  m.step();
  assert.deepEqual(m.state.grid, stable);
  const seen = new Set<number>(),
    queue = [m.index(32, 32)];
  while (queue.length) {
    const k = queue.pop()!;
    if (seen.has(k)) continue;
    seen.add(k);
    const x = k % 64,
      y = Math.floor(k / 64);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const j = (y + dy) * 64 + x + dx;
        if ((dx || dy) && m.state.grid[j] && !seen.has(j)) queue.push(j);
      }
  }
  assert.equal(seen.size, count);
});

test("Incendios: propagación cardinal simultánea, sin salto diagonal ni envoltura", () => {
  const m = new Forest(
    { ...p("forest"), size: 64, growth: 0, lightning: 0, ignition: "none" },
    1,
  );
  m.state.grid.fill(1);
  m.state.grid[0] = 2;
  m.step();
  assert.equal(m.state.grid[0], 3);
  assert.equal(m.state.grid[1], 2);
  assert.equal(m.state.grid[64], 2);
  assert.equal(m.state.grid[65], 1);
  assert.equal(m.state.grid[63], 1);
  m.step();
  assert.equal(m.state.grid[65], 2);
});

test("Competencia cíclica: la selección solo elimina y la movilidad conserva especies", () => {
  const m = new Cyclic(
    { ...p("cyclic"), size: 64, warmup: 0, reproduction: 0, mobility: 0 },
    9,
  );
  const start = m.state.grid.filter((v: number) => v > 0).length;
  for (let i = 0; i < 30; i++) m.step();
  assert(m.state.grid.filter((v: number) => v > 0).length < start);
  m.update({ selection: 0, mobility: 1 });
  const counts = () =>
      [0, 1, 2, 3].map(
        (v) => m.state.grid.filter((x: number) => x === v).length,
      ),
    before = counts();
  for (let i = 0; i < 20; i++) m.step();
  assert.deepEqual(counts(), before);
});

test("Schelling: satisfacción y mudanzas conservan las poblaciones y la ocupación única", () => {
  const m = new Schelling({ ...p("schelling"), similarity: 0 }, 4);
  m.step();
  assert.equal(m.state.moves, 0);
  const counts = () =>
      [1, 2].map((t) => m.state.agents.filter((a: any) => a.type === t).length),
    before = counts();
  m.update({ similarity: 0.6 });
  for (let i = 0; i < 80; i++) {
    m.step();
    assert.equal(
      new Set(m.state.agents.map((a: any) => m.index(a.x, a.y))).size,
      m.state.agents.length,
    );
  }
  assert.deepEqual(counts(), before);
  assert.equal(m.frame().metrics[0].value, 100);
});

test("Physarum: exclusión, población constante, difusión y evaporación estables", () => {
  const m = new Physarum({ ...p("physarum"), size: 64, warmup: 0 }, 1997),
    count = m.state.agents.length;
  for (let i = 0; i < 120; i++) {
    m.step();
    assert.equal(
      new Set(m.state.agents.map((a: any) => m.index(a.x, a.y))).size,
      count,
    );
  }
  assert.equal(m.state.agents.length, count);
  assert(
    m.state.trail.every(
      (v: number) => Number.isFinite(v) && v >= 0 && v <= 1000,
    ),
  );
  m.state.agents = [];
  m.state.food.fill(0);
  m.state.trail.fill(10);
  m.step();
  assert(Math.abs(m.state.trail[0] - 9) < 1e-6);
});

test("Kuramoto: fases relativas sin acoplamiento y sincronización con acoplamiento", () => {
  const a = new Fireflies(
      { ...p("fireflies"), count: 20, spread: 0, coupling: 0 },
      7,
    ),
    r = a.order().r;
  for (let i = 0; i < 500; i++) a.step();
  assert(Math.abs(a.order().r - r) < 1e-12);
  const b = new Fireflies(
    { ...p("fireflies"), count: 20, spread: 0, coupling: 2 },
    7,
  );
  for (let i = 0; i < 500; i++) b.step();
  assert(b.order().r > 0.999);
  assert(b.order().r > r);
});

test("Sistemas L: reescritura paralela, pila de tortuga y límites de crecimiento", () => {
  assert.equal(rewrite("FX", { F: "FF", X: "F[X]" }), "FFF[X]");
  const segments = turtle("F[+F]F", Math.PI / 2);
  assert.equal(segments.length, 3);
  assert(Math.abs(segments[2].y2 + 2) < 1e-12);
  assert(Math.abs(segments[1].x2 - 1) < 1e-12);
  assert.throws(() => turtle("F]", 1));
  assert.throws(() => turtle("F[", 1));
  assert.throws(() => rewrite("FF", { F: "FFFFFF" }, 5));
  assert.throws(() => validateParams("lsystem", { ruleF: "F[" }));
  assert.throws(() => validateParams("lsystem", { axiom: "eval()" }));
  const m = createModel("lsystem", p("lsystem"), 1);
  for (let i = 0; i < 1000; i++) m.step();
  assert.equal(m.state.visible, m.state.segments.length);
  assert(m.state.segments.length > 1000);
});

test("Los nuevos mundos con frontera cerrada recortan el pincel en el borde", () => {
  for (const id of ["forest", "wireworld", "sandpile", "dla"]) {
    const m = createModel(id, { ...p(id), warmup: 0 }, 1);
    m.state.grid.fill(0);
    m.paint({ x: 0, y: 20, radius: 2, tool: definition(id).tools[0][0] });
    assert.equal(m.state.grid[20 * m.n + m.n - 1], 0, id);
  }
});

test("Partidas nuevas rechazan posiciones solapadas, estados inválidos y segmentos fuera de campo", () => {
  const phys = createModel(
    "physarum",
    { ...p("physarum"), warmup: 0 },
    1,
  ).save();
  (phys.data as any).agents[1] = { ...(phys.data as any).agents[0] };
  assert.throws(() => restoreModel(phys));
  const wire = createModel("wireworld", p("wireworld"), 1).save();
  (wire.data as any).grid.values[0] = 7;
  assert.throws(() => restoreModel(wire));
  const plant = createModel("lsystem", p("lsystem"), 1).save();
  (plant.data as any).segments[0].x1 = -1;
  assert.throws(() => restoreModel(plant));
});

test("Todos los ejemplos nuevos arrancan, avanzan y admiten una partida restaurada", () => {
  for (const d of catalog.slice(10))
    for (const preset of d.presets) {
      const m = createModel(d.id, { ...d.defaults, ...preset.params }, 1997);
      for (let i = 0; i < 20; i++) m.step();
      const restored = restoreModel(JSON.parse(JSON.stringify(m.save())));
      m.step();
      restored.step();
      assert.deepEqual(m.save(), restored.save(), `${d.id}: ${preset.name}`);
    }
});
