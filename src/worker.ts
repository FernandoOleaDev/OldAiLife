/// <reference lib="webworker" />
import { createModel, restoreModel } from "./models";
import { definition, validateParams } from "./catalog";
import type { Model } from "./core/base";
const worker = self as unknown as DedicatedWorkerGlobalScope;
const models = new Map<string, Model>();
let active = "langton",
  running = false,
  speed = 1000,
  last = performance.now(),
  carry = 0,
  lastFrame = 0,
  stepsDone = 0,
  meterTime = last,
  actualRate = 0;
function model() {
  return models.get(active)!;
}
function frame() {
  if (!model()) return;
  const f = model().frame();
  const msg = {
    type: "frame",
    frame: f,
    params: model().params,
    seed: model().seed,
    running,
    actualRate,
  };
  worker.postMessage(msg, f.pixels ? [f.pixels.buffer] : []);
  lastFrame = performance.now();
}
worker.onmessage = ({ data: d }) => {
  try {
    if (["select", "reset", "run", "speed"].includes(d.type)) {
      actualRate = 0;
      stepsDone = 0;
      meterTime = performance.now();
    }
    if (d.type === "select") {
      active = d.id;
      if (!models.has(active))
        models.set(
          active,
          createModel(active, definition(active).defaults, d.seed),
        );
      speed = d.speed;
      carry = 0;
      last = performance.now();
      frame();
    } else if (d.type === "run") {
      running = d.value;
      carry = 0;
      last = performance.now();
      frame();
    } else if (d.type === "speed") {
      speed = d.value;
      carry = 0;
    } else if (d.type === "step") {
      running = false;
      for (let i = 0; i < Math.min(10000, Math.max(1, d.count || 1)); i++)
        model().step();
      frame();
    } else if (d.type === "reset") {
      const m = createModel(active, d.params, d.seed);
      models.set(active, m);
      carry = 0;
      frame();
    } else if (d.type === "params") {
      model().update(
        validateParams(active, { ...model().params, ...d.params }),
      );
      frame();
    } else if (d.type === "paint") {
      if (!Number.isFinite(d.paint.x) || !Number.isFinite(d.paint.y))
        throw Error("Coordenada inválida");
      model().paint(d.paint);
      frame();
    } else if (d.type === "matrix") {
      if (
        active !== "particles" ||
        !Number.isInteger(d.i) ||
        !Number.isInteger(d.j) ||
        !model().state.matrix[d.i] ||
        d.j < 0 ||
        d.j >= model().state.matrix.length ||
        !Number.isFinite(d.value) ||
        Math.abs(d.value) > 1
      )
        throw Error("Matriz inválida");
      model().state.matrix[d.i][d.j] = d.value;
      frame();
    } else if (d.type === "save") {
      worker.postMessage({
        type: "saved",
        action: d.action,
        snapshot: model().save(),
      });
    } else if (d.type === "restore") {
      const m = restoreModel(d.snapshot);
      models.set(m.id, m);
      if (d.activate) {
        active = m.id;
        running = false;
        carry = 0;
        worker.postMessage({ type: "restored", id: active });
        frame();
      }
    }
  } catch (e) {
    running = false;
    worker.postMessage({
      type: "error",
      message: e instanceof Error ? e.message : String(e),
    });
  }
};
function loop() {
  const now = performance.now(),
    elapsed = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (running && model()) {
    carry = Math.min(carry + elapsed * speed, Math.max(speed * 0.2, 1));
    const start = performance.now();
    try {
      while (carry >= 1 && performance.now() - start < 12) {
        model().step();
        carry--;
        stepsDone++;
      }
    } catch (e) {
      running = false;
      worker.postMessage({
        type: "error",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }
  if (now - meterTime > 700) {
    actualRate = stepsDone / ((now - meterTime) / 1000);
    stepsDone = 0;
    meterTime = now;
  }
  if (model() && running && now - lastFrame > 40) frame();
  setTimeout(loop, 4);
}
loop();
