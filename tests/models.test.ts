import test from "node:test";
import assert from "node:assert/strict";
import { catalog, validateParams } from "../src/catalog";
import { createModel, restoreModel } from "../src/models";
import { Langton, Life, Wolfram } from "../src/models/cellular";
import { Ecosystem, Wator } from "../src/models/ecosystems";
import { Ants, Boids, Particles, particleForce } from "../src/models/swarms";
import { Reaction, Lenia } from "../src/models/continuous";
import { Random } from "../src/core/random";
import { fft, fft2 } from "../src/core/fft";
import { Spatial } from "../src/core/spatial";
const defaults = (id: string) => ({
  ...catalog.find((d) => d.id === id)!.defaults,
});
const mass = (a: ArrayLike<number>) => Array.from(a).reduce((s, v) => s + v, 0);
test("PRNG: misma semilla y restauración exacta", () => {
  const a = new Random(0),
    b = new Random(0);
  assert.deepEqual(
    Array.from({ length: 100 }, () => a.next()),
    Array.from({ length: 100 }, () => b.next()),
  );
  const s = a.state,
    x = a.next();
  a.state = s;
  assert.equal(a.next(), x);
});
test("Langton: traza clásica conocida de cinco pasos", () => {
  const m = new Langton({ ...defaults("langton"), warmup: 0 }, 1);
  m.step();
  assert.deepEqual(m.state.ants[0], { x: 1, y: 0, d: 1 });
  assert.equal(m.state.cells.get("0,0"), 1);
  for (let i = 0; i < 3; i++) m.step();
  assert.deepEqual(m.state.ants[0], { x: 0, y: 0, d: 0 });
  assert.equal(m.state.cells.size, 4);
  m.step();
  assert.deepEqual(m.state.ants[0], { x: -1, y: 0, d: 3 });
  assert.equal(m.state.cells.has("0,0"), false);
});
test("Langton: la autopista se desplaza dos casillas cada 104 pasos", () => {
  const m = new Langton(defaults("langton"), 1),
    a = { ...m.state.ants[0] };
  for (let i = 0; i < 104; i++) m.step();
  const b = m.state.ants[0];
  assert.equal(Math.abs(b.x - a.x), 2);
  assert.equal(Math.abs(b.y - a.y), 2);
  assert.equal(a.d, b.d);
});
test("Conway: oscilador blinker de periodo dos y planeador de periodo cuatro", () => {
  const m = new Life({ ...defaults("life"), size: 64, pattern: "empty" }, 1);
  const grid = m.state.grid;
  for (const x of [20, 21, 22]) grid[m.index(x, 20)] = 1;
  const original = grid.slice();
  m.step();
  assert.equal(mass(m.state.grid), 3);
  for (const y of [19, 20, 21]) assert.equal(m.state.grid[m.index(21, y)], 1);
  m.step();
  assert.deepEqual(m.state.grid, original);
  m.state.grid.fill(0);
  m.paint({ x: 10, y: 10, tool: "glider", radius: 0 });
  for (let i = 0; i < 4; i++) m.step();
  const expected = new Life(
    { ...defaults("life"), size: 64, pattern: "empty" },
    1,
  );
  expected.paint({ x: 11, y: 11, tool: "glider", radius: 0 });
  assert.deepEqual(m.state.grid, expected.state.grid);
});
test("Wolfram: regla 90 calcula XOR de los vecinos y regla 255 enciende toda la fila", () => {
  const m = new Wolfram({ ...defaults("wolfram"), size: 64, warmup: 0 }, 1);
  m.step();
  assert.equal(m.state.grid[64 + 31], 1);
  assert.equal(m.state.grid[64 + 33], 1);
  assert.equal(mass(m.state.grid.subarray(64, 128)), 2);
  m.step();
  assert.equal(m.state.grid[128 + 30], 1);
  assert.equal(m.state.grid[128 + 34], 1);
  assert.equal(m.state.grid[128 + 32], 0);
  m.update({ rule: 255 });
  m.step();
  assert.equal(mass(m.state.grid.subarray(192, 256)), 64);
});
test("Wa-Tor: hambre incluso sin movimiento y crías sin segundo turno", () => {
  const m = new Wator(
    { ...defaults("wator"), size: 64, fish: 0, sharks: 1, starve: 2 },
    4,
  );
  m.step();
  assert.equal(m.state.animals.length, 1);
  m.step();
  assert.equal(m.state.animals.length, 0);
  const f = new Wator(
    { ...defaults("wator"), size: 64, fish: 1, sharks: 0, fishBreed: 1 },
    4,
  );
  f.step();
  assert.equal(f.state.animals.length, 2);
  assert.equal(f.state.births, 1);
  assert.equal(mass(f.state.occupancy.map((v: number) => (v ? 1 : 0))), 2);
});
test("Wa-Tor: ocupación única, poblaciones e IDs coherentes durante 300 pasos", () => {
  const m = new Wator(
    { ...defaults("wator"), size: 64, fish: 800, sharks: 100 },
    99,
  );
  for (let k = 0; k < 300; k++) {
    m.step();
    const seen = new Set<number>();
    for (const a of m.state.animals) {
      const i = m.index(a.x, a.y);
      assert(!seen.has(i));
      seen.add(i);
      assert.equal(m.state.occupancy[i], a.id);
      assert(a.alive);
    }
    assert.equal(
      m.state.occupancy.filter((x: number) => x !== 0).length,
      m.state.animals.length,
    );
  }
});
test("Ecosistema: regeneración de hierba y muerte por falta de energía", () => {
  const m = new Ecosystem({ ...defaults("ecosystem"), sheep: 0, wolves: 0 }, 1);
  m.state.grass.fill(2);
  m.step();
  assert.equal(m.state.grass[0], 1);
  m.step();
  assert.equal(m.state.grass[0], 0);
  m.add(5, 5, 1);
  m.state.animals[0].energy = 0.5;
  m.state.grass.fill(10);
  m.step();
  assert.equal(m.state.animals.length, 0);
  assert.equal(m.state.deaths, 1);
});
test("Ecosistema: reproducción divide energía y la cría espera al siguiente paso", () => {
  const m = new Ecosystem(
    { ...defaults("ecosystem"), sheep: 0, wolves: 0, sheepBirth: 100 },
    1,
  );
  m.add(5, 5, 1);
  m.state.animals[0].energy = 11;
  m.state.grass.fill(10);
  m.step();
  assert.equal(m.state.animals.length, 2);
  assert.equal(m.state.animals[0].energy, 5);
  assert.equal(m.state.animals[1].energy, 5);
});
test("Índice espacial toroidal sin vecinos repetidos", () => {
  const grid = new Spatial(100, 80);
  grid.build([
    { x: 99, y: 99 },
    { x: 1, y: 1 },
  ]);
  const ids: number[] = [];
  grid.each(0, 0, (i) => ids.push(i));
  assert.deepEqual(ids.sort(), [0, 1]);
});
test("Boids: velocidades limitadas y posición periódica", () => {
  const m = new Boids({ ...defaults("boids"), count: 50 }, 1);
  for (let i = 0; i < 100; i++) m.step();
  for (const a of m.state.agents) {
    assert(a.x >= 0 && a.x < m.n && a.y >= 0 && a.y < m.n);
    assert(Math.hypot(a.vx, a.vy) <= m.p("speed") + 1e-10);
  }
});
test("Hormigas: recogida, entrega y evaporación sin creación espontánea de alimento", () => {
  const m = new Ants({ ...defaults("ants"), count: 0 }, 1);
  m.state.food.fill(0);
  m.add(20, 20);
  m.state.food[m.idx(20, 20)] = 2;
  m.step();
  assert.equal(m.state.food[m.idx(20, 20)], 1);
  assert(m.state.ants[0].carrying);
  m.state.ants[0].x = 64;
  m.state.ants[0].y = 64;
  m.step();
  assert.equal(m.state.delivered, 1);
  assert.equal(m.state.ants[0].carrying, false);
  m.state.ants = [];
  m.state.trail.fill(0);
  m.state.trail[m.idx(20, 20)] = 1;
  m.update({ evaporation: 0.1, diffusion: 0.5 });
  m.step();
  assert(Math.abs(mass(m.state.trail) - 0.9) < 1e-6);
});
test("Gray–Scott: equilibrio A=1/B=0 y concentraciones acotadas", () => {
  const m = new Reaction({ ...defaults("reaction"), size: 64, warmup: 0 }, 1);
  m.state.a.fill(1);
  m.state.b.fill(0);
  m.step();
  assert.equal(mass(m.state.b), 0);
  assert.equal(mass(m.state.a), 64 * 64);
  m.paint({ x: 32, y: 32, tool: "paint", radius: 3 });
  for (let i = 0; i < 200; i++) m.step();
  for (const a of [m.state.a, m.state.b])
    for (const x of a) assert(Number.isFinite(x) && x >= 0 && x <= 1);
});
test("Particle Life: función de fuerza y matriz asimétrica", () => {
  assert.equal(particleForce(0, 1), -1);
  assert(Math.abs(particleForce(0.3, 1)) < 1e-12);
  assert.equal(particleForce(1, 1), 0);
  assert(Math.abs(particleForce(0.65, 0.8) - 0.8) < 1e-12);
  assert(Math.abs(particleForce(0.65, -0.8) + 0.8) < 1e-12);
  const m = new Particles(
    { ...defaults("particles"), count: 0, radius: 100, types: 2 },
    1,
  );
  m.add(100, 100, 0);
  m.add(165, 100, 1);
  m.state.matrix = [
    [0, 1],
    [-1, 0],
  ];
  m.step();
  assert(m.state.agents[0].vx > 0);
  assert(m.state.agents[1].vx > 0);
});
test("FFT: ida/vuelta y convolución comparada con cálculo espacial directo", () => {
  const re = Float64Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
    im = new Float64Array(8);
  fft(re, im);
  fft(re, im, true);
  re.forEach((v, i) => assert(Math.abs(v - (i + 1)) < 1e-10));
  const n = 8,
    a = Float64Array.from({ length: n * n }, (_, i) => Math.sin(i)),
    k = Float64Array.from({ length: n * n }, (_, i) => (i % 7) / 200),
    ar = a.slice(),
    ai = new Float64Array(n * n),
    kr = k.slice(),
    ki = new Float64Array(n * n);
  fft2(ar, ai, n);
  fft2(kr, ki, n);
  for (let i = 0; i < ar.length; i++) {
    const r = ar[i] * kr[i] - ai[i] * ki[i];
    ai[i] = ar[i] * ki[i] + ai[i] * kr[i];
    ar[i] = r;
  }
  fft2(ar, ai, n, true);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      let sum = 0;
      for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++)
          sum += a[((y - j + n) % n) * n + ((x - i + n) % n)] * k[j * n + i];
      assert(Math.abs(sum - ar[y * n + x]) < 1e-10);
    }
});
test("Lenia: Orbium original sobrevive 1.000 pasos con masa estable", () => {
  const m = new Lenia(defaults("lenia"), 1);
  const initial = mass(m.state.grid);
  assert(initial > 76 && initial < 78);
  for (let i = 0; i < 1000; i++) m.step();
  const end = mass(m.state.grid);
  assert(end > 65 && end < 85, `Masa final: ${end}`);
  for (const x of m.state.grid) assert(Number.isFinite(x) && x >= 0 && x <= 1);
});
for (const d of catalog)
  test(`${d.name}: semilla, lotes y partida JSON reproducibles`, () => {
    const params = { ...d.defaults };
    if ("warmup" in params) params.warmup = 0;
    const a = createModel(d.id, params, 1997),
      b = createModel(d.id, params, 1997);
    for (let i = 0; i < 8; i++) a.step();
    for (let batch = 0; batch < 2; batch++)
      for (let i = 0; i < 4; i++) b.step();
    assert.deepEqual(a.save(), b.save());
    const restored = restoreModel(JSON.parse(JSON.stringify(a.save())));
    for (let i = 0; i < 5; i++) {
      a.step();
      restored.step();
    }
    assert.deepEqual(a.save(), restored.save());
    assert(a.frame().metrics.every((m) => Number.isFinite(m.value)));
  });
