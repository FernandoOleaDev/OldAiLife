import test from "node:test";
import assert from "node:assert/strict";
import { Worker } from "node:worker_threads";
import { catalog } from "../src/catalog";
test("Worker real: veinte pestañas, pasos, pinceles, parámetros, pausa y restauración", async () => {
  const worker = new Worker(new URL("./worker-harness.mjs", import.meta.url));
  const messages: any[] = [];
  let wake: (() => void) | undefined;
  worker.on("message", (m) => {
    messages.push(m);
    wake?.();
  });
  async function next(type: string, id?: string): Promise<any> {
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      const error = messages.find((m) => m.type === "error");
      if (error) throw Error(error.message);
      const i = messages.findIndex(
        (m) => m.type === type && (!id || m.frame?.id === id),
      );
      if (i >= 0) return messages.splice(i, 1)[0];
      await new Promise<void>((resolve) => {
        const t = setTimeout(resolve, 30);
        wake = () => {
          clearTimeout(t);
          resolve();
        };
      });
    }
    throw Error(`No llegó ${type} de ${id}`);
  }
  try {
    await next("ready");
    const states = new Map<string, number>();
    for (const d of catalog) {
      worker.postMessage({ type: "select", id: d.id, seed: 1997, speed: 20 });
      const a = await next("frame", d.id);
      assert(a.frame.metrics.length >= 2);
      assert(a.frame.width > 0);
      worker.postMessage({ type: "step", count: 3 });
      const b = await next("frame", d.id);
      assert.equal(b.frame.tick, a.frame.tick + 3);
      states.set(d.id, b.frame.tick);
      worker.postMessage({
        type: "paint",
        paint: {
          x: d.id === "langton" ? 0 : a.frame.width / 2,
          y: d.id === "langton" ? 0 : a.frame.height / 2,
          tool: d.tools[0][0],
          radius: 0,
        },
      });
      const painted = await next("frame", d.id);
      worker.postMessage({ type: "save", action: "export" });
      const saved = await next("saved");
      assert.equal(saved.snapshot.id, d.id);
      assert.equal(saved.snapshot.tick, b.frame.tick);
      worker.postMessage({
        type: "restore",
        snapshot: JSON.parse(JSON.stringify(saved.snapshot)),
        activate: true,
      });
      await next("restored");
      const restored = await next("frame", d.id);
      assert.deepEqual(restored.frame.metrics, painted.frame.metrics);
    }
    for (const d of catalog) {
      worker.postMessage({ type: "select", id: d.id, seed: 100, speed: 20 });
      const f = await next("frame", d.id);
      assert.equal(f.frame.tick, states.get(d.id));
    }
    worker.postMessage({ type: "select", id: "lenia", seed: 1997, speed: 20 });
    await next("frame", "lenia");
    worker.postMessage({ type: "params", params: { mu: 0.16 } });
    const updated = await next("frame", "lenia");
    assert.equal(updated.params.mu, 0.16);
    worker.postMessage({ type: "run", value: true });
    const run = await next("frame", "lenia");
    assert(run.running);
    await new Promise((r) => setTimeout(r, 180));
    worker.postMessage({ type: "run", value: false });
    let paused = await next("frame", "lenia");
    while (paused.running) paused = await next("frame", "lenia");
    assert(paused.frame.tick > states.get("lenia")!);
    assert.equal(paused.running, false);
  } finally {
    await worker.terminate();
  }
});
