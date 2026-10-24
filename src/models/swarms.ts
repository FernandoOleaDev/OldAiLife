import { BG, Model } from "../core/base";
import { clamp, delta, wrap } from "../core/random";
import { Spatial } from "../core/spatial";
import type { Paint, Params } from "../core/types";
interface Mover {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type?: number;
}
const SWARM_COLORS = [
  "#a5dbce",
  "#e3b674",
  "#ad9acb",
  "#81acdc",
  "#e38b91",
  "#b8d27f",
];
export class Boids extends Model {
  id = "boids";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = { agents: [], target: null };
    for (let i = 0; i < this.p("count"); i++)
      this.add(this.rng.next() * this.n, this.rng.next() * this.n);
  }
  add(x: number, y: number) {
    const a = this.rng.next() * Math.PI * 2;
    this.state.agents.push({
      x,
      y,
      vx: Math.cos(a) * this.p("speed"),
      vy: Math.sin(a) * this.p("speed"),
    });
  }
  step() {
    const agents: Mover[] = this.state.agents,
      r = this.p("radius"),
      bins = new Spatial(this.n, r);
    bins.build(agents);
    const next = agents.map((a) => {
      let ax = 0,
        ay = 0,
        cx = 0,
        cy = 0,
        sx = 0,
        sy = 0,
        count = 0;
      bins.each(a.x, a.y, (i) => {
        const b = agents[i],
          dx = delta(b.x - a.x, this.n),
          dy = delta(b.y - a.y, this.n),
          d = Math.hypot(dx, dy);
        if (d === 0 || d > r) return;
        const facing = (a.vx * dx + a.vy * dy) / (Math.hypot(a.vx, a.vy) * d);
        if (facing < -0.7) return;
        count++;
        ax += b.vx;
        ay += b.vy;
        cx += dx;
        cy += dy;
        if (d < r * 0.45) {
          sx -= dx / (d * d);
          sy -= dy / (d * d);
        }
      });
      let fx = sx * this.p("separation") * 0.7,
        fy = sy * this.p("separation") * 0.7;
      if (count) {
        fx +=
          (ax / count - a.vx) * this.p("alignment") * 0.05 +
          (cx / count) * this.p("cohesion") * 0.003;
        fy +=
          (ay / count - a.vy) * this.p("alignment") * 0.05 +
          (cy / count) * this.p("cohesion") * 0.003;
      }
      if (this.state.target) {
        fx += delta(this.state.target.x - a.x, this.n) * 0.0015;
        fy += delta(this.state.target.y - a.y, this.n) * 0.0015;
      }
      const force = Math.hypot(fx, fy);
      if (force > 0.12) {
        fx *= 0.12 / force;
        fy *= 0.12 / force;
      }
      let vx = a.vx + fx,
        vy = a.vy + fy,
        speed = Math.hypot(vx, vy),
        max = this.p("speed");
      if (speed > max || speed < max * 0.5) {
        const target = speed > max ? max : max * 0.5;
        vx = (vx / (speed || 1)) * target;
        vy = (vy / (speed || 1)) * target;
      }
      return { x: wrap(a.x + vx, this.n), y: wrap(a.y + vy, this.n), vx, vy };
    });
    this.state.agents = next;
    this.tick++;
  }
  frame() {
    const agents: Mover[] = this.state.agents;
    let vx = 0,
      vy = 0;
    for (const a of agents) {
      const m = Math.hypot(a.vx, a.vy) || 1;
      vx += a.vx / m;
      vy += a.vy / m;
    }
    return {
      ...this.base(),
      points: agents.map((a, i) => ({
        x: a.x,
        y: a.y,
        angle: Math.atan2(a.vy, a.vx),
        shape: "triangle" as const,
        color: SWARM_COLORS[i % 3],
        size: 2.8,
      })),
      metrics: [
        { label: "Individuos", value: agents.length, color: "#a5dbce" },
        {
          label: "Alineación %",
          value: Math.round((Math.hypot(vx, vy) / (agents.length || 1)) * 100),
          color: "#e3b674",
        },
      ],
      note: this.state.target
        ? "Atracción activa: usa «Borrar foco» para liberarlos."
        : undefined,
    };
  }
  paint(p: Paint) {
    if (p.tool === "attract") this.state.target = { x: p.x, y: p.y };
    else if (p.tool === "erase") this.state.target = null;
    else if (this.state.agents.length < 2000)
      for (let i = 0; i < 5; i++)
        this.add(
          wrap(p.x + (this.rng.next() - 0.5) * 12, this.n),
          wrap(p.y + (this.rng.next() - 0.5) * 12, this.n),
        );
  }
}
export function particleForce(r: number, a: number) {
  const beta = 0.3;
  return r < beta
    ? r / beta - 1
    : r < 1
      ? a * (1 - Math.abs(1 + beta - 2 * r) / (1 - beta))
      : 0;
}
export class Particles extends Model {
  id = "particles";
  constructor(p: Params, seed: number) {
    super(p, seed);
    const types = this.p("types"),
      matrix = Array.from({ length: types }, (_, i) =>
        Array.from({ length: types }, (_, j) =>
          p.pattern === "clusters"
            ? i === j
              ? 0.7
              : -0.3
            : p.pattern === "snake"
              ? (j + types - i) % types === 1
                ? 0.8
                : i === j
                  ? 0.15
                  : -0.3
              : this.rng.next() * 2 - 1,
        ),
      );
    this.state = { agents: [], matrix };
    for (let i = 0; i < this.p("count"); i++)
      this.add(this.rng.next() * this.n, this.rng.next() * this.n, i % types);
  }
  add(x: number, y: number, type: number) {
    this.state.agents.push({
      x: wrap(x, this.n),
      y: wrap(y, this.n),
      vx: 0,
      vy: 0,
      type,
    });
  }
  step() {
    const agents: Mover[] = this.state.agents,
      r = this.p("radius"),
      bins = new Spatial(this.n, r);
    bins.build(agents);
    const dt = 0.12,
      decay = Math.exp(-this.p("friction") * dt),
      forces = agents.map((a) => {
        let fx = 0,
          fy = 0;
        bins.each(a.x, a.y, (j) => {
          const b = agents[j],
            dx = delta(b.x - a.x, this.n),
            dy = delta(b.y - a.y, this.n),
            d = Math.hypot(dx, dy);
          if (d === 0 || d >= r) return;
          const f = particleForce(d / r, this.state.matrix[a.type!][b.type!]);
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        });
        return [fx, fy];
      });
    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      a.vx = a.vx * decay + forces[i][0] * this.p("force") * dt;
      a.vy = a.vy * decay + forces[i][1] * this.p("force") * dt;
      a.x = wrap(a.x + a.vx * dt, this.n);
      a.y = wrap(a.y + a.vy * dt, this.n);
    }
    this.tick++;
  }
  frame() {
    const agents: Mover[] = this.state.agents;
    return {
      ...this.base(),
      points: agents.map((a) => ({
        x: a.x,
        y: a.y,
        color: SWARM_COLORS[a.type!],
        size: 1.6,
      })),
      metrics: [
        { label: "Partículas", value: agents.length, color: "#a5dbce" },
        {
          label: "Velocidad media",
          value:
            Math.round(
              (agents.reduce((s, a) => s + Math.hypot(a.vx, a.vy), 0) /
                (agents.length || 1)) *
                100,
            ) / 100,
          color: "#e3b674",
        },
      ],
      matrix: this.state.matrix,
    };
  }
  paint(p: Paint) {
    if (p.tool === "erase")
      this.state.agents = this.state.agents.filter(
        (a: Mover) =>
          Math.hypot(delta(a.x - p.x, this.n), delta(a.y - p.y, this.n)) >
          p.radius * 4 + 4,
      );
    else if (this.state.agents.length < 2500)
      for (let i = 0; i < 8; i++)
        this.add(
          p.x + (this.rng.next() - 0.5) * 10,
          p.y + (this.rng.next() - 0.5) * 10,
          this.rng.int(this.p("types")),
        );
  }
}
interface Ant {
  x: number;
  y: number;
  a: number;
  carrying: boolean;
}
export class Ants extends Model {
  id = "ants";
  scratch: Float32Array;
  brush(p: Paint, fn: (i: number) => void) {
    for (let y = -p.radius; y <= p.radius; y++)
      for (let x = -p.radius; x <= p.radius; x++) {
        const px = Math.floor(p.x + x),
          py = Math.floor(p.y + y);
        if (
          x * x + y * y <= p.radius * p.radius &&
          px >= 0 &&
          py >= 0 &&
          px < this.n &&
          py < this.n
        )
          fn(py * this.n + px);
      }
  }
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.scratch = new Float32Array(this.n * this.n);
    this.state = {
      trail: new Float32Array(this.n * this.n),
      food: new Uint16Array(this.n * this.n),
      walls: new Uint8Array(this.n * this.n),
      ants: [],
      nest: { x: this.n / 2, y: this.n / 2 },
      delivered: 0,
    };
    for (let i = 0; i < this.p("count"); i++) this.add(this.n / 2, this.n / 2);
    for (let a = 0; a < 3; a++) {
      const angle = a * 2.1 + 0.4;
      this.brush(
        {
          x: this.n / 2 + Math.cos(angle) * this.n * 0.34,
          y: this.n / 2 + Math.sin(angle) * this.n * 0.34,
          radius: 6,
          tool: "food",
        },
        (i) => (this.state.food[i] = 10),
      );
    }
  }
  add(x: number, y: number) {
    this.state.ants.push({
      x,
      y,
      a: this.rng.next() * Math.PI * 2,
      carrying: false,
    });
  }
  idx(x: number, y: number) {
    return (
      Math.floor(clamp(y, 0, this.n - 1)) * this.n +
      Math.floor(clamp(x, 0, this.n - 1))
    );
  }
  step() {
    const s = this.state,
      rate = this.p("evaporation"),
      diff = this.p("diffusion");
    for (const a of s.ants as Ant[]) {
      const i = this.idx(a.x, a.y);
      if (!a.carrying && s.food[i]) {
        s.food[i]--;
        a.carrying = true;
        a.a += Math.PI;
      }
      if (a.carrying) {
        s.trail[i] = Math.min(100, s.trail[i] + this.p("deposit"));
        if (Math.hypot(a.x - s.nest.x, a.y - s.nest.y) < 4) {
          a.carrying = false;
          s.delivered++;
          a.a += Math.PI;
        } else a.a = Math.atan2(s.nest.y - a.y, s.nest.x - a.x);
      } else {
        const sample = (offset: number) => {
          const x = a.x + Math.cos(a.a + offset) * this.p("sensor"),
            y = a.y + Math.sin(a.a + offset) * this.p("sensor");
          return s.trail[this.idx(x, y)];
        };
        const f = sample(0),
          l = sample(-0.65),
          r = sample(0.65);
        if (l > f && l > r) a.a -= 0.4;
        else if (r > f && r > l) a.a += 0.4;
      }
      a.a += (this.rng.next() - 0.5) * this.p("wander");
      const nx = a.x + Math.cos(a.a),
        ny = a.y + Math.sin(a.a);
      if (
        nx < 1 ||
        ny < 1 ||
        nx >= this.n - 1 ||
        ny >= this.n - 1 ||
        s.walls[this.idx(nx, ny)]
      )
        a.a += Math.PI * 0.7;
      else {
        a.x = nx;
        a.y = ny;
      }
    }
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        const i = y * this.n + x;
        if (s.walls[i]) {
          this.scratch[i] = 0;
          continue;
        }
        let sum = 0;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const j = this.idx(x + dx, y + dy);
          sum += s.walls[j] ? s.trail[i] : s.trail[j];
        }
        this.scratch[i] =
          ((1 - diff) * s.trail[i] + (diff * sum) / 4) * (1 - rate);
      }
    const old = s.trail;
    s.trail = this.scratch;
    this.scratch = old;
    this.tick++;
  }
  frame() {
    const s = this.state;
    let food = 0;
    const pixels = this.pixels((i) => {
      food += s.food[i];
      if (s.walls[i]) return [74, 82, 76];
      if (s.food[i]) return [155, 192, 111];
      const x = i % this.n,
        y = Math.floor(i / this.n);
      if (Math.hypot(x - s.nest.x, y - s.nest.y) < 4) return [221, 165, 99];
      const t = clamp(Math.log1p(s.trail[i]) / 0.8);
      return [11 + t * 45, 17 + t * 88, 18 + t * 86];
    });
    return {
      ...this.base(),
      pixels,
      points: s.ants.map((a: Ant) => ({
        x: a.x,
        y: a.y,
        angle: a.a,
        color: a.carrying ? "#f0c28c" : "#d0d7c0",
        size: 0.65,
        shape: "ant" as const,
      })),
      metrics: [
        { label: "Comida recogida", value: s.delivered, color: "#e3b674" },
        { label: "Comida disponible", value: food, color: "#a5d57a" },
        { label: "Hormigas", value: s.ants.length, color: "#a5dbce" },
      ],
      note:
        food === 0
          ? "Alimento agotado. Añade comida para crear nuevas rutas."
          : undefined,
    };
  }
  paint(p: Paint) {
    const s = this.state;
    if (p.tool === "nest")
      s.nest = { x: clamp(p.x, 4, this.n - 4), y: clamp(p.y, 4, this.n - 4) };
    else if (p.tool === "ant") {
      if (s.ants.length < 2000) this.add(p.x, p.y);
    } else
      this.brush(p, (i) => {
        if (p.tool === "food") {
          s.food[i] = 15;
          s.walls[i] = 0;
        } else if (p.tool === "wall") {
          s.walls[i] = 1;
          s.food[i] = 0;
          s.trail[i] = 0;
        } else {
          s.food[i] = 0;
          s.walls[i] = 0;
          s.trail[i] = 0;
        }
      });
  }
}
