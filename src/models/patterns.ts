import { BG, Model } from "../core/base";
import type { Paint, Params, RGB } from "../core/types";

/** Three-state excitable medium, with a configurable refractory interval. */
export class Brain extends Model {
  id = "brain";
  next: Uint8Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = { grid: new Uint8Array(this.n * this.n) };
    this.next = new Uint8Array(this.n * this.n);
    if (p.pattern === "soup")
      for (let i = 0; i < this.next.length; i++)
        this.state.grid[i] = this.rng.next() < this.p("density") ? 1 : 0;
    else if (p.pattern === "spark") {
      const c = this.n / 2;
      for (const [x, y] of [
        [0, 0],
        [1, 0],
        [0, 1],
        [2, 1],
      ])
        this.state.grid[this.index(c + x, c + y)] = 1;
    }
  }
  step() {
    const g = this.state.grid;
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        const k = y * this.n + x,
          v = g[k];
        if (v === 1) this.next[k] = 2;
        else if (v > 1)
          this.next[k] = v >= this.p("refractory") + 1 ? 0 : v + 1;
        else {
          let on = 0;
          for (let j = -1; j <= 1; j++)
            for (let i = -1; i <= 1; i++)
              if (i || j) on += g[this.index(x + i, y + j)] === 1 ? 1 : 0;
          this.next[k] = on === this.p("neighbors") ? 1 : 0;
        }
      }
    this.state.grid = this.next;
    this.next = g;
    this.tick++;
  }
  frame() {
    let on = 0,
      recovering = 0;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const v = this.state.grid[i];
        if (v === 1) {
          on++;
          return [196, 224, 242];
        }
        if (v > 1) {
          recovering++;
          return [63, 92, 143];
        }
        return BG;
      }),
      metrics: [
        { label: "Excitadas", value: on, color: "#c4e0f2" },
        { label: "En reposo", value: recovering, color: "#6584b6" },
      ],
      note:
        on === 0
          ? "Sin células excitadas. Dibuja un nuevo estímulo."
          : undefined,
    };
  }
  paint(p: Paint) {
    this.brush(
      p,
      (i) =>
        (this.state.grid[i] =
          p.tool === "erase" ? 0 : p.tool === "rest" ? 2 : 1),
    );
  }
}

/** Four states: empty, electron head, electron tail, copper. Synchronous. */
export class Wireworld extends Model {
  id = "wireworld";
  next: Uint8Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = { grid: new Uint8Array(this.n * this.n) };
    this.next = new Uint8Array(this.n * this.n);
    if (p.pattern === "loops") {
      for (let y = 12; y < this.n - 12; y += 26)
        for (let x = 12; x < this.n - 12; x += 26) this.loop(x, y);
    } else if (p.pattern === "wires") {
      for (let y = 10; y < this.n - 8; y += 10) {
        for (let x = 5; x < this.n - 5; x++)
          this.state.grid[y * this.n + x] = 3;
        this.state.grid[y * this.n + 8] = 2;
        this.state.grid[y * this.n + 9] = 1;
      }
    }
  }
  loop(x: number, y: number) {
    const g = this.state.grid,
      w = 16,
      h = 12;
    const set = (px: number, py: number, value: number) => {
      if (px >= 0 && py >= 0 && px < this.n && py < this.n)
        g[py * this.n + px] = value;
    };
    for (let i = 1; i < w; i++) {
      set(x + i, y, 3);
      set(x + i, y + h, 3);
    }
    for (let j = 1; j < h; j++) {
      set(x, y + j, 3);
      set(x + w, y + j, 3);
    }
    set(x + 3, y, 2);
    set(x + 4, y, 1);
  }
  step() {
    const g = this.state.grid;
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        const k = y * this.n + x,
          v = g[k];
        if (v === 1) this.next[k] = 2;
        else if (v === 2) this.next[k] = 3;
        else if (v === 3) {
          let heads = 0;
          for (let j = -1; j <= 1; j++)
            for (let i = -1; i <= 1; i++)
              if (
                (i || j) &&
                x + i >= 0 &&
                y + j >= 0 &&
                x + i < this.n &&
                y + j < this.n
              )
                heads += g[(y + j) * this.n + x + i] === 1 ? 1 : 0;
          this.next[k] = heads === 1 || heads === 2 ? 1 : 3;
        } else this.next[k] = 0;
      }
    this.state.grid = this.next;
    this.next = g;
    this.tick++;
  }
  frame() {
    let heads = 0,
      copper = 0;
    const colors: RGB[] = [
      BG,
      [137, 212, 237],
      [225, 116, 105],
      [191, 149, 70],
    ];
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const v = this.state.grid[i];
        if (v === 1) heads++;
        if (v) copper++;
        return colors[v];
      }),
      metrics: [
        { label: "Electrones", value: heads, color: "#89d4ed" },
        { label: "Circuito · celdas", value: copper, color: "#bf9546" },
      ],
      note:
        heads === 0
          ? "No hay pulsos. Dibuja un conductor e introduce una cabeza y una cola."
          : undefined,
    };
  }
  paint(p: Paint) {
    if (p.tool === "loop") this.loop(Math.floor(p.x) - 8, Math.floor(p.y) - 6);
    else
      this.brushClosed(
        p,
        (i) =>
          (this.state.grid[i] =
            p.tool === "erase"
              ? 0
              : p.tool === "head"
                ? 1
                : p.tool === "tail"
                  ? 2
                  : 3),
      );
  }
}

