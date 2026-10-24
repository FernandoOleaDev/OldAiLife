import "./style.css";
import { catalog, definition, validateParams } from "./catalog";
import { Renderer, drawChart, type Sample } from "./render";
import { loadLocal, saveLocal } from "./storage";
import type { Frame, Params, Snapshot } from "./core/types";
const app = document.querySelector<HTMLDivElement>("#app")!;
const icon = `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 4h6v6H4zm18 0h6v6h-6zM10 10h12v6H10zM4 16h24v6H4zm0 6h6v6H4zm18 0h6v6h-6z"/></svg>`;
app.innerHTML = `
<header class="topbar"><a class="brand" href="#langton" aria-label="OldAiLife, inicio">${icon}<span>oldai<span class="brand-dot">.</span>life<small>ARTIFICIAL LIFE LAB</small></span></a><div class="top-meta">SOFTWARE PARA OBSERVAR LO IMPREDECIBLE<span>EDICIÓN LOCAL / VOL. 01</span></div><div class="top-actions"><span class="local-badge"><i></i> LOCAL</span><button id="help" class="icon-button" title="Ayuda y atajos">? <span>Guía</span></button><button id="crt" class="icon-button" aria-pressed="false" title="Activar textura de monitor">▤ <span>CRT</span></button></div></header>
<main><section class="intro"><div><div class="eyebrow"><span class="tiny-cross">✳</span> UN ARCHIVO VIVO DE SISTEMAS EMERGENTES</div><h1>Pequeñas reglas.<br class="mobile-break"> <em>Mundos inesperados.</em></h1><p>Elige un mundo, cambia las reglas y deja que el tiempo haga el resto.</p></div><div class="intro-count"><strong>${catalog.length}</strong><span>MODELOS<br>PARA EXPLORAR</span><span class="orbit">⊕</span></div></section>
<div class="catalog-filter" role="group" aria-label="Filtrar por familia"><span class="section-label">EXPLORAR</span>${["TODOS", ...new Set(catalog.map((d) => d.category))].map((c) => `<button data-category="${c}" aria-pressed="${c === "TODOS"}">${c === "TODOS" ? "Todos" : c.charAt(0) + c.slice(1).toLocaleLowerCase("es")} <small>${c === "TODOS" ? catalog.length : catalog.filter((d) => d.category === c).length}</small></button>`).join("")}</div>
<nav class="tabs" role="tablist" aria-label="Modelos de vida artificial">${catalog.map((d, i) => `<button class="tab" id="tab-${d.id}" role="tab" data-id="${d.id}" aria-controls="experiment" aria-selected="false"><span class="tab-index">${String(i + 1).padStart(2, "0")}</span><span>${d.short}</span><i></i></button>`).join("")}</nav>
<section id="experiment" role="tabpanel" class="experiment"><div class="experiment-heading"><div class="experiment-title"><span id="model-symbol"></span><div><div class="eyebrow" id="model-category"></div><h2 id="model-name"></h2></div></div><p id="model-description"></p><div class="run-status"><i></i><span id="run-state">PREPARANDO</span><small id="step-count">PASO 0</small></div></div>
<div class="workspace"><section class="monitor"><div class="monitor-bar"><span><i class="screen-led"></i> VISTA DEL MUNDO</span><div><button id="grid" class="mini-button" aria-pressed="false" title="Mostrar cuadrícula">▦</button><button id="zoom-out" class="mini-button" title="Alejar">−</button><span id="zoom-label">100%</span><button id="zoom-in" class="mini-button" title="Acercar">+</button><button id="fit" class="mini-button" title="Ajustar vista">Ajustar</button><button id="fullscreen" class="mini-button" title="Pantalla completa">⛶</button></div></div><div class="viewport" id="viewport"><canvas id="world" tabindex="0" aria-label="Mundo de la simulación. Usa los controles para elegir un pincel y haz clic para intervenir."></canvas><div class="view-label" id="view-label">CAM 01 / PLANO ABIERTO</div><div class="view-corner">+<span>+</span></div><div id="legend" class="world-legend"></div><div id="loading" class="loading">INICIALIZANDO MUNDO<span>Calculando condiciones iniciales…</span></div><div id="world-note" class="world-note" hidden></div></div>
<div class="drawing-bar"><span class="section-label">INTERVENIR</span><div id="tools" role="group" aria-label="Herramientas de dibujo"></div><label class="brush-label">Pincel <input id="brush" type="range" min="0" max="10" value="0" aria-label="Radio del pincel"><output id="brush-value">1</output></label><span class="pan-hint">⇧ + arrastrar: mover</span></div>
<div class="transport"><button id="play" class="play-button">▶ <span>Iniciar</span></button><button id="step" class="square-button" title="Avanzar un paso (N)">▸│</button><button id="restart" class="square-button" title="Reiniciar con los mismos parámetros (R)">↺</button><span class="transport-divider"></span><label class="speed-label" for="speed">VELOCIDAD</label><input id="speed" type="range" min="0" max="4" step=".05" value="3"><output id="speed-value">1.000 pasos/s</output><span class="actual-speed" id="actual-speed">0 pasos/s reales</span></div>
<div class="telemetry"><div class="telemetry-title"><span class="section-label">TELEMETRÍA</span><span>ÚLTIMAS 240 MUESTRAS / PASOS →</span></div><div class="telemetry-body"><div id="metrics" class="metrics"></div><canvas id="chart" aria-label="Evolución de las dos primeras métricas"></canvas></div></div></section>
<aside class="settings"><div class="panel-heading"><span class="section-label">CONFIGURACIÓN</span><span class="panel-code">CTRL / 01</span></div><div class="preset-section"><label for="preset">Punto de partida</label><select id="preset"></select></div><div id="controls" class="controls"></div><div id="pending" class="pending" hidden><span>Hay cambios de inicio pendientes.</span><button id="apply">Aplicar y reiniciar ↵</button></div><div id="matrix-section" class="matrix-section" hidden><span class="section-label">MATRIZ DE INTERACCIÓN</span><p>Fila → columna · −1 repele / +1 atrae</p><div id="matrix"></div></div><div class="seed-section"><label for="seed">Semilla aleatoria <span>REPRODUCIBLE</span></label><div><input id="seed" type="number" min="0" max="4294967295" value="1997"><button id="new-seed" class="square-button" title="Nueva semilla y reiniciar">⚄</button></div></div><div class="file-actions"><button id="save">↓ Guardar aquí</button><button id="export">↗ Exportar JSON</button><button id="import">↙ Importar JSON</button><button id="capture">▧ Captura PNG</button></div><p class="save-note" id="save-note">Autoguardado local cada 20 segundos.</p><input id="file" type="file" accept="application/json,.json" hidden></aside></div>
<div class="field-notes"><section><div class="note-heading"><span class="section-label">01 / REGLAS DEL MUNDO</span><span id="author"></span></div><p id="rule"></p></section><section><div class="note-heading"><span class="section-label">02 / CUADERNO DE LABORATORIO</span><button id="details-toggle" aria-expanded="false">Ver detalles ↗</button></div><p id="observation"></p><div id="model-details" hidden><p id="variant"></p><div id="sources" class="sources"></div></div></section></div></section>
<footer><span>oldai.life <span class="footer-dim">/ REGLAS SIMPLES, COMPORTAMIENTOS COMPLEJOS.</span></span><span>TODO OCURRE EN TU NAVEGADOR <i></i></span></footer></main>
<div id="toast" role="status" aria-live="polite"></div>
<dialog id="guide"><button id="close-guide" class="dialog-close" aria-label="Cerrar guía">×</button><span class="eyebrow">MANUAL DE CAMPO / 01</span><h2>Bienvenido al laboratorio.</h2><p>${catalog.length} simulaciones independientes. Usa los filtros para explorar por familias. Cada pestaña conserva su mundo mientras exploras otra; solo avanza la pestaña activa.</p><ol><li><strong>Elige un punto de partida.</strong> Los ejemplos precalculados muestran el número real de pasos avanzados.</li><li><strong>Observa o intervén.</strong> Elige un pincel y pinta. Radio 1 coloca un individuo o una casilla. Mayúsculas + arrastrar desplaza la vista.</li><li><strong>Cambia las reglas.</strong> Los controles «EN VIVO» actúan en el siguiente paso. Los de «INICIO» se aplican con el botón de reiniciar.</li><li><strong>Conserva el descubrimiento.</strong> Guardar aquí usa este navegador. Exportar JSON permite continuar en otro equipo, con el estado completo.</li></ol><div class="shortcuts"><span><kbd>Espacio</kbd> Pausa</span><span><kbd>N</kbd> Un paso</span><span><kbd>R</kbd> Reiniciar</span><span><kbd>F</kbd> Ajustar</span></div><p class="guide-foot">Acelerar calcula más pasos sin cambiar las reglas. La velocidad alcanzada depende del modelo y del equipo. El ordenador suspendido no continúa la simulación.</p></dialog>`;
document
  .querySelector(".monitor")!
  .prepend(document.querySelector(".transport")!);
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});
const renderer = new Renderer($("#world"));
const chart = $<HTMLCanvasElement>("#chart");
let active = catalog.some((d) => d.id === location.hash.slice(1))
    ? location.hash.slice(1)
    : "langton",
  running = false,
  tool = "paint",
  currentParams: Params = {},
  draft: Params = {},
  pending = false,
  seed = 1997,
  speed = 1000,
  latestFrame: Frame | undefined,
  pressed = false,
  pan = false,
  seedEdited = false,
  lastPointer = { x: 0, y: 0 },
  toastTimer = 0;
