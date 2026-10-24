import { Model } from "../core/base";
import { clamp } from "../core/random";
import { fft2 } from "../core/fft";
import type { Paint, Params } from "../core/types";
import orbium from "../data/orbium.json";
export class Reaction extends Model {
  id = "reaction";
  nextA: Float32Array;
  nextB: Float32Array;
  neighbors: Int32Array[];
  constructor(p: Params, seed: number) {
    super(p, seed);
    const len = this.n * this.n;
    this.state = { a: new Float32Array(len).fill(1), b: new Float32Array(len) };
    this.nextA = new Float32Array(len);
    this.nextB = new Float32Array(len);
    this.neighbors = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ].map(([dx, dy]) =>
      Int32Array.from({ length: len }, (_, i) =>
        this.index((i % this.n) + dx, Math.floor(i / this.n) + dy),
      ),
    );
    for (let k = 0; k < (p.pattern === "single" ? 1 : 30); k++)
      this.brush(
        {
          x: p.pattern === "single" ? this.n / 2 : this.rng.int(this.n),
          y: p.pattern === "single" ? this.n / 2 : this.rng.int(this.n),
          radius: 3,
          tool: "paint",
        },
        (i) => {
          this.state.a[i] = 0.5;
          this.state.b[i] = 0.9;
        },
      );
    for (let i = 0; i < this.p("warmup"); i++) this.step();
  }
  step() {
    const { a, b } = this.state,
      f = this.p("feed"),
      k = this.p("kill"),
      da = this.p("diffA"),
      db = this.p("diffB");
    for (let i = 0; i < a.length; i++) {
      let la = -a[i],
        lb = -b[i];
      for (let j = 0; j < 8; j++) {
        const ni = this.neighbors[j][i],
          weight = j < 4 ? 0.2 : 0.05;
        la += weight * a[ni];
        lb += weight * b[ni];
      }
      const reaction = a[i] * b[i] * b[i];
      this.nextA[i] = clamp(a[i] + da * la - reaction + f * (1 - a[i]));
      this.nextB[i] = clamp(b[i] + db * lb + reaction - (k + f) * b[i]);
    }
    this.state.a = this.nextA;
    this.state.b = this.nextB;
    this.nextA = a;
    this.nextB = b;
    this.tick++;
  }
  frame() {
    let mass = 0,
      active = 0;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const b = this.state.b[i];
        mass += b;
        if (b > 0.1) active++;
        const t = clamp(b * 2.7);
        return [12 + 160 * t, 18 + 172 * t, 22 + 115 * t];
      }),
      metrics: [
        { label: "Masa B", value: Math.round(mass), color: "#c0d99d" },
        {
          label: "Área activa %",
          value: Math.round((active / this.n ** 2) * 100),
          color: "#79c4cd",
        },
      ],
    };
  }
  paint(p: Paint) {
    this.brush(p, (i) => {
      this.state.a[i] = p.tool === "erase" ? 1 : 0.5;
      this.state.b[i] = p.tool === "erase" ? 0 : 0.9;
    });
  }
}
export class Lenia extends Model {
  id = "lenia";
  kr: Float64Array;
  ki: Float64Array;
  re: Float64Array;
  im: Float64Array;
  constructor(p: Params, seed: number) {
    super(p, seed);
    const len = this.n * this.n;
    this.kr = new Float64Array(len);
    this.ki = new Float64Array(len);
    this.re = new Float64Array(len);
    this.im = new Float64Array(len);
    this.state = { grid: new Float64Array(len) };
    this.kernel();
    if (p.pattern === "colony")
      for (let y = 24; y < this.n; y += 40)
        for (let x = 24; x < this.n; x += 40) this.place(x, y);
    else if (p.pattern === "noise")
      for (let i = 0; i < len; i++)
        this.state.grid[i] = this.rng.next() < 0.2 ? this.rng.next() : 0;
    else this.place(this.n / 2, this.n / 2);
  }
  kernel() {
    const n = this.n,
      radius = this.p("radius");
    this.kr.fill(0);
    this.ki.fill(0);
    let sum = 0;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        const d =
            Math.hypot(x < n / 2 ? x : x - n, y < n / 2 ? y : y - n) / radius,
          v =
            d >= 1
              ? 0
              : this.params.kernel === "polynomial"
                ? (4 * d * (1 - d)) ** 4
                : Math.exp(-0.5 * ((d - 0.5) / 0.15) ** 2);
        this.kr[y * n + x] = v;
        sum += v;
      }
    for (let i = 0; i < this.kr.length; i++) this.kr[i] /= sum;
    fft2(this.kr, this.ki, n);
  }
  update(p: Params) {
    const changed = p.radius !== undefined || p.kernel !== undefined;
    super.update(p);
    if (changed) this.kernel();
  }
  place(x: number, y: number) {
    const cells = orbium.cells,
      scale = this.p("radius") / 13,
      sz = Math.ceil(20 * scale);
    for (let j = 0; j < sz; j++)
      for (let i = 0; i < sz; i++) {
        const v =
          cells[Math.min(19, Math.floor(j / scale))][
            Math.min(19, Math.floor(i / scale))
          ];
        this.state.grid[this.index(x + i - sz / 2, y + j - sz / 2)] = v;
      }
  }
  step() {
    this.re.set(this.state.grid);
    this.im.fill(0);
    fft2(this.re, this.im, this.n);
    for (let i = 0; i < this.re.length; i++) {
      const r = this.re[i] * this.kr[i] - this.im[i] * this.ki[i];
      this.im[i] = this.re[i] * this.ki[i] + this.im[i] * this.kr[i];
      this.re[i] = r;
    }
    fft2(this.re, this.im, this.n, true);
    const mu = this.p("mu"),
      sigma = this.p("sigma"),
      dt = this.p("dt"),
      poly = this.params.kernel === "polynomial";
    for (let i = 0; i < this.re.length; i++) {
      const z = (this.re[i] - mu) / sigma,
        g = poly
          ? 2 * Math.max(0, 1 - (z * z) / 9) ** 4 - 1
          : 2 * Math.exp((-z * z) / 2) - 1;
      this.state.grid[i] = clamp(this.state.grid[i] + dt * g);
    }
    this.tick++;
  }
  frame() {
    let mass = 0,
      area = 0;
    return {
      ...this.base(),
      pixels: this.pixels((i) => {
        const a = this.state.grid[i];
        mass += a;
        if (a > 0.05) area++;
        const t = clamp(a * 1.4);
        return [12 + 148 * t, 19 + 177 * t, 22 + 173 * t];
      }),
      metrics: [
        {
          label: "Masa",
          value: Math.round(mass * 100) / 100,
          color: "#a1d8d3",
        },
        { label: "Área viva", value: area, color: "#d3e7bb" },
      ],
      note:
        mass < 0.01
          ? "El patrón se ha extinguido. Prueba Orbium o cambia los parámetros."
          : undefined,
    };
  }
  paint(p: Paint) {
    if (p.tool === "orbium") this.place(p.x, p.y);
    else
      this.brush(p, (i) => (this.state.grid[i] = p.tool === "erase" ? 0 : 0.7));
  }
}