/** Abelian sandpile: every toppling transfers exactly four grains to four neighbors. */
export class Sandpile extends Model {
  id = "sandpile";
  delta: Int32Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    const grid = new Int32Array(this.n * this.n);
    if (p.pattern === "random")
      for (let i = 0; i < grid.length; i++) grid[i] = this.rng.int(4);
    else if (p.pattern === "critical") grid.fill(3);
    else if (p.pattern === "pile")
      grid[this.index(this.n / 2, this.n / 2)] = this.p("initial");
    this.state = {
      grid,
      topplings: 0,
      lost: 0,
      added: 0,
      active: 0,
      avalanche: 0,
      lastAvalanche: 0,
    };
    this.delta = new Int32Array(grid.length);
  }
  step() {
    const s = this.state,
      g = s.grid;
    this.delta.fill(0);
    let active = 0,
      topplings = 0;
    for (let y = 0; y < this.n; y++)
      for (let x = 0; x < this.n; x++) {
        const i = y * this.n + x,
          q = Math.floor(g[i] / 4);
        if (!q) continue;
        active++;
        topplings += q;
        this.delta[i] -= 4 * q;
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          if (x + dx < 0 || y + dy < 0 || x + dx >= this.n || y + dy >= this.n)
            s.lost += q;
          else this.delta[(y + dy) * this.n + x + dx] += q;
        }
      }
    for (let i = 0; i < g.length; i++) g[i] += this.delta[i];
    s.active = active;
    s.topplings += topplings;
    if (active) s.avalanche += topplings;
    else {
      if (s.avalanche) {
        s.lastAvalanche = s.avalanche;
        s.avalanche = 0;
      }
      for (let j = 0; j < this.p("drive"); j++) {
        const i =
          this.params.drop === "center"
            ? this.index(this.n / 2, this.n / 2)
            : this.rng.int(g.length);
        g[i]++;
        s.added++;
      }
    }
    this.tick++;
  }
  frame() {
    const s = this.state;
    let grains = 0,
      unstable = 0;
    const colors: RGB[] = [
      BG,
      [86, 133, 133],
      [191, 167, 98],
      [177, 108, 101],
      [234, 226, 175],
    ];
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        grains += s.grid[i];
        if (s.grid[i] >= 4) unstable++;
        return colors[Math.min(4, s.grid[i])];
      }),
      metrics: [
        { label: "Granos", value: grains, color: "#bfa762" },
        { label: "Celdas inestables", value: unstable, color: "#eae2af" },
        { label: "Disipados", value: s.lost, color: "#b16c65" },
      ],
      note:
        this.p("drive") === 0 && s.grid.every((v: number) => v < 4)
          ? "Montículo estable. Deposita más arena o activa el aporte."
          : undefined,
    };
  }
  paint(p: Paint) {
    this.brushClosed(p, (i) => {
      if (p.tool === "erase") {
        this.state.lost += this.state.grid[i];
        this.state.grid[i] = 0;
      } else {
        this.state.grid[i] += this.p("brushGrains");
        this.state.added += this.p("brushGrains");
      }
    });
  }
}