const histories = new Map<string, Sample[]>(),
  rates = new Map<string, number>();
const nf = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 });
function send(type: string, payload: Record<string, unknown> = {}) {
  worker.postMessage({ type, ...payload });
}
function toast(message: string) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(
    () => $("#toast").classList.remove("visible"),
    4500,
  );
}
function setRunning(value: boolean) {
  running = value;
  $("#play").innerHTML = value
    ? "Ⅱ <span>Pausar</span>"
    : "▶ <span>Iniciar</span>";
  $("#run-state").textContent = value ? "EN MARCHA" : "EN PAUSA";
  $(".run-status").classList.toggle("is-running", value);
}
let category = "TODOS";
function filterModels(value: string) {
  category = value;
  document
    .querySelectorAll<HTMLButtonElement>("[data-category]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.category === value)),
    );
  document
    .querySelectorAll<HTMLButtonElement>(".tab")
    .forEach(
      (b) =>
        (b.hidden =
          value !== "TODOS" && definition(b.dataset.id!).category !== value),
    );
}
function renderDefinition(id: string) {
  const d = definition(id);
  if (category !== "TODOS" && category !== d.category) filterModels("TODOS");
  document.documentElement.style.setProperty("--accent", d.accent);
  document.title = `${d.short} · OldAiLife`;
  $("#experiment").setAttribute("aria-labelledby", `tab-${id}`);
  document.querySelectorAll<HTMLButtonElement>(".tab").forEach((b) => {
    const on = b.dataset.id === id;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", String(on));
    b.tabIndex = on ? 0 : -1;
  });
  $("#model-symbol").textContent = d.symbol;
  $("#model-category").textContent = `${d.category} / ${d.year}`;
  $("#model-name").textContent = d.name;
  $("#model-description").textContent = d.description;
  $("#legend").innerHTML = d.legend
    .map(
      ([color, label]) =>
        `<span><i style="background:${color}"></i>${label}</span>`,
    )
    .join("");
  $("#author").textContent = d.author;
  $("#rule").textContent = d.rule;
  $("#variant").textContent = d.variant;
  $("#sources").innerHTML = d.sources
    .map(
      ([title, url]) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`,
    )
    .join("");
  $("#observation").textContent =
    d.id === "langton"
      ? "Prueba a cambiar un giro de la secuencia. Una decisión local puede transformar por completo el dibujo."
      : d.id === "wator" || d.id === "ecosystem"
        ? "La coexistencia no está garantizada. Introduce un depredador, cambia la reproducción y observa las poblaciones."
        : d.id === "lenia"
          ? "Orbium es un patrón del catálogo de Bert Chan. Muévete despacio por los parámetros: la supervivencia tiene un intervalo estrecho."
          : d.id === "particles"
            ? "Prueba a hacer que el tipo 1 persiga al 2, y que el 2 evite al 1. La matriz no tiene por qué ser simétrica."
            : "Cambia una regla cada vez. Conserva la semilla para poder comparar el antes y el después.";
  $(".brush-label").hidden = id === "lsystem";
  $("#tools").innerHTML = d.tools
    .map(
      ([value, label], i) =>
        `<button data-tool="${value}" class="tool ${i === 0 ? "selected" : ""}" aria-pressed="${i === 0}">${label}</button>`,
    )
    .join("");
  tool = d.tools[0][0];
  $("#preset").innerHTML =
    d.presets
      .map((p, i) => `<option value="${i}">${p.name}</option>`)
      .join("") +
    '<option value="custom" disabled>Configuración personalizada</option>';
  currentParams = { ...d.defaults };
  draft = { ...currentParams };
  pending = false;
  $("#pending").hidden = true;
  $("#controls").innerHTML = d.controls
    .map((c) => {
      const value = d.defaults[c.key],
        tag = `<span class="param-mode">${c.rebuild ? "INICIO" : "EN VIVO"}</span>`;
      const input =
        c.type === "select"
          ? `<select id="param-${c.key}" data-param="${c.key}">${c.options!.map(([v, l]) => `<option value="${v}" ${String(value) === v ? "selected" : ""}>${l}</option>`).join("")}</select>`
          : c.type === "text"
            ? `<input id="param-${c.key}" data-param="${c.key}" class="rule-input" value="${value}" autocomplete="off" spellcheck="false" maxlength="${id === "lsystem" ? 160 : 12}">`
            : `<div class="range-row"><input id="param-${c.key}" data-param="${c.key}" type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${value}"><input class="number-value" id="output-${c.key}" data-param="${c.key}" type="number" min="${c.min}" max="${c.max}" step="${c.step}" value="${value}" aria-label="Valor de ${c.label}"></div>`;
      return `<div class="param"><label for="param-${c.key}">${c.label}${tag}</label>${input}${c.hint ? `<small>${c.hint}</small>` : ""}</div>`;
    })
    .join("");
  $("#matrix-section").hidden = id !== "particles";
  $("#matrix").innerHTML = "";
  $("#loading").hidden = false;
  $("#world-note").hidden = true;
  renderer.fit();
  $("#zoom-label").textContent = "100%";
  seedEdited = false;
  latestFrame = undefined;
  $("#metrics").innerHTML = "";
  drawChart(chart, histories.get(id) || []);
  setSpeed(rates.get(id) || d.rate);
}
function setSpeed(value: number) {
  speed = value;
  rates.set(active, value);
  $<HTMLInputElement>("#speed").value = String(Math.log10(value));
  $("#speed-value").textContent = `${nf.format(value)} pasos/s`;
  send("speed", { value });
}
function syncControls(params: Params) {
  const d = definition(active),
    presetIndex = d.presets.findIndex((p) => {
      const target = { ...d.defaults, ...p.params };
      return Object.keys(target).every((k) => target[k] === params[k]);
    });
  if (document.activeElement !== $("#preset"))
    $<HTMLSelectElement>("#preset").value =
      presetIndex < 0 ? "custom" : String(presetIndex);
  currentParams = { ...params };
  if (!pending) draft = { ...params };
  for (const [key, value] of Object.entries(params)) {
    const input = $<HTMLInputElement>(`#param-${key}`);
    const out = $<HTMLInputElement>(`#output-${key}`);
    if (
      input &&
      !pending &&
      document.activeElement !== input &&
      document.activeElement !== out
    ) {
      input.value = String(value);
      if (out) out.value = String(value);
    }
  }
}
function selectModel(id: string) {
  if (id === active && latestFrame) return;
  send("save", { action: "auto" });
  active = id;
  history.replaceState(null, "", `#${id}`);
  renderDefinition(id);
  send("select", { id, seed, speed });
}
function reset(params: Params = draft) {
  try {
    const p = validateParams(active, params),
      inputSeed = Number($<HTMLInputElement>("#seed").value);
    if (!Number.isInteger(inputSeed) || inputSeed < 0 || inputSeed > 4294967295)
      throw Error("La semilla debe ser un entero entre 0 y 4294967295.");
    seed = inputSeed;
    seedEdited = false;
    pending = false;
    $("#pending").hidden = true;
    $("#loading").hidden = false;
    histories.delete(active);
    send("reset", { params: p, seed });
  } catch (e) {
    toast((e as Error).message);
  }
}
worker.onmessage = async ({ data: d }) => {
  if (d.type === "error") {
    setRunning(false);
    $("#loading").hidden = true;
    toast(d.message);
    return;
  }
  if (d.type === "restored") {
    active = d.id;
    history.replaceState(null, "", `#${active}`);
    renderDefinition(active);
    histories.delete(active);
    toast("Partida importada. Puedes continuar desde este paso.");
    return;
  }
  if (d.type === "saved") {
    const s = d.snapshot as Snapshot;
    if (d.action === "export") {
      download(
        JSON.stringify(s),
        `oldailife-${s.id}-${s.tick}.json`,
        "application/json",
      );
      toast("Partida completa exportada.");
    } else
      try {
        await saveLocal(s);
        $("#save-note").textContent =
          `Guardado local · ${new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
        if (d.action === "manual") toast("Partida guardada en este navegador.");
      } catch {
        if (d.action === "manual")
          toast("No se pudo guardar. Puedes exportar la partida a JSON.");
        $("#save-note").textContent =
          "Guardado local no disponible. Usa Exportar JSON.";
      }
    return;
  }
  if (d.type !== "frame" || d.frame.id !== active) return;
  const f = d.frame as Frame;
  latestFrame = f;
  $("#loading").hidden = true;
  setRunning(d.running);
  syncControls(d.params);
  seed = d.seed;
  if (document.activeElement !== $("#seed") && !seedEdited)
    $<HTMLInputElement>("#seed").value = String(seed);
  renderer.set(f);
  $("#step-count").textContent = `PASO ${nf.format(f.tick)}`;
  $("#actual-speed").textContent =
    `${nf.format(d.running ? Math.round(d.actualRate) : 0)} pasos/s reales`;
  $("#view-label").textContent =
    `CAM ${String(catalog.findIndex((x) => x.id === active) + 1).padStart(2, "0")} / ${f.width} × ${f.height}${active === "langton" ? " / " + (d.params.topology === "plane" ? "PLANO ABIERTO" : "TORO") : ""}`;
  $("#world-note").hidden = !f.note;
  $("#world-note").textContent = f.note || "";
  const metricsHTML = f.metrics
    .map(
      (m) =>
        `<div class="metric"><span><i style="background:${m.color}"></i>${m.label}</span><strong>${nf.format(m.value)}</strong></div>`,
    )
    .join("");
  $("#metrics").innerHTML = metricsHTML;
  let samples = histories.get(active) || [];
  if (samples.length && f.tick < samples.at(-1)!.tick) samples = [];
  if (!samples.length || f.tick > samples.at(-1)!.tick) {
    samples.push({ tick: f.tick, metrics: f.metrics });
    if (samples.length > 240) samples.shift();
    histories.set(active, samples);
  }
  drawChart(chart, samples);
  const matrix = (f as Frame & { matrix?: number[][] }).matrix;
  if (matrix && $("#matrix").childElementCount !== matrix.length ** 2) {
    const box = $("#matrix");
    box.style.gridTemplateColumns = `repeat(${matrix.length},1fr)`;
    box.innerHTML = matrix
      .flatMap((row, i) =>
        row.map(
          (v, j) =>
            `<input type="number" min="-1" max="1" step=".1" value="${v.toFixed(1)}" data-row="${i}" data-col="${j}" aria-label="Fuerza tipo ${i + 1} hacia tipo ${j + 1}" title="Tipo ${i + 1} → tipo ${j + 1}">`,
        ),
      )
      .join("");
  } else if (matrix)
    document
      .querySelectorAll<HTMLInputElement>("#matrix input")
      .forEach((input) => {
        if (document.activeElement !== input)
          input.value =
            matrix[Number(input.dataset.row)][
              Number(input.dataset.col)
            ].toFixed(1);
      });
};
worker.onerror = () => {
  setRunning(false);
  toast("El motor se ha detenido. Recarga para restaurar el último guardado.");
};
function download(content: BlobPart, name: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime })),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
$(".catalog-filter").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-category]",
  );
  if (!b) return;
  const value = b.dataset.category!;
  filterModels(value);
  if (value !== "TODOS" && definition(active).category !== value)
    selectModel(catalog.find((d) => d.category === value)!.id);
});
$(".tabs").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-id]");
  if (b) selectModel(b.dataset.id!);
});
$(".tabs").addEventListener("keydown", (e) => {
  const k = e as KeyboardEvent;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(k.key)) return;
  k.preventDefault();
  const visible = catalog.filter(
    (d) => category === "TODOS" || d.category === category,
  );
  const i = visible.findIndex((d) => d.id === active),
    next =
      k.key === "Home"
        ? 0
        : k.key === "End"
          ? visible.length - 1
          : (i + (k.key === "ArrowRight" ? 1 : -1) + visible.length) %
            visible.length;
  selectModel(visible[next].id);
  $(`#tab-${active}`).focus();
});
window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  if (catalog.some((d) => d.id === id)) selectModel(id);
});
$("#play").onclick = () => {
  setRunning(!running);
  send("run", { value: running });
};
$("#step").onclick = () => send("step", { count: 1 });
$("#restart").onclick = () => reset(currentParams);
$("#apply").onclick = () => reset();
$("#new-seed").onclick = () => {
  $<HTMLInputElement>("#seed").value = String(
    crypto.getRandomValues(new Uint32Array(1))[0],
  );
  reset();
};
$("#seed").oninput = () => {
  seedEdited = true;
  pending = true;
  $("#pending").hidden = false;
};
$("#preset").onchange = () => {
  const d = definition(active),
    p = d.presets[Number($<HTMLSelectElement>("#preset").value)];
  draft = { ...d.defaults, ...p.params };
  reset(draft);
  $("#matrix").innerHTML = "";
};
$("#controls").addEventListener("input", (e) => {
  const input = e.target as HTMLInputElement,
    key = input.dataset.param;
  if (!key) return;
  const out = $(`#output-${key}`);
  if (out && input.type === "range")
    (out as HTMLInputElement).value = input.value;
});
$("#controls").addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement,
    key = input.dataset.param;
  if (!key) return;
  const c = definition(active).controls.find((c) => c.key === key)!;
  const value =
    typeof currentParams[key] === "number" ? Number(input.value) : input.value;
  try {
    const v = validateParams(active, { ...draft, [key]: value });
    draft = v;
    if (c.rebuild) {
      pending = true;
      $("#pending").hidden = false;
    } else send("params", { params: { [key]: v[key] } });
  } catch (e) {
    input.value = String(currentParams[key]);
    toast((e as Error).message);
  }
});
$("#matrix").addEventListener("change", (e) => {
  const input = e.target as HTMLInputElement;
  send("matrix", {
    i: Number(input.dataset.row),
    j: Number(input.dataset.col),
    value: Number(input.value),
  });
});
$("#speed").oninput = () =>
  setSpeed(Math.round(10 ** Number($<HTMLInputElement>("#speed").value)));
