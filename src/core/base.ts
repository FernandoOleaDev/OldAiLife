import { Random, wrap } from "./random";
import type { Frame, Paint, Params, RGB, Snapshot } from "./types";
const arrayTypes = {
  Uint8Array,
  Uint16Array,
  Int32Array,
  Float32Array,
  Float64Array,
};
export function pack(v: any): any {
  if (ArrayBuffer.isView(v))
    return { __array: v.constructor.name, values: Array.from(v as any) };
  if (v instanceof Map) return { __map: [...v].map(([k, x]) => [k, pack(x)]) };
  if (Array.isArray(v)) return v.map(pack);
  if (v && typeof v === "object")
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, pack(x)]));
  return v;
}
export function unpack(v: any): any {
  if (!v || typeof v !== "object") return v;
  if (v.__array) {
    const T = arrayTypes[v.__array as keyof typeof arrayTypes];
    if (
      !T ||
      !Array.isArray(v.values) ||
      v.values.length > 4_000_000 ||
      v.values.some((x: any) => typeof x !== "number" || !Number.isFinite(x))
    )
      throw Error("Array de partida inválido");
    return new T(v.values);
  }
  if (v.__map) return new Map(v.__map.map(([k, x]: any) => [k, unpack(x)]));
  if (Array.isArray(v)) return v.map(unpack);
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unpack(x)]));
}
export abstract class Model {
  abstract id: string;
  tick = 0;
  rng: Random;
  state: any = {};
  n: number;
  constructor(
    public params: Params,
    public seed: number,
  ) {
    this.rng = new Random(seed);
    this.n = Number(params.size || 128);
  }
  abstract step(): void;
  abstract frame(): Frame;
  abstract paint(p: Paint): void;
  p(k: string) {
    return Number(this.params[k]);
  }
  base(): Frame {
    return {
      id: this.id,
      tick: this.tick,
      width: this.n,
      height: this.n,
      metrics: [],
    };
  }
  pixels(color: (i: number) => RGB) {
    const a = new Uint8ClampedArray(this.n * this.n * 4);
    for (let i = 0; i < this.n * this.n; i++) {
      const c = color(i);
      a[i * 4] = c[0];
      a[i * 4 + 1] = c[1];
      a[i * 4 + 2] = c[2];
      a[i * 4 + 3] = 255;
    }
    return a;
  }
  index(x: number, y: number) {
    return wrap(Math.floor(y), this.n) * this.n + wrap(Math.floor(x), this.n);
  }
  brush(p: Paint, fn: (i: number) => void) {
    for (let y = -p.radius; y <= p.radius; y++)
      for (let x = -p.radius; x <= p.radius; x++)
        if (x * x + y * y <= p.radius * p.radius)
          fn(this.index(p.x + x, p.y + y));
  }
  brushClosed(p: Paint, fn: (i: number) => void) {
    for (let dy = -p.radius; dy <= p.radius; dy++)
      for (let dx = -p.radius; dx <= p.radius; dx++) {
        const x = Math.floor(p.x + dx),
          y = Math.floor(p.y + dy);
        if (
          dx * dx + dy * dy <= p.radius * p.radius &&
          x >= 0 &&
          y >= 0 &&
          x < this.n &&
          y < this.n
        )
          fn(y * this.n + x);
      }
  }
  save(): Snapshot {
    return {
      format: "oldailife",
      version: 1,
      id: this.id,
      params: { ...this.params },
      seed: this.seed,
      tick: this.tick,
      randomState: this.rng.state,
      data: pack(this.state),
    };
  }
  restore(s: Snapshot) {
    this.tick = s.tick;
    this.rng.state = s.randomState;
    this.state = unpack(s.data);
  }
  update(params: Params) {
    this.params = { ...this.params, ...params };
  }
}
export const BG: RGB = [11, 17, 18];
export const COLORS: RGB[] = [
  [12, 18, 19],
  [192, 231, 153],
  [91, 188, 195],
  [220, 158, 91],
  [195, 127, 177],
  [136, 155, 228],
  [237, 210, 157],
  [117, 187, 132],
  [213, 106, 104],
  [224, 227, 208],
  [99, 139, 161],
  [148, 111, 177],
];
export const hex = (c: RGB) => `rgb(${c.join(",")})`;
