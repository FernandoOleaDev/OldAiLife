import { wrap } from "./random";
/** Uniform toroidal bins; each neighboring bucket is visited once, even for 1–2 bins. */
export class Spatial {
  bins: number[][];
  count: number;
  cell: number;
  constructor(
    public size: number,
    radius: number,
  ) {
    this.count = Math.max(1, Math.floor(size / radius));
    this.cell = size / this.count;
    this.bins = Array.from({ length: this.count * this.count }, () => []);
  }
  build(points: { x: number; y: number }[]) {
    this.bins.forEach((b) => (b.length = 0));
    points.forEach((p, i) =>
      this.bins[
        Math.floor(wrap(p.y, this.size) / this.cell) * this.count +
          Math.floor(wrap(p.x, this.size) / this.cell)
      ].push(i),
    );
  }
  each(x: number, y: number, fn: (index: number) => void) {
    const bx = Math.floor(wrap(x, this.size) / this.cell),
      by = Math.floor(wrap(y, this.size) / this.cell);
    const seen = new Set<number>();
    for (let j = -1; j <= 1; j++)
      for (let i = -1; i <= 1; i++) {
        const k =
          wrap(by + j, this.count) * this.count + wrap(bx + i, this.count);
        if (seen.has(k)) continue;
        seen.add(k);
        for (const idx of this.bins[k]) fn(idx);
      }
  }
}
