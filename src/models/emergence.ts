import { Model } from "../core/base";
import { wrap } from "../core/random";
import type { Paint, Params, Segment } from "../core/types";
const TAU = Math.PI * 2;

/** Jones' motor/sensor/diffusion stages with one particle per lattice cell. */
export class Physarum extends Model {
  id = "physarum";
  next: Float32Array;
  occupancy: Uint8Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    const cells = Array.from({ length: this.n * this.n }, (_, i) => i);
    this.rng.shuffle(cells);
    this.state = {
      agents: cells
        .slice(0, Math.floor(cells.length * this.p("density")))
        .map((i) => ({
          x: (i % this.n) + 0.5,
          y: Math.floor(i / this.n) + 0.5,
          a: this.rng.next() * TAU,
        })),
      trail: new Float32Array(cells.length),
      food: new Float32Array(cells.length),
    };
    this.next = new Float32Array(cells.length);
    this.occupancy = new Uint8Array(cells.length);
    if (p.pattern === "food")
      for (let i = 0; i < 3; i++) {
        const a = (i * TAU) / 3;
        this.brush(
          {
            x: this.n / 2 + Math.cos(a) * this.n * 0.25,
            y: this.n / 2 + Math.sin(a) * this.n * 0.25,
            radius: 3,
            tool: "food",
          },
          (j) => (this.state.food[j] = 10),
        );
      }
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  sense(a: any, angle: number) {
    return this.state.trail[
      this.index(
        a.x + Math.cos(angle) * this.p("sensor"),
        a.y + Math.sin(angle) * this.p("sensor"),
      )
    ];
  }
  step() {
    const s = this.state,
      g = s.trail;
    this.occupancy.fill(0);
    for (const a of s.agents) this.occupancy[this.index(a.x, a.y)] = 1;
    this.rng.shuffle(s.agents);
    for (const a of s.agents) {
      const x = wrap(a.x + Math.cos(a.a), this.n),
        y = wrap(a.y + Math.sin(a.a), this.n),
        old = this.index(a.x, a.y),
        dest = this.index(x, y);
      if (!this.occupancy[dest] || old === dest) {
        this.occupancy[old] = 0;
        this.occupancy[dest] = 1;
        a.x = x;
        a.y = y;
        g[dest] = Math.min(1000, g[dest] + this.p("deposit"));
      } else a.a = this.rng.next() * TAU;
    }
    const sa = (this.p("sensorAngle") * Math.PI) / 180,
      ra = (this.p("rotation") * Math.PI) / 180;
    for (const a of s.agents) {
      const f = this.sense(a, a.a),
        l = this.sense(a, a.a - sa),
        r = this.sense(a, a.a + sa);
      if (f > l && f > r) continue;
      if (f < l && f < r) a.a += (this.rng.next() < 0.5 ? -1 : 1) * ra;
      else if (l > r) a.a -= ra;
      else if (r > l) a.a += ra;
      a.a = wrap(a.a, TAU);
    }
    for (let i = 0; i < g.length; i++) g[i] = Math.min(1000, g[i] + s.food[i]);
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) sum += g[this.index(x + dx, y + dy)];
        this.next[y * this.n + x] = (sum / 9) * (1 - this.p("decay"));
      }
    s.trail = this.next;
    this.next = g;
    this.tick++;
  }
  frame() {
    const s = this.state;
    let sum = 0,
      occupied = 0;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const v = s.trail[i];
        sum += v;
        if (v > 5) occupied++;
        if (s.food[i]) return [213, 171, 105];
        const t = 1 - Math.exp(-v / 12);
        return [11 + 188 * t, 17 + 196 * t, 18 + 143 * t];
      }),
      points:
        this.params.show === "yes"
          ? s.agents.map((a: any) => ({
              x: a.x,
              y: a.y,
              size: 0.3,
              color: "#d4dcac",
            }))
          : [],
      metrics: [
        { label: "Partículas", value: s.agents.length, color: "#c7d5a1" },
        {
          label: "Rastro medio",
          value: Math.round((sum / s.trail.length) * 100) / 100,
          color: "#9fbda0",
        },
        {
          label: "Red · % de celdas",
          value: Math.round((occupied / s.trail.length) * 100),
          color: "#d5ab69",
        },
      ],
    };
  }
  paint(p: Paint) {
    this.brush(p, (i) => {
      if (p.tool === "erase") {
        this.state.trail[i] = 0;
        this.state.food[i] = 0;
      } else if (p.tool === "food") this.state.food[i] = 10;
      else this.state.trail[i] = 100;
    });
  }
}

