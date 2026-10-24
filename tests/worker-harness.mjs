import { parentPort } from "node:worker_threads";
import { tsImport } from "tsx/esm/api";
globalThis.self = {
  postMessage: (message) => parentPort.postMessage(message),
  onmessage: null,
};
parentPort.on("message", (data) => globalThis.self.onmessage?.({ data }));
await tsImport("../src/worker.ts", import.meta.url);
parentPort.postMessage({ type: "ready" });
