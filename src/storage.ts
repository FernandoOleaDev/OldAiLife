import type { Snapshot } from "./core/types";
let database: Promise<IDBDatabase>;
function db() {
  return (database ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("oldailife", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("experiments", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}
export async function saveLocal(snapshot: Snapshot) {
  const d = await db();
  await new Promise<void>((resolve, reject) => {
    const t = d.transaction("experiments", "readwrite");
    t.objectStore("experiments").put(snapshot);
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}
export async function loadLocal(): Promise<Snapshot[]> {
  const d = await db();
  return new Promise((resolve, reject) => {
    const r = d.transaction("experiments").objectStore("experiments").getAll();
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
