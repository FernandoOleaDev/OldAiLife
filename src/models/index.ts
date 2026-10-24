import { Langton, Life, Wolfram } from "./cellular";
import { Wator, Ecosystem } from "./ecosystems";
import { Ants, Boids, Particles } from "./swarms";
import { Lenia, Reaction } from "./continuous";
import { Brain, Wireworld, Sandpile, DLA } from "./patterns";
import { Forest, Cyclic, Schelling } from "./ecology-extra";
import { Physarum, Fireflies, LSystem } from "./emergence";
import { validateParams } from "../catalog";
import { Model } from "../core/base";
import type { Params, Snapshot } from "../core/types";
const classes = {
  langton: Langton,
  life: Life,
  wolfram: Wolfram,
  wator: Wator,
  ecosystem: Ecosystem,
  ants: Ants,
  boids: Boids,
  particles: Particles,
  reaction: Reaction,
  lenia: Lenia,
  physarum: Physarum,
  brain: Brain,
  cyclic: Cyclic,
  forest: Forest,
  sandpile: Sandpile,
  dla: DLA,
  schelling: Schelling,
  wireworld: Wireworld,
  fireflies: Fireflies,
  lsystem: LSystem,
};
export function createModel(id: string, params: Params, seed: number): Model {
  const C = classes[id as keyof typeof classes];
  if (!C) throw Error("Modelo desconocido");
  return new C(validateParams(id, params), seed >>> 0);
}
export function restoreModel(s: Snapshot) {
  if (
    s?.format !== "oldailife" ||
    s.version !== 1 ||
    !Number.isSafeInteger(s.tick) ||
    s.tick < 0 ||
    !Number.isInteger(s.randomState) ||
    s.randomState < 0 ||
    s.randomState > 4294967295 ||
    !Number.isInteger(s.seed) ||
    s.seed < 0 ||
    s.seed > 4294967295
  )
    throw Error("El archivo no es una partida compatible de OldAiLife.");
  const m = createModel(s.id, s.params, s.seed);
  const expected = m.state;
  m.restore(s);
  validateShape(expected, m.state);
  validateState(m);
  const frame = m.frame();
  if (!frame.metrics.every((x) => Number.isFinite(x.value)))
    throw Error("Estado de partida inválido");
  return m;
}
function validateState(m: Model) {
  const s = m.state;
  const check = (valid: boolean) => {
    if (!valid) throw Error("La partida contiene un estado incoherente.");
  };
  const number = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  const position = (a: any) =>
    number(a.x) &&
    number(a.y) &&
    a.x >= 0 &&
    a.y >= 0 &&
    a.x < m.n &&
    a.y < m.n;
  const field = (a: ArrayLike<number>, max: number) => {
    for (let i = 0; i < a.length; i++)
      check(number(a[i]) && a[i] >= 0 && a[i] <= max);
  };
  if (m.id === "langton") {
    check(s.ants.length <= 100 && s.maxX >= s.minX && s.maxY >= s.minY);
    for (const a of s.ants)
      check(
        Number.isSafeInteger(a.x) &&
          Number.isSafeInteger(a.y) &&
          Number.isInteger(a.d) &&
          a.d >= 0 &&
          a.d < 4,
      );
    for (const [key, value] of s.cells) {
      const xy = key.split(",").map(Number);
      check(
        xy.length === 2 &&
          xy.every(Number.isSafeInteger) &&
          Number.isInteger(value) &&
          value > 0 &&
          value < String(m.params.rule).length,
      );
    }
  } else if (m.id === "life" || m.id === "wolfram" || m.id === "lenia") {
    field(s.grid, 1);
    if (m.id === "wolfram")
      check(Number.isInteger(s.row) && s.row >= 0 && s.row < m.n);
  } else if (m.id === "reaction") {
    field(s.a, 1);
    field(s.b, 1);
  } else if (m.id === "wator") {
    const ids = new Set<number>(),
      slots = new Set<number>();
    for (const a of s.animals) {
      check(
        position(a) &&
          Number.isInteger(a.x) &&
          Number.isInteger(a.y) &&
          (a.type === 1 || a.type === 2) &&
          a.alive === true &&
          Number.isSafeInteger(a.id) &&
          a.id > 0 &&
          a.id < s.nextId &&
          Number.isInteger(a.age) &&
          a.age >= 0 &&
          Number.isInteger(a.hunger) &&
          a.hunger >= 0,
      );
      const slot = m.index(a.x, a.y);
      check(!ids.has(a.id) && !slots.has(slot) && s.occupancy[slot] === a.id);
      ids.add(a.id);
      slots.add(slot);
    }
    check(
      s.occupancy.filter((id: number) => id !== 0).length === s.animals.length,
    );
  } else if (m.id === "ecosystem") {
    for (const a of s.animals)
      check(
        position(a) &&
          number(a.angle) &&
          number(a.energy) &&
          a.energy > 0 &&
          (a.type === 1 || a.type === 2) &&
          a.alive === true,
      );
  } else if (m.id === "ants") {
    check(position(s.nest));
    field(s.trail, 100);
    field(s.walls, 1);
    for (const a of s.ants)
      check(position(a) && number(a.a) && typeof a.carrying === "boolean");
  } else if (["brain", "wireworld", "forest", "cyclic"].includes(m.id)) {
    field(s.grid, m.id === "brain" ? m.p("refractory") + 1 : 3);
  } else if (m.id === "sandpile") {
    field(s.grid, 100000000);
    check(s.added >= 0 && s.lost >= 0 && s.topplings >= 0);
  } else if (m.id === "dla") {
    check(s.count === s.grid.filter((v: number) => v > 0).length);
    check(
      s.radius >= 1 && s.radius <= m.n && s.walkers.length === m.p("walkers"),
    );
    for (const w of s.walkers)
      check(position(w) && Number.isInteger(w.x) && Number.isInteger(w.y));
  } else if (m.id === "physarum" || m.id === "schelling") {
    const occupied = new Set<number>();
    check(s.agents.length <= m.n * m.n);
    for (const a of s.agents) {
      check(position(a));
      const i = m.index(a.x, a.y);
      check(!occupied.has(i));
      occupied.add(i);
      if (m.id === "physarum") check(number(a.a));
      else
        check(
          Number.isInteger(a.x) &&
            Number.isInteger(a.y) &&
            (a.type === 1 || a.type === 2),
        );
    }
    if (m.id === "physarum") {
      check(s.agents.length === Math.floor(m.n * m.n * m.p("density")));
      field(s.trail, 1000);
      field(s.food, 10);
    }
  } else if (m.id === "fireflies") {
    check(s.agents.length === m.p("count"));
    for (const a of s.agents)
      check(
        position(a) &&
          a.phase >= 0 &&
          a.phase < Math.PI * 2 &&
          number(a.omega) &&
          a.omega >= 0.2 &&
          a.omega <= 2.2,
      );
  } else if (m.id === "lsystem") {
    check(
      Number.isInteger(s.visible) &&
        s.visible >= 0 &&
        s.visible <= s.segments.length &&
        s.segments.length <= 18000,
    );
    for (const line of s.segments) {
      for (const key of ["x1", "x2", "y1", "y2"])
        check(number(line[key]) && line[key] >= 0 && line[key] <= m.n);
      check(
        Number.isInteger(line.depth) && line.depth >= 0 && line.depth <= 1000,
      );
    }
  } else {
    for (const a of s.agents) {
      check(position(a) && number(a.vx) && number(a.vy));
      if (m.id === "particles")
        check(Number.isInteger(a.type) && a.type >= 0 && a.type < m.p("types"));
    }
    if (m.id === "boids" && s.target !== null) check(position(s.target));
    if (m.id === "particles") {
      check(s.matrix.length === m.p("types"));
      for (const row of s.matrix)
        check(
          row.length === m.p("types") &&
            row.every((v: unknown) => number(v) && Math.abs(v as number) <= 1),
        );
    }
  }
}
function validateShape(template: any, value: any, path = "estado") {
  if (template instanceof Map) {
    if (!(value instanceof Map) || value.size > 1_000_000)
      throw Error("Mapa inválido");
    for (const [k, v] of value)
      if (
        typeof k !== "string" ||
        !/^[-\d]+,[-\d]+$/.test(k) ||
        !Number.isFinite(v)
      )
        throw Error("Casilla inválida");
    return;
  }
  if (ArrayBuffer.isView(template)) {
    if (
      !value ||
      value.constructor !== template.constructor ||
      (value as any).length !== (template as any).length
    )
      throw Error(`Dimensiones inválidas: ${path}`);
    return;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value) || value.length > 25000)
      throw Error("Lista inválida");
    if (template.length)
      for (const v of value) validateShape(template[0], v, path);
    return;
  }
  if (template && typeof template === "object") {
    if (!value || typeof value !== "object") throw Error("Estado inválido");
    for (const k of Object.keys(template))
      validateShape(template[k], value[k], path + "." + k);
    return;
  }
  if (
    typeof template === "number" &&
    (typeof value !== "number" || !Number.isFinite(value))
  )
    throw Error("Número inválido");
  if (typeof template === "boolean" && typeof value !== "boolean")
    throw Error("Estado inválido");
}
