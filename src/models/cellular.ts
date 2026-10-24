import { BG, COLORS, Model } from "../core/base";
import { wrap } from "../core/random";
import type { Frame, Paint, Params } from "../core/types";
export class Langton extends Model {
  id = "langton";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = {
      cells: new Map<string, number>(),
      ants: [],
      minX: -48,
      maxX: 48,
      minY: -48,
      maxY: 48,
    };
    for (let i = 0; i < this.p("ants"); i++)
      this.state.ants.push({
        x: i ? Math.round(Math.cos(i * 2.4) * 15) : 0,
        y: i ? Math.round(Math.sin(i * 2.4) * 15) : 0,
        d: (i + this.p("heading")) % 4,
      });
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  step() {
    const s = this.state,
      rule = String(this.params.rule);
    if (s.cells.size > 1_000_000)
      throw Error(
        "Límite de un millón de casillas pintadas. Guarda la partida o reinicia.",
      );
    for (const a of s.ants) {
      const key = `${a.x},${a.y}`,
        c = s.cells.get(key) || 0;
      a.d = wrap(a.d + (rule[c % rule.length] === "R" ? 1 : -1), 4);
      const next = (c + 1) % rule.length;
      if (next) s.cells.set(key, next);
      else s.cells.delete(key);
      a.x += [0, 1, 0, -1][a.d];
      a.y += [-1, 0, 1, 0][a.d];
      if (this.params.topology === "wrap") {
        a.x = wrap(a.x + this.n / 2, this.n) - this.n / 2;
        a.y = wrap(a.y + this.n / 2, this.n) - this.n / 2;
      }
      s.minX = Math.min(s.minX, a.x);
      s.maxX = Math.max(s.maxX, a.x);
      s.minY = Math.min(s.minY, a.y);
      s.maxY = Math.max(s.maxY, a.y);
    }
    this.tick++;
  }
  frame(): Frame {
    const s = this.state,
      span =
        this.params.topology === "wrap"
          ? this.n
          : Math.max(s.maxX - s.minX, s.maxY - s.minY) + 20,
      scale = Math.max(1, Math.ceil(span / 512)),
      dim = Math.ceil(span / scale),
      ox =
        this.params.topology === "wrap"
          ? -this.n / 2
          : Math.floor((s.minX + s.maxX - span) / 2),
      oy =
        this.params.topology === "wrap"
          ? -this.n / 2
          : Math.floor((s.minY + s.maxY - span) / 2);
    const pix = new Uint8ClampedArray(dim * dim * 4);
    for (let i = 0; i < dim * dim; i++) {
      pix.set([...BG, 255], i * 4);
    }
    for (const [k, v] of s.cells) {
      const [x, y] = k.split(",").map(Number),
        px = Math.floor((x - ox) / scale),
        py = Math.floor((y - oy) / scale);
      if (px >= 0 && py >= 0 && px < dim && py < dim)
        pix.set([...COLORS[v % COLORS.length], 255], (py * dim + px) * 4);
    }
    return {
      ...this.base(),
      width: dim,
      height: dim,
      pixels: pix,
      originX: ox,
      originY: oy,
      scale,
      points: s.ants.map((a: any) => ({
        x: (a.x - ox + 0.5) / scale,
        y: (a.y - oy + 0.5) / scale,
        angle: (a.d * Math.PI) / 2 - Math.PI / 2,
        color: "#ffaf77",
        shape: "triangle",
        size: 2.4,
      })),
      metrics: [
        { label: "Casillas activas", value: s.cells.size, color: "#c0e799" },
        { label: "Hormigas", value: s.ants.length, color: "#e6aa72" },
      ],
    };
  }
  paint(p: Paint) {
    const s = this.state,
      x = Math.floor(p.x),
      y = Math.floor(p.y);
    if (p.tool === "ant") {
      if (s.ants.length < 100) s.ants.push({ x, y, d: this.p("heading") });
      return;
    }
    for (let j = -p.radius; j <= p.radius; j++)
      for (let i = -p.radius; i <= p.radius; i++) {
        if (i * i + j * j > p.radius * p.radius) continue;
        const px =
            this.params.topology === "wrap"
              ? wrap(x + i + this.n / 2, this.n) - this.n / 2
              : x + i,
          py =
            this.params.topology === "wrap"
              ? wrap(y + j + this.n / 2, this.n) - this.n / 2
              : y + j;
        const k = `${px},${py}`;
        if (p.tool === "erase") s.cells.delete(k);
        else s.cells.set(k, 1);
      }
    s.minX = Math.min(s.minX, x - p.radius);
    s.maxX = Math.max(s.maxX, x + p.radius);
    s.minY = Math.min(s.minY, y - p.radius);
    s.maxY = Math.max(s.maxY, y + p.radius);
  }
}
const GLIDER = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2],
];
const GUN = [
  [24, 0],
  [22, 1],
  [24, 1],
  [12, 2],
  [13, 2],
  [20, 2],
  [21, 2],
  [34, 2],
  [35, 2],
  [11, 3],
  [15, 3],
  [20, 3],
  [21, 3],
  [34, 3],
  [35, 3],
  [0, 4],
  [1, 4],
  [10, 4],
  [16, 4],
  [20, 4],
  [21, 4],
  [0, 5],
  [1, 5],
  [10, 5],
  [14, 5],
  [16, 5],
  [17, 5],
  [22, 5],
  [24, 5],
  [10, 6],
  [16, 6],
  [24, 6],
  [11, 7],
  [15, 7],
  [12, 8],
  [13, 8],
];
export class Life extends Model {
  id = "life";
  next: Uint8Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = {
      grid: new Uint8Array(this.n * this.n),
      age: new Uint16Array(this.n * this.n),
    };
    this.next = new Uint8Array(this.n * this.n);
    const g = this.state.grid;
    if (p.pattern === "soup")
      for (let i = 0; i < g.length; i++)
        g[i] = this.rng.next() < this.p("density") ? 1 : 0;
    else if (p.pattern === "gun") {
      for (const [x, y] of GUN) g[this.index(x + 10, y + 15)] = 1;
      for (const [x, y] of GUN)
        g[this.index(this.n - x - 11, this.n - y - 16)] = 1;
    } else if (p.pattern === "gliders") {
      for (let j = 10; j < this.n - 5; j += 20)
        for (let i = 10; i < this.n - 5; i += 20)
          for (const [x, y] of GLIDER) g[this.index(x + i, y + j)] = 1;
    }
  }
  step() {
    const { grid: g, age } = this.state,
      n = this.n,
      b = String(this.params.birth),
      s = String(this.params.survive);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let count = 0;
        for (let j = -1; j <= 1; j++)
          for (let i = -1; i <= 1; i++)
            if (i || j) count += g[this.index(x + i, y + j)];
        const k = y * n + x;
        this.next[k] = (g[k] ? s : b).includes(String(count)) ? 1 : 0;
        age[k] = this.next[k] ? Math.min(65535, age[k] + 1) : 0;
      }
    this.state.grid = this.next;
    this.next = g;
    this.tick++;
  }
  frame() {
    let count = 0;
    const { grid, age } = this.state;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        if (!grid[i]) return BG;
        count++;
        return age[i] > 20
          ? [122, 183, 151]
          : age[i] > 3
            ? [178, 225, 174]
            : [228, 241, 194];
      }),
      metrics: [
        { label: "Células vivas", value: count, color: "#c0e799" },
        {
          label: "Ocupación %",
          value: Math.round((count / this.n ** 2) * 1000) / 10,
          color: "#69bec3",
        },
      ],
    };
  }
  paint(p: Paint) {
    if (p.tool === "glider") {
      for (const [x, y] of GLIDER)
        this.state.grid[this.index(p.x + x, p.y + y)] = 1;
    } else
      this.brush(p, (i) => {
        this.state.grid[i] = p.tool === "erase" ? 0 : 1;
        this.state.age[i] = 0;
      });
  }
}
export class Wolfram extends Model {
  id = "wolfram";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = { grid: new Uint8Array(this.n * this.n), row: 0 };
    if (p.pattern === "random") {
      for (let x = 0; x < this.n; x++)
        this.state.grid[x] = this.rng.next() < 0.5 ? 1 : 0;
    } else this.state.grid[Math.floor(this.n / 2)] = 1;
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  step() {
    const s = this.state,
      n = this.n,
      next = new Uint8Array(n),
      rule = this.p("rule");
    for (let x = 0; x < n; x++) {
      const bits =
        (s.grid[s.row * n + wrap(x - 1, n)] << 2) |
        (s.grid[s.row * n + x] << 1) |
        s.grid[s.row * n + wrap(x + 1, n)];
      next[x] = (rule >> bits) & 1;
    }
    if (s.row < n - 1) s.row++;
    else s.grid.copyWithin(0, n);
    s.grid.set(next, s.row * n);
    this.tick++;
  }
  frame() {
    const s = this.state;
    let count = 0;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        if (!s.grid[i]) return BG;
        count++;
        const y = Math.floor(i / this.n);
        return y === s.row
          ? [233, 178, 111]
          : [126, 175 + Math.round((35 * y) / this.n), 177];
      }),
      metrics: [
        { label: "Celdas encendidas", value: count, color: "#79c4cd" },
        { label: "Regla", value: this.p("rule"), color: "#e6aa72" },
      ],
      note:
        !s.grid
          .subarray(s.row * this.n, (s.row + 1) * this.n)
          .some((v: number) => v) && !(this.p("rule") & 1)
          ? "La fila se ha extinguido en este mundo finito. Cambia la regla o enciende una célula."
          : "Cada fila es una generación. Al llegar al final, el historial se desplaza.",
    };
  }
  paint(p: Paint) {
    const x = wrap(Math.floor(p.x), this.n);
    this.state.grid[this.state.row * this.n + x] = p.tool === "erase" ? 0 : 1;
  }
}