/** Globally coupled Kuramoto oscillators; positions are a visual arrangement. */
export class Fireflies extends Model {
  id = "fireflies";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = {
      agents: Array.from({ length: this.p("count") }, () => ({
        x: this.rng.next() * this.n,
        y: this.rng.next() * this.n,
        phase: this.rng.next() * TAU,
        omega: 1.2 + (this.rng.next() * 2 - 1) * this.p("spread"),
      })),
    };
  }
  order() {
    let c = 0,
      s = 0;
    for (const a of this.state.agents) {
      c += Math.cos(a.phase);
      s += Math.sin(a.phase);
    }
    const n = this.state.agents.length;
    return { c: c / n, s: s / n, r: Math.hypot(c, s) / n };
  }
  step() {
    const { c, s } = this.order(),
      k = this.p("coupling");
    for (const a of this.state.agents)
      a.phase = wrap(
        a.phase +
          this.p("dt") *
            (a.omega + k * (s * Math.cos(a.phase) - c * Math.sin(a.phase))),
        TAU,
      );
    this.tick++;
  }
  frame() {
    let flashing = 0;
    const points = this.state.agents.map((a: any) => {
      const glow = Math.pow((1 + Math.cos(a.phase)) / 2, 16);
      if (glow > 0.5) flashing++;
      return {
        x: a.x,
        y: a.y,
        size: 0.7 + glow * 1.3,
        color: `rgb(${Math.round(48 + 196 * glow)},${Math.round(57 + 178 * glow)},${Math.round(39 + 100 * glow)})`,
      };
    });
    return {
      ...this.base(),
      points,
      metrics: [
        {
          label: "Sincronía · %",
          value: Math.round(this.order().r * 1000) / 10,
          color: "#e2df9a",
        },
        { label: "Destellando", value: flashing, color: "#aab97d" },
      ],
      note:
        this.p("coupling") === 0
          ? "Sin acoplamiento: cada oscilador conserva su frecuencia propia."
          : undefined,
    };
  }
  paint(p: Paint) {
    const radius = Math.max(6, p.radius * 2);
    for (const a of this.state.agents)
      if (Math.hypot(a.x - p.x, a.y - p.y) < radius)
        a.phase = p.tool === "scatter" ? this.rng.next() * TAU : 0;
  }
}

export function rewrite(
  word: string,
  rules: Record<string, string>,
  limit = 80000,
) {
  let next = "";
  for (const c of word) {
    next += rules[c] ?? c;
    if (next.length > limit)
      throw Error(
        "La gramática supera 80.000 símbolos. Reduce generaciones o la longitud de las reglas.",
      );
  }
  return next;
}
export function turtle(word: string, angle: number) {
  let x = 0,
    y = 0,
    a = -Math.PI / 2,
    depth = 0;
  const stack: { x: number; y: number; a: number; depth: number }[] = [],
    segments: Segment[] = [];
  for (const c of word) {
    if (c === "F") {
      const nx = x + Math.cos(a),
        ny = y + Math.sin(a);
      segments.push({ x1: x, y1: y, x2: nx, y2: ny, depth });
      x = nx;
      y = ny;
      if (segments.length > 18000)
        throw Error(
          "La planta supera 18.000 segmentos. Reduce las generaciones.",
        );
    } else if (c === "+") a += angle;
    else if (c === "-") a -= angle;
    else if (c === "[") {
      stack.push({ x, y, a, depth });
      depth++;
    } else if (c === "]") {
      const old = stack.pop();
      if (!old) throw Error("Hay un corchete de cierre sin apertura.");
      ({ x, y, a, depth } = old);
    }
  }
  if (stack.length) throw Error("Hay corchetes abiertos sin cerrar.");
  return segments;
}
export class LSystem extends Model {
  id = "lsystem";
  constructor(p: Params, seed: number) {
    super(p, seed);
    let word = String(p.axiom);
    for (let i = 0; i < this.p("generations"); i++)
      word = rewrite(word, { F: String(p.ruleF), X: String(p.ruleX) });
    const segments = turtle(word, (this.p("angle") * Math.PI) / 180);
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;
    for (const s of segments) {
      minX = Math.min(minX, s.x1, s.x2);
      maxX = Math.max(maxX, s.x1, s.x2);
      minY = Math.min(minY, s.y1, s.y2);
      maxY = Math.max(maxY, s.y1, s.y2);
    }
    const scale = (this.n - 24) / Math.max(maxX - minX, maxY - minY, 1),
      ox = (this.n - (maxX - minX) * scale) / 2,
      oy = (this.n - (maxY - minY) * scale) / 2;
    for (const s of segments) {
      s.x1 = (s.x1 - minX) * scale + ox;
      s.x2 = (s.x2 - minX) * scale + ox;
      s.y1 = (s.y1 - minY) * scale + oy;
      s.y2 = (s.y2 - minY) * scale + oy;
    }
    this.state = { segments, visible: 0, symbols: word.length };
  }
  step() {
    this.state.visible = Math.min(
      this.state.segments.length,
      this.state.visible + this.p("growth"),
    );
    this.tick++;
  }
  frame() {
    const s = this.state;
    return {
      ...this.base(),
      segments: s.segments.slice(0, s.visible),
      metrics: [
        { label: "Segmentos visibles", value: s.visible, color: "#bdd59c" },
        {
          label: "Segmentos totales",
          value: s.segments.length,
          color: "#789f80",
        },
        {
          label: "Generaciones",
          value: this.p("generations"),
          color: "#cead87",
        },
      ],
      note:
        s.visible >= s.segments.length
          ? "Desarrollo completo. Prueba otra gramática, ángulo o generación."
          : undefined,
    };
  }
  paint(p: Paint) {
    if (p.tool === "reveal") this.state.visible = this.state.segments.length;
    else this.state.visible = 0;
  }
}
