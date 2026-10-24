import { BG, Model } from "../core/base";
import type { Paint, Params, RGB } from "../core/types";

export class Forest extends Model {
  id = "forest";
  next: Uint8Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    const grid = new Uint8Array(this.n * this.n);
    for (let i = 0; i < grid.length; i++)
      grid[i] = this.rng.next() < this.p("density") ? 1 : 0;
    this.state = { grid, burned: 0 };
    this.next = new Uint8Array(grid.length);
    if (p.ignition === "edge") {
      for (let y = 0; y < this.n; y++)
        if (grid[y * this.n]) grid[y * this.n] = 2;
    } else if (p.ignition === "center")
      this.brush(
        { x: this.n / 2, y: this.n / 2, radius: 2, tool: "fire" },
        (i) => (grid[i] = 2),
      );
  }
  step() {
    const g = this.state.grid;
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        const k = y * this.n + x,
          v = g[k];
        if (v === 2) {
          this.next[k] = 3;
          this.state.burned++;
        } else if (v === 1) {
          const neighbor =
            (x > 0 && g[k - 1] === 2) ||
            (x < this.n - 1 && g[k + 1] === 2) ||
            (y > 0 && g[k - this.n] === 2) ||
            (y < this.n - 1 && g[k + this.n] === 2);
          this.next[k] =
            neighbor || this.rng.next() < this.p("lightning") ? 2 : 1;
        } else this.next[k] = this.rng.next() < this.p("growth") ? 1 : v;
      }
    this.state.grid = this.next;
    this.next = g;
    this.tick++;
  }
  frame() {
    let trees = 0,
      fire = 0;
    const colors: RGB[] = [BG, [89, 135, 89], [243, 150, 76], [47, 43, 39]];
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const v = this.state.grid[i];
        if (v === 1) trees++;
        if (v === 2) fire++;
        return colors[v];
      }),
      metrics: [
        { label: "Árboles", value: trees, color: "#6eae70" },
        { label: "En llamas", value: fire, color: "#f3964c" },
        {
          label: "Quemados · acumulados",
          value: this.state.burned,
          color: "#ac9075",
        },
      ],
      note:
        !fire && !this.p("lightning")
          ? "Sin fuego activo. Enciende una zona o activa los rayos."
          : undefined,
    };
  }
  paint(p: Paint) {
    this.brushClosed(
      p,
      (i) =>
        (this.state.grid[i] =
          p.tool === "erase" ? 0 : p.tool === "tree" ? 1 : 2),
    );
  }
}

export class Cyclic extends Model {
  id = "cyclic";
  constructor(p: Params, seed: number) {
    super(p, seed);
    const grid = new Uint8Array(this.n * this.n);
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++)
        grid[y * this.n + x] =
          p.pattern === "sectors"
            ? 1 + Math.min(2, Math.floor((x / this.n) * 3))
            : this.rng.next() < this.p("density")
              ? 1 + this.rng.int(3)
              : 0;
    this.state = { grid, selected: 0 };
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  step() {
    const g = this.state.grid,
      selection = this.p("selection"),
      reproduction = this.p("reproduction"),
      total = selection + reproduction + this.p("mobility");
    if (total)
      for (let e = 0; e < g.length; e++) {
        const a = this.rng.int(g.length),
          dir = this.rng.int(4),
          x = a % this.n,
          y = Math.floor(a / this.n),
          b = this.index(x + [1, -1, 0, 0][dir], y + [0, 0, 1, -1][dir]),
          v = g[a],
          w = g[b],
          event = this.rng.next() * total;
        if (event < selection) {
          if (v && w && (v % 3) + 1 === w) {
            g[b] = 0;
            this.state.selected++;
          }
        } else if (event < selection + reproduction) {
          if (v && !w) g[b] = v;
        } else {
          g[a] = w;
          g[b] = v;
        }
      }
    this.tick++;
  }
  frame() {
    const counts = [0, 0, 0, 0],
      colors: RGB[] = [BG, [211, 135, 112], [119, 177, 151], [125, 154, 213]];
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        counts[this.state.grid[i]]++;
        return colors[this.state.grid[i]];
      }),
      metrics: [
        { label: "Roca → tijera", value: counts[1], color: "#d38770" },
        { label: "Tijera → papel", value: counts[2], color: "#77b197" },
        { label: "Papel → roca", value: counts[3], color: "#7d9ad5" },
      ],
      note:
        counts.slice(1).filter((v) => v > 0).length < 2
          ? "Ha desaparecido la competencia. Introduce otra especie."
          : undefined,
    };
  }
  paint(p: Paint) {
    this.brush(
      p,
      (i) => (this.state.grid[i] = p.tool === "erase" ? 0 : Number(p.tool)),
    );
  }
}

export class Schelling extends Model {
  id = "schelling";
  constructor(p: Params, seed: number) {
    super(p, seed);
    const agents = [];
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++)
        if (this.rng.next() < this.p("density"))
          agents.push({
            x,
            y,
            type: this.rng.next() < this.p("balance") ? 1 : 2,
          });
    this.state = { agents, moves: 0 };
  }
  grid() {
    const g = new Uint8Array(this.n * this.n);
    for (const a of this.state.agents) g[this.index(a.x, a.y)] = a.type;
    return g;
  }
  happy(a: any, g: Uint8Array) {
    let same = 0,
      total = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        if (dx || dy) {
          const v = g[this.index(a.x + dx, a.y + dy)];
          if (v) {
            total++;
            if (v === a.type) same++;
          }
        }
    return !total || same / total >= this.p("similarity");
  }
  step() {
    const g = this.grid(),
      empty: number[] = [];
    g.forEach((v, i) => {
      if (!v) empty.push(i);
    });
    const order = [...this.state.agents];
    this.rng.shuffle(order);
    let moves = 0;
    for (const a of order)
      if (empty.length && !this.happy(a, g)) {
        const choice = this.rng.int(empty.length),
          dest = empty[choice],
          old = this.index(a.x, a.y);
        g[dest] = a.type;
        g[old] = 0;
        empty[choice] = old;
        a.x = dest % this.n;
        a.y = Math.floor(dest / this.n);
        moves++;
      }
    this.state.moves = moves;
    this.tick++;
  }
  frame() {
    const g = this.grid(),
      n = this.state.agents.length,
      unhappy = this.state.agents.filter((a: any) => !this.happy(a, g)).length,
      colors: RGB[] = [BG, [214, 167, 111], [135, 166, 206]];
    return {
      ...this.base(),
      pixels: this.pixels((i) => colors[g[i]]),
      metrics: [
        {
          label: "Satisfechos · %",
          value: n ? Math.round(((n - unhappy) / n) * 100) : 100,
          color: "#d6a76f",
        },
        { label: "Mudanzas / paso", value: this.state.moves, color: "#87a6ce" },
        { label: "Insatisfechos", value: unhappy, color: "#caa7ac" },
      ],
      note:
        unhappy === 0
          ? "Configuración estable bajo este umbral. Cambia la preferencia o añade agentes."
          : n === g.length
            ? "No quedan casillas vacías para mudarse. Borra algunas."
            : undefined,
    };
  }
  paint(p: Paint) {
    const slots = new Map<number, any>(
      this.state.agents.map((a: any) => [this.index(a.x, a.y), a]),
    );
    this.brush(p, (i) => {
      if (p.tool === "erase") slots.delete(i);
      else
        slots.set(i, {
          x: i % this.n,
          y: Math.floor(i / this.n),
          type: Number(p.tool),
        });
    });
    this.state.agents = [...slots.values()];
  }
}