/** Square-lattice DLA with launch/kill circles. Adhesion remains probabilistic. */
export class DLA extends Model {
  id = "dla";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = {
      grid: new Uint16Array(this.n * this.n),
      walkers: [],
      radius: 1,
      count: 0,
      stopped: false,
    };
    this.stick(this.n / 2, this.n / 2);
    if (p.pattern === "cross")
      for (let i = -5; i <= 5; i++) {
        this.stick(this.n / 2 + i, this.n / 2);
        this.stick(this.n / 2, this.n / 2 + i);
      }
    for (let i = 0; i < this.p("walkers"); i++)
      this.state.walkers.push(this.launch());
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  stick(x: number, y: number) {
    const i = y * this.n + x;
    if (this.state.grid[i]) return;
    this.state.count++;
    this.state.grid[i] = Math.min(65535, this.state.count);
    this.state.radius = Math.max(
      this.state.radius,
      Math.hypot(x - this.n / 2, y - this.n / 2),
    );
    if (this.state.radius >= this.n / 2 - 6) this.state.stopped = true;
  }
  launch() {
    const angle = this.rng.next() * Math.PI * 2,
      r = Math.min(this.n / 2 - 3, this.state.radius + 7);
    return {
      x: Math.round(this.n / 2 + Math.cos(angle) * r),
      y: Math.round(this.n / 2 + Math.sin(angle) * r),
    };
  }
  step() {
    const s = this.state;
    if (!s.stopped)
      for (const w of s.walkers) {
        for (let iter = 0; iter < this.p("walk"); iter++) {
          const dir = this.rng.int(4);
          w.x += [1, -1, 0, 0][dir];
          w.y += [0, 0, 1, -1][dir];
          if (
            w.x < 1 ||
            w.y < 1 ||
            w.x >= this.n - 1 ||
            w.y >= this.n - 1 ||
            Math.hypot(w.x - this.n / 2, w.y - this.n / 2) > s.radius + 18
          ) {
            Object.assign(w, this.launch());
            continue;
          }
          const idx = w.y * this.n + w.x;
          if (s.grid[idx]) {
            Object.assign(w, this.launch());
            continue;
          }
          let neighbor = false;
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++)
              if (
                (dx || dy) &&
                (this.p("neighbors") === 8 ||
                  Math.abs(dx) + Math.abs(dy) === 1) &&
                s.grid[(w.y + dy) * this.n + w.x + dx]
              )
                neighbor = true;
          if (neighbor && this.rng.next() < this.p("stickiness")) {
            this.stick(w.x, w.y);
            Object.assign(w, this.launch());
            break;
          }
        }
        if (s.stopped) break;
      }
    this.tick++;
  }
  frame() {
    const s = this.state;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const v = s.grid[i];
        if (!v) return BG;
        const t = Math.min(1, v / Math.max(1, s.count));
        return [80 + 150 * t, 160 + 57 * t, 184 - 75 * t];
      }),
      points:
        this.params.show === "yes"
          ? s.walkers.map((w: any) => ({
              x: w.x + 0.5,
              y: w.y + 0.5,
              color: "#637c7e",
              size: 0.35,
            }))
          : [],
      metrics: [
        { label: "Partículas fijadas", value: s.count, color: "#cbd1a3" },
        {
          label: "Radio",
          value: Math.round(s.radius * 10) / 10,
          color: "#7ab8c0",
        },
      ],
      note:
        s.count === 0
          ? "No queda ningún núcleo. Dibuja uno para reanudar el crecimiento."
          : s.stopped
            ? "El agregado ha alcanzado el borde. Reinicia con un mundo mayor."
            : undefined,
    };
  }
  paint(p: Paint) {
    this.brushClosed(p, (i) => {
      if (p.tool === "erase") this.state.grid[i] = 0;
      else this.stick(i % this.n, Math.floor(i / this.n));
    });
    this.state.radius = 1;
    this.state.count = 0;
    this.state.grid.forEach((v: number, i: number) => {
      if (v) {
        this.state.count++;
        this.state.radius = Math.max(
          this.state.radius,
          Math.hypot(
            (i % this.n) - this.n / 2,
            Math.floor(i / this.n) - this.n / 2,
          ),
        );
      }
    });
    this.state.stopped = this.state.radius >= this.n / 2 - 6;
  }
}
