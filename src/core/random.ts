export class Random {
  state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  next() {
    let t = (this.state = (this.state + 0x6d2b79f5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n: number) {
    return Math.floor(this.next() * n);
  }
  shuffle<T>(a: T[]) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
export const wrap = (x: number, n: number) => ((x % n) + n) % n;
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const delta = (d: number, n: number) =>
  d > n / 2 ? d - n : d < -n / 2 ? d + n : d;