$("#brush").oninput = () =>
  ($("#brush-value").textContent = String(
    Number($<HTMLInputElement>("#brush").value) * 2 + 1,
  ));
$("#tools").onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-tool]");
  if (!b) return;
  tool = b.dataset.tool!;
  if (active === "lsystem")
    send("paint", { paint: { x: 0, y: 0, radius: 0, tool } });
  document.querySelectorAll<HTMLButtonElement>("[data-tool]").forEach((x) => {
    x.classList.toggle("selected", x === b);
    x.setAttribute("aria-pressed", String(x === b));
  });
};
function zoom(factor: number) {
  renderer.zoom = Math.min(12, Math.max(0.3, renderer.zoom * factor));
  renderer.draw();
  $("#zoom-label").textContent = `${Math.round(renderer.zoom * 100)}%`;
}
$("#zoom-in").onclick = () => zoom(1.25);
$("#zoom-out").onclick = () => zoom(0.8);
$("#fit").onclick = () => {
  renderer.fit();
  $("#zoom-label").textContent = "100%";
};
$("#grid").onclick = () => {
  renderer.grid = !renderer.grid;
  $("#grid").setAttribute("aria-pressed", String(renderer.grid));
  renderer.draw();
};
$("#fullscreen").onclick = async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $("#viewport").requestFullscreen();
  } catch {
    toast("La pantalla completa no está disponible en este navegador.");
  }
};
const canvas = $<HTMLCanvasElement>("#world");
function paint(e: PointerEvent) {
  const p = renderer.position(e.clientX, e.clientY);
  if (p)
    send("paint", {
      paint: {
        ...p,
        tool,
        radius: Number($<HTMLInputElement>("#brush").value),
      },
    });
}
canvas.onpointerdown = (e) => {
  canvas.setPointerCapture(e.pointerId);
  pressed = true;
  pan = e.shiftKey || e.button === 1;
  lastPointer = { x: e.clientX, y: e.clientY };
  if (!pan) paint(e);
};
canvas.onpointermove = (e) => {
  if (!pressed) return;
  if (pan) {
    renderer.panX += e.clientX - lastPointer.x;
    renderer.panY += e.clientY - lastPointer.y;
    renderer.draw();
  } else if (
    Math.hypot(e.clientX - lastPointer.x, e.clientY - lastPointer.y) > 3
  )
    paint(e);
  lastPointer = { x: e.clientX, y: e.clientY };
};
canvas.onpointerup = canvas.onpointercancel = () => (pressed = false);
canvas.oncontextmenu = (e) => e.preventDefault();
canvas.addEventListener(
  "wheel",
  (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoom(e.deltaY > 0 ? 0.9 : 1.1);
  },
  { passive: false },
);
$("#save").onclick = () => send("save", { action: "manual" });
$("#export").onclick = () => send("save", { action: "export" });
$("#import").onclick = () => $("#file").click();
$("#file").onchange = async () => {
  const input = $<HTMLInputElement>("#file"),
    f = input.files?.[0];
  if (!f) return;
  try {
    if (f.size > 30_000_000)
      throw Error("El archivo supera el límite de 30 MB.");
    const snapshot = JSON.parse(await f.text());
    send("restore", { snapshot, activate: true });
  } catch (e) {
    toast(`No se pudo importar: ${(e as Error).message}`);
  }
  input.value = "";
};
$("#capture").onclick = () => {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `oldailife-${active}-${latestFrame?.tick || 0}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast("Captura PNG guardada.");
    }
  });
};
$("#details-toggle").onclick = () => {
  const hidden = !$("#model-details").hidden;
  $("#model-details").hidden = hidden;
  $("#details-toggle").setAttribute("aria-expanded", String(!hidden));
  $("#details-toggle").textContent = hidden
    ? "Ver detalles ↗"
    : "Cerrar detalles ↙";
};
$("#help").onclick = () => $<HTMLDialogElement>("#guide").showModal();
$("#close-guide").onclick = () => $<HTMLDialogElement>("#guide").close();
$("#guide").onclick = (e) => {
  if (e.target === $("#guide")) $<HTMLDialogElement>("#guide").close();
};
$("#crt").onclick = () => {
  const on = document.body.classList.toggle("crt");
  $("#crt").setAttribute("aria-pressed", String(on));
};
window.addEventListener("keydown", (e) => {
  if (
    ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
      (e.target as HTMLElement).tagName,
    ) ||
    $<HTMLDialogElement>("#guide").open
  )
    return;
  if (e.code === "Space") {
    e.preventDefault();
    $("#play").click();
  }
  if (e.key.toLowerCase() === "n") $("#step").click();
  if (e.key.toLowerCase() === "r") $("#restart").click();
  if (e.key.toLowerCase() === "f") $("#fit").click();
});
new ResizeObserver(() => drawChart(chart, histories.get(active) || [])).observe(
  chart,
);
setInterval(() => {
  if (latestFrame) send("save", { action: "auto" });
}, 20000);
renderDefinition(active);
(async () => {
  try {
    const saved = await loadLocal();
    for (const snapshot of saved)
      send("restore", { snapshot, activate: false });
  } catch {
    $("#save-note").textContent =
      "Guardado local no disponible. Exporta para conservar.";
  }
  send("select", { id: active, seed, speed });
  send("run", { value: true });
})();
