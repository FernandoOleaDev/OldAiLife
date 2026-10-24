import { BG, Model } from "../core/base";
import { wrap } from "../core/random";
import type { Paint, Params } from "../core/types";
interface Fish {
  id: number;
  x: number;
  y: number;
  type: number;
  age: number;
  hunger: number;
  alive: boolean;
}
export class Wator extends Model {
  id = "wator";
  constructor(p: Params, seed: number) {
    super(p, seed);
    this.state = {
      animals: [],
      occupancy: new Int32Array(this.n * this.n),
      nextId: 1,
      births: 0,
      deaths: 0,
    };
    const spots = this.rng.shuffle(
      Array.from({ length: this.n * this.n }, (_, i) => i),
    );
    let k = 0;
    for (const [type, num] of [
      [1, this.p("fish")],
      [2, this.p("sharks")],
    ])
      for (let j = 0; j < num && k < spots.length; j++) {
        const i = spots[k++];
        this.add(
          i % this.n,
          Math.floor(i / this.n),
          type,
          this.rng.int(this.p(type === 1 ? "fishBreed" : "sharkBreed")),
        );
      }
  }
  add(x: number, y: number, type: number, age = 0) {
    const s = this.state,
      i = this.index(x, y);
    if (s.occupancy[i]) return;
    const a: Fish = {
      id: s.nextId++,
      x: wrap(Math.floor(x), this.n),
      y: wrap(Math.floor(y), this.n),
      type,
      age,
      hunger: 0,
      alive: true,
    };
    s.animals.push(a);
    s.occupancy[i] = a.id;
  }
  step() {
    const s = this.state,
      animals: Fish[] = s.animals,
      order = this.rng.shuffle([...animals]),
      map = new Map(animals.map((a) => [a.id, a])),
      occ = s.occupancy;
    for (const a of order) {
      if (!a.alive) continue;
      const old = this.index(a.x, a.y),
        adj = [
          this.index(a.x + 1, a.y),
          this.index(a.x - 1, a.y),
          this.index(a.x, a.y + 1),
          this.index(a.x, a.y - 1),
        ],
        food =
          a.type === 2 ? adj.filter((i) => map.get(occ[i])?.type === 1) : [],
        empty = adj.filter((i) => !occ[i]),
        choices = food.length ? food : empty;
      let dest = old,
        ate = false;
      if (choices.length) {
        dest = choices[this.rng.int(choices.length)];
        const prey = map.get(occ[dest]);
        if (prey) {
          prey.alive = false;
          s.deaths++;
          ate = true;
        }
        occ[old] = 0;
        occ[dest] = a.id;
        a.x = dest % this.n;
        a.y = Math.floor(dest / this.n);
      }
      a.age++;
      if (a.type === 2) {
        a.hunger = ate ? 0 : a.hunger + 1;
        if (a.hunger >= this.p("starve")) {
          a.alive = false;
          occ[dest] = 0;
          s.deaths++;
          continue;
        }
      }
      if (
        dest !== old &&
        a.age >= this.p(a.type === 1 ? "fishBreed" : "sharkBreed")
      ) {
        a.age = 0;
        this.add(old % this.n, Math.floor(old / this.n), a.type);
        const child = s.animals[s.animals.length - 1];
        map.set(child.id, child);
        s.births++;
      }
    }
    s.animals = s.animals.filter((a: Fish) => a.alive);
    this.tick++;
  }
  frame() {
    const s = this.state;
    let fish = 0,
      sharks = 0;
    const grid = new Uint8Array(this.n * this.n);
    for (const a of s.animals) {
      grid[this.index(a.x, a.y)] = a.type;
      if (a.type === 1) fish++;
      else sharks++;
    }
    return {
      ...this.base(),
      pixels: this.pixels((i) =>
        grid[i] === 1 ? [93, 198, 199] : grid[i] === 2 ? [237, 145, 108] : BG,
      ),
      metrics: [
        { label: "Peces", value: fish, color: "#5dc6c7" },
        { label: "Tiburones", value: sharks, color: "#ed916c" },
        { label: "Nacimientos", value: s.births, color: "#c0e799" },
      ],
      note: !fish
        ? "Peces extinguidos. Puedes introducir nuevos individuos."
        : !sharks
          ? "No quedan tiburones. El océano continúa."
          : undefined,
    };
  }
  paint(p: Paint) {
    const s = this.state;
    if (p.tool === "erase") {
      this.brush(p, (i) => {
        const id = s.occupancy[i];
        s.animals = s.animals.filter((a: Fish) => a.id !== id);
        s.occupancy[i] = 0;
      });
    } else
      this.brush(p, (i) =>
        this.add(
          i % this.n,
          Math.floor(i / this.n),
          p.tool === "predator" ? 2 : 1,
        ),
      );
  }
}
interface Animal {
  x: number;
  y: number;
  angle: number;
  energy: number;
  type: number;
  alive: boolean;
}
export class Ecosystem extends Model {
  id = "ecosystem";
  constructor(p: Params, seed: number) {
    super(p, seed);
    const grass = new Uint16Array(this.n * this.n);
    for (let i = 0; i < grass.length; i++)
      grass[i] = this.rng.next() < 0.5 ? 0 : this.rng.int(this.p("regrow")) + 1;
    this.state = { grass, animals: [], births: 0, deaths: 0 };
    for (const [type, num] of [
      [1, this.p("sheep")],
      [2, this.p("wolves")],
    ])
      for (let i = 0; i < num; i++)
        this.add(this.rng.next() * this.n, this.rng.next() * this.n, type);
  }
  add(x: number, y: number, type: number) {
    this.state.animals.push({
      x: wrap(x, this.n),
      y: wrap(y, this.n),
      angle: this.rng.next() * Math.PI * 2,
      energy:
        1 + this.rng.next() * 2 * this.p(type === 1 ? "sheepFood" : "wolfFood"),
      type,
      alive: true,
    });
  }
  step() {
    const s = this.state,
      animals: Animal[] = s.animals;
    if (animals.length > 20000)
      throw Error(
        "Límite de 20.000 animales. Reduce la reproducción o reinicia.",
      );
    for (let i = 0; i < s.grass.length; i++) if (s.grass[i]) s.grass[i]--;
    const babies: Animal[] = [];
    const advance = (a: Animal) => {
      a.angle += ((this.rng.next() - 0.5) * Math.PI) / 1.5;
      a.x = wrap(a.x + Math.cos(a.angle), this.n);
      a.y = wrap(a.y + Math.sin(a.angle), this.n);
      a.energy--;
    };
    const finish = (a: Animal) => {
      if (a.energy <= 0) {
        a.alive = false;
        s.deaths++;
        return;
      }
      if (
        this.rng.next() <
        this.p(a.type === 1 ? "sheepBirth" : "wolfBirth") / 100
      ) {
        a.energy /= 2;
        babies.push({ ...a, angle: this.rng.next() * Math.PI * 2 });
        s.births++;
      }
    };
    for (const a of this.rng.shuffle(animals.filter((a) => a.type === 1))) {
      advance(a);
      const i = this.index(a.x, a.y);
      if (s.grass[i] === 0) {
        a.energy += this.p("sheepFood");
        s.grass[i] = this.p("regrow");
      }
      finish(a);
    }
    const sheepMap = new Map<number, Animal[]>();
    for (const a of animals)
      if (a.type === 1 && a.alive) {
        const i = this.index(a.x, a.y);
        if (!sheepMap.has(i)) sheepMap.set(i, []);
        sheepMap.get(i)!.push(a);
      }
    for (const a of this.rng.shuffle(animals.filter((a) => a.type === 2))) {
      advance(a);
      const candidates = sheepMap.get(this.index(a.x, a.y));
      if (candidates?.length) {
        const victim = candidates.splice(this.rng.int(candidates.length), 1)[0];
        victim.alive = false;
        s.deaths++;
        a.energy += this.p("wolfFood");
      }
      finish(a);
    }
    s.animals = animals.filter((a) => a.alive).concat(babies);
    this.tick++;
  }
  frame() {
    const s = this.state;
    let sheep = 0,
      wolves = 0,
      grass = 0;
    const pixels = this.pixels((i) => {
      if (!s.grass[i]) {
        grass++;
        return [33, 61, 43];
      }
      return [19, 30, 25];
    });
    const points = s.animals.map((a: Animal) => {
      if (a.type === 1) sheep++;
      else wolves++;
      return {
        x: a.x,
        y: a.y,
        angle: a.angle,
        color: a.type === 1 ? "#e5e6bb" : "#f7a377",
        shape: a.type === 1 ? ("dot" as const) : ("triangle" as const),
        size: a.type === 1 ? 0.6 : 0.85,
      };
    });
    return {
      ...this.base(),
      pixels,
      points,
      metrics: [
        { label: "Ovejas", value: sheep, color: "#e5e6bb" },
        { label: "Lobos", value: wolves, color: "#f7a377" },
        { label: "Hierba", value: grass, color: "#729466" },
      ],
      note: !wolves
        ? "Lobos extinguidos. Prueba a introducir uno."
        : !sheep
          ? "Ovejas extinguidas. Los lobos agotarán su energía."
          : undefined,
    };
  }
  paint(p: Paint) {
    if (p.tool === "grass")
      this.brush(p, (i) => {
        this.state.grass[i] = 0;
      });
    else if (p.tool === "erase")
      this.state.animals = this.state.animals.filter(
        (a: Animal) => Math.hypot(a.x - p.x, a.y - p.y) > p.radius + 1,
      );
    else this.add(p.x, p.y, p.tool === "predator" ? 2 : 1);
  }
}