test("Entradas inválidas se rechazan sin ejecutar reglas arbitrarias", () => {
  assert.throws(() => validateParams("langton", { rule: "alert(1)" }));
  assert.throws(() => validateParams("lenia", { size: 200 }));
  assert.throws(() => restoreModel({ format: "other" } as any));
  const m = createModel("life", defaults("life"), 1),
    s = m.save();
  (s.data as any).grid.values = [];
  assert.throws(() => restoreModel(s));
});

test("Importación: rechaza matrices incompletas, estados de agente incompletos y semillas inválidas", () => {
  const particle = createModel("particles", defaults("particles"), 1).save();
  (particle.data as any).matrix = [[1]];
  assert.throws(() => restoreModel(particle));
  const ocean = createModel(
    "wator",
    { ...defaults("wator"), fish: 0, sharks: 0 },
    1,
  ).save();
  (ocean.data as any).animals = [{ x: 1, y: 1, type: 1 }];
  assert.throws(() => restoreModel(ocean));
  const life = createModel("life", defaults("life"), 1).save();
  life.seed = -1;
  assert.throws(() => restoreModel(life));
  assert.throws(() => validateParams("langton", { ants: 1.5 }));
  assert.throws(() => validateParams("wator", { size: 64, fish: 8000 }));
});

test("Los pinceles respetan fronteras cerradas y periódicas", () => {
  const ant = new Ants({ ...defaults("ants"), count: 0 }, 1);
  ant.state.food.fill(0);
  ant.paint({ x: 0, y: 20, tool: "food", radius: 2 });
  assert.equal(ant.state.food[20 * ant.n + ant.n - 1], 0);
  const langton = new Langton(
    { ...defaults("langton"), topology: "wrap", warmup: 0 },
    1,
  );
  langton.paint({ x: 127, y: 0, tool: "paint", radius: 2 });
  assert.equal(langton.state.cells.get("-128,0"), 1);
  assert.equal(langton.state.cells.has("128,0"), false);
});
