import type { Definition, Param, Params } from "./core/types";
import { extraCatalog } from "./catalog-extra";
const range = (
  key: string,
  label: string,
  min: number,
  max: number,
  step = 1,
  rebuild = false,
): Param => ({ key, label, min, max, step, rebuild });
const select = (
  key: string,
  label: string,
  options: [string, string][],
  rebuild = true,
): Param => ({ key, label, type: "select", options, rebuild });
const size = select("size", "Tamaño del mundo", [
  ["64", "64 × 64"],
  ["128", "128 × 128"],
  ["192", "192 × 192"],
  ["256", "256 × 256"],
]);
export const catalog: Definition[] = [
  {
    id: "langton",
    name: "Hormiga de Langton",
    short: "Langton",
    category: "AUTÓMATAS",
    year: "1986",
    author: "Christopher Langton",
    accent: "#c0dc92",
    symbol: "⌘",
    description:
      "Una hormiga. Dos instrucciones. Un universo de caminos inesperados.",
    rule: "Lee el color, gira a izquierda (L) o derecha (R), pasa al siguiente color y avanza una casilla. El orden de la secuencia define los colores.",
    variant:
      "Plano abierto con encuadre automático o toro finito. Varias hormigas actúan por orden de creación. El ejemplo Autopista empieza en el paso 11.000; Desde cero permite observar cada movimiento.",
    sources: [
      [
        "Langton y turmites · artículo académico",
        "https://www.mat-unab.cl/~hellouin/Articles/Turmites.pdf",
      ],
    ],
    defaults: {
      size: 256,
      rule: "RL",
      ants: 1,
      topology: "plane",
      heading: 0,
      warmup: 11000,
    },
    controls: [
      {
        key: "rule",
        label: "Secuencia de giros",
        type: "text",
        rebuild: true,
        hint: "Entre 2 y 12 letras L / R; una por color.",
      },
      range("ants", "Hormigas iniciales", 1, 20, 1, true),
      select("heading", "Orientación inicial", [
        ["0", "Norte ↑"],
        ["1", "Este →"],
        ["2", "Sur ↓"],
        ["3", "Oeste ←"],
      ]),
      select("topology", "Geometría", [
        ["plane", "Plano abierto"],
        ["wrap", "Bordes conectados"],
      ]),
      range("warmup", "Pasos iniciales", 0, 20000, 1000, true),
    ],
    presets: [
      {
        name: "Autopista · RL",
        params: { rule: "RL", ants: 1, warmup: 11000 },
      },
      { name: "Desde cero", params: { rule: "RL", ants: 1, warmup: 0 } },
      {
        name: "Cuatro colores",
        params: { rule: "RLLR", ants: 1, warmup: 8000 },
      },
      { name: "Encuentro", params: { rule: "RLR", ants: 6, warmup: 4000 } },
      { name: "Laberinto", params: { rule: "LLRR", ants: 1, warmup: 12000 } },
    ],
    tools: [
      ["paint", "Pintar"],
      ["ant", "Hormiga"],
      ["erase", "Borrar"],
    ],
    rate: 1000,
    legend: [
      ["#c0e799", "Rastro"],
      ["#ffaf77", "Hormiga"],
    ],
  },
  {
    id: "wator",
    name: "Océano Wa-Tor",
    short: "Wa-Tor",
    category: "ECOSISTEMAS",
    year: "1984",
    author: "A. K. Dewdney",
    accent: "#7dc9d1",
    symbol: "≈",
    description: "El delicado pulso de un océano de peces y tiburones.",
    rule: "Los peces se mueven a vecinos libres y se reproducen por edad. Los tiburones priorizan peces vecinos y mueren tras varios pasos sin comer.",
    variant:
      "Cuatro vecinos y bordes conectados. Orden aleatorio reproducible, una acción por individuo y paso; los recién nacidos esperan. Las edades iniciales se distribuyen para evitar nacimientos sincronizados.",
    sources: [
      [
        "Wa-Tor · reglas de Larry Leinweber",
        "https://www.leinweb.com/snackbar/wator/",
      ],
    ],
    defaults: {
      size: 128,
      fish: 2200,
      sharks: 220,
      fishBreed: 4,
      sharkBreed: 15,
      starve: 7,
    },
    controls: [
      size,
      range("fish", "Peces iniciales", 0, 8000, 1, true),
      range("sharks", "Tiburones iniciales", 0, 1500, 1, true),
      range("fishBreed", "Reproducción peces · pasos", 1, 30),
      range("sharkBreed", "Reproducción tiburones · pasos", 1, 60),
      range("starve", "Resistencia al hambre · pasos", 1, 30),
    ],
    presets: [
      { name: "Océano abierto", params: {} },
      {
        name: "Un solo tiburón",
        params: { fish: 3500, sharks: 1, starve: 12 },
      },
      {
        name: "Depredación intensa",
        params: { fish: 2500, sharks: 800, sharkBreed: 6, starve: 12 },
      },
      {
        name: "Refugio de peces",
        params: { fish: 1500, sharks: 60, fishBreed: 3, starve: 5 },
      },
    ],
    tools: [
      ["prey", "Peces"],
      ["predator", "Tiburón"],
      ["erase", "Borrar"],
    ],
    rate: 25,
    legend: [
      ["#5dc6c7", "Peces"],
      ["#ed916c", "Tiburones"],
    ],
  },
  {
    id: "ecosystem",
    name: "Lobos, ovejas y hierba",
    short: "Ecosistema",
    category: "ECOSISTEMAS",
    year: "1997",
    author: "Inspirado en Uri Wilensky",
    accent: "#b7ca83",
    symbol: "♧",
    description:
      "Toda población depende de algo. Aquí también crece el alimento.",
    rule: "Las ovejas comen hierba; los lobos comen ovejas en su casilla. Moverse consume energía. La reproducción divide la energía y la hierba vuelve a crecer.",
    variant:
      "Implementación propia inspirada en NetLogo. Movimiento continuo sobre terreno discreto y periódico, reproducción probabilística. Primero ovejas, después lobos; las crías actúan en el siguiente paso.",
    sources: [
      [
        "NetLogo · Wolf Sheep Predation",
        "https://ccl.netlogo.org/netlogo/models/WolfSheepPredation",
      ],
    ],
    defaults: {
      size: 64,
      sheep: 350,
      wolves: 70,
      sheepFood: 4,
      wolfFood: 20,
      sheepBirth: 4,
      wolfBirth: 5,
      regrow: 30,
    },
    controls: [
      select("size", "Terreno", [
        ["48", "48 × 48"],
        ["64", "64 × 64"],
        ["96", "96 × 96"],
      ]),
      range("sheep", "Ovejas iniciales", 0, 1500, 1, true),
      range("wolves", "Lobos iniciales", 0, 400, 1, true),
      range("sheepBirth", "Reproducción ovejas · %", 0, 12, 0.5),
      range("wolfBirth", "Reproducción lobos · %", 0, 12, 0.5),
      range("sheepFood", "Energía por hierba", 1, 20),
      range("wolfFood", "Energía por oveja", 2, 60),
      range("regrow", "Regeneración hierba · pasos", 1, 100),
    ],
    presets: [
      { name: "Pradera", params: {} },
      { name: "Sin depredadores", params: { wolves: 0, sheep: 200 } },
      { name: "Un lobo", params: { wolves: 1, sheep: 600, wolfFood: 30 } },
      { name: "Sequía", params: { regrow: 90, sheep: 500, wolves: 60 } },
    ],
    tools: [
      ["prey", "Oveja"],
      ["predator", "Lobo"],
      ["grass", "Hierba"],
      ["erase", "Borrar"],
    ],
    rate: 25,
    legend: [
      ["#e5e6bb", "Ovejas"],
      ["#f7a377", "Lobos"],
      ["#729466", "Hierba"],
    ],
  },
  {
    id: "life",
    name: "El juego de la vida",
    short: "Conway",
    category: "AUTÓMATAS",
    year: "1970",
    author: "John Horton Conway",
    accent: "#badd9a",
    symbol: "▦",
    description: "Arquitecturas que nacen, oscilan y viajan con ocho vecinos.",
    rule: "Conway usa B3/S23: una célula nace con tres vecinas y sobrevive con dos o tres. Todas se actualizan a la vez. Puedes cambiar ambas listas.",
    variant:
      "Cuadrícula toroidal, actualización simultánea mediante doble búfer. Las reglas HighLife y Seeds son variantes seleccionables. El tono distingue células nuevas y persistentes.",
    sources: [
      ["NetLogo · Life", "https://ccl.northwestern.edu/netlogo/models/Life"],
    ],
    defaults: {
      size: 128,
      birth: "3",
      survive: "23",
      density: 0.25,
      pattern: "soup",
    },
    controls: [
      size,
      {
        key: "birth",
        label: "Nace con… vecinas",
        type: "text",
        hint: "Dígitos de 0 a 8.",
      },
      {
        key: "survive",
        label: "Sobrevive con… vecinas",
        type: "text",
        hint: "Dígitos de 0 a 8; vacío = ninguna.",
      },
      range("density", "Densidad inicial", 0.02, 0.8, 0.01, true),
      select("pattern", "Patrón inicial", [
        ["soup", "Sopa aleatoria"],
        ["gun", "Cañones de planeadores"],
        ["gliders", "Flota de planeadores"],
        ["empty", "Vacío"],
      ]),
    ],
    presets: [
      { name: "Conway · B3/S23", params: {} },
      { name: "Cañones de Gosper", params: { pattern: "gun" } },
      { name: "Planeadores", params: { pattern: "gliders" } },
      { name: "HighLife · B36/S23", params: { birth: "36" } },
      {
        name: "Seeds · B2/S",
        params: { birth: "2", survive: "", density: 0.05 },
      },
    ],
    tools: [
      ["paint", "Célula"],
      ["glider", "Planeador"],
      ["erase", "Borrar"],
    ],
    rate: 20,
    legend: [
      ["#e4f1c2", "Nueva"],
      ["#7ab797", "Persistente"],
    ],
  },
  {
    id: "wolfram",
    name: "Autómatas de Wolfram",
    short: "Wolfram",
    category: "AUTÓMATAS",
    year: "1983",
    author: "Stephen Wolfram",
    accent: "#91b6d0",
    symbol: "▽",
    description:
      "Ocho decisiones binarias. Doscientas cincuenta y seis posibilidades.",
    rule: "Cada nueva célula depende de tres celdas de la fila anterior. Sus ocho combinaciones se codifican en los ocho bits del número de regla.",
    variant:
      "Vecindario de radio uno, bordes horizontales conectados. La pantalla conserva las últimas filas. Pintar modifica la fila más reciente, desde la que seguirá la evolución.",
    sources: [
      [
        "NetLogo · CA 1D Elementary",
        "https://ccl.northwestern.edu/netlogo/models/CA1DElementary",
      ],
    ],
    defaults: { size: 256, rule: 90, pattern: "single", warmup: 200 },
    controls: [
      size,
      range("rule", "Número de regla", 0, 255),
      select("pattern", "Primera fila", [
        ["single", "Una célula"],
        ["random", "Aleatoria"],
      ]),
      range("warmup", "Generaciones iniciales", 0, 255, 1, true),
    ],
    presets: [
      { name: "Triángulos · 90", params: { rule: 90 } },
      { name: "Caos · 30", params: { rule: 30 } },
      { name: "Complejidad · 110", params: { rule: 110 } },
      { name: "Tráfico · 184", params: { rule: 184, pattern: "random" } },
      { name: "Desde la primera fila", params: { warmup: 0 } },
    ],
    tools: [
      ["paint", "Encender"],
      ["erase", "Apagar"],
    ],
    rate: 20,
    legend: [
      ["#7ed2b1", "Historial"],
      ["#e9b26f", "Última fila"],
    ],
  },
  {
    id: "boids",
    name: "Bandadas · Boids",
    short: "Boids",
    category: "ENJAMBRES",
    year: "1987",
    author: "Craig Reynolds",
    accent: "#b9cfbc",
    symbol: "➚",
    description: "Nadie dirige la bandada. Todos miran a sus vecinos.",
    rule: "Separación para evitar aglomeraciones, alineación con la velocidad vecina y cohesión hacia el centro local. La suma determina la aceleración.",
    variant:
      "Adaptación 2D con bordes conectados, visión aproximada de 270°, fuerza y velocidad limitadas. Búsqueda de vecinos por celdas espaciales y actualización simultánea.",
    sources: [["Boids · Craig Reynolds", "https://www.red3d.com/cwr/boids/"]],
    defaults: {
      size: 512,
      count: 420,
      radius: 45,
      separation: 1.8,
      alignment: 1.2,
      cohesion: 1,
      speed: 2.5,
    },
    controls: [
      range("count", "Individuos", 20, 1200, 20, true),
      range("radius", "Radio de percepción", 15, 100),
      range("separation", "Separación", 0, 5, 0.1),
      range("alignment", "Alineación", 0, 5, 0.1),
      range("cohesion", "Cohesión", 0, 5, 0.1),
      range("speed", "Velocidad individual", 0.5, 5, 0.1),
    ],
    presets: [
      { name: "Bandada", params: {} },
      {
        name: "Banco compacto",
        params: { cohesion: 3, separation: 1.3, alignment: 2 },
      },
      {
        name: "Dispersión",
        params: { cohesion: 0, alignment: 0, separation: 3 },
      },
      {
        name: "Migración",
        params: { alignment: 4, cohesion: 0.6, speed: 3.5 },
      },
    ],
    tools: [
      ["add", "Añadir"],
      ["attract", "Foco de atracción"],
      ["erase", "Borrar foco"],
    ],
    rate: 60,
    legend: [
      ["#a5dbce", "Agentes"],
      ["#e3b674", "Misma especie"],
    ],
  },
  {
    id: "ants",
    name: "La colonia",
    short: "Feromonas",
    category: "ENJAMBRES",
    year: "1997",
    author: "Inspirado en Uri Wilensky",
    accent: "#d2b584",
    symbol: "⠿",
    description: "El camino aparece a fuerza de recorrerlo.",
    rule: "Las exploradoras buscan comida. Las que regresan dejan un rastro que atrae a otras. La feromona se difunde y se evapora con el tiempo.",
    variant:
      "Adaptación propia de Ants: tres sensores, retorno por vector al nido y bordes cerrados. Incluye paredes; la difusión no las atraviesa. No reproduce exactamente la escala química de NetLogo.",
    sources: [
      ["NetLogo · Ants", "https://ccl.northwestern.edu/netlogo/models/Ants"],
    ],
    defaults: {
      size: 128,
      count: 250,
      evaporation: 0.015,
      diffusion: 0.25,
      deposit: 1,
      sensor: 5,
      wander: 0.65,
    },
    controls: [
      range("count", "Hormigas iniciales", 20, 1000, 10, true),
      range("evaporation", "Evaporación por paso", 0.001, 0.15, 0.001),
      range("diffusion", "Difusión", 0, 1, 0.01),
      range("deposit", "Rastro depositado", 0.1, 5, 0.1),
      range("sensor", "Distancia de sensores", 2, 15),
      range("wander", "Exploración aleatoria", 0.1, 2, 0.05),
    ],
    presets: [
      { name: "En busca de alimento", params: {} },
      { name: "Rastros duraderos", params: { evaporation: 0.003 } },
      { name: "Colonia numerosa", params: { count: 700 } },
      { name: "Memoria corta", params: { evaporation: 0.08 } },
    ],
    tools: [
      ["food", "Comida"],
      ["wall", "Pared"],
      ["nest", "Nido"],
      ["ant", "Hormiga"],
      ["erase", "Borrar"],
    ],
    rate: 60,
    legend: [
      ["#d0d7c0", "Hormiga"],
      ["#e3b674", "Nido / alimento llevado"],
      ["#59918b", "Feromona"],
    ],
  },
  {
    id: "reaction",
    name: "Reacción–difusión",
    short: "Gray–Scott",
    category: "CONTINUOS",
    year: "QUÍMICA",
    author: "Modelo Gray–Scott",
    accent: "#bdcfa1",
    symbol: "◉",
    description: "Dos sustancias virtuales dibujan una piel que nunca termina.",
    rule: "A alimenta la producción de B. Ambas sustancias se difunden a ritmos distintos; una tasa introduce A y otra elimina B.",
    variant:
      "Esquema de Karl Sims, laplaciano de nueve puntos y doble búfer. Paso temporal fijo de una unidad. Acelerar aumenta las iteraciones, no el tamaño del paso.",
    sources: [
      [
        "Tutorial de reacción-difusión · Karl Sims",
        "https://www.karlsims.com/rd.html",
      ],
    ],
    defaults: {
      size: 192,
      feed: 0.055,
      kill: 0.062,
      diffA: 1,
      diffB: 0.5,
      pattern: "spots",
      warmup: 600,
    },
    controls: [
      size,
      range("feed", "Alimentación · f", 0.005, 0.09, 0.0001),
      range("kill", "Eliminación · k", 0.03, 0.075, 0.0001),
      range("diffA", "Difusión de A", 0.1, 1, 0.05),
      range("diffB", "Difusión de B", 0.05, 0.5, 0.025),
      select("pattern", "Semilla química", [
        ["spots", "Múltiples focos"],
        ["single", "Un foco"],
      ]),
      range("warmup", "Iteraciones iniciales", 0, 3000, 100, true),
    ],
    presets: [
      { name: "Laberinto", params: {} },
      {
        name: "División celular",
        params: { feed: 0.0367, kill: 0.0649, pattern: "single", warmup: 1200 },
      },
      { name: "Coral", params: { feed: 0.0545, kill: 0.062, warmup: 1200 } },
      { name: "Manchas", params: { feed: 0.03, kill: 0.062, warmup: 1000 } },
      { name: "Desde cero", params: { warmup: 0 } },
    ],
    tools: [
      ["paint", "Inyectar B"],
      ["erase", "Restaurar A"],
    ],
    rate: 100,
    legend: [
      ["#b8c083", "Concentración B"],
      ["#0c1216", "Concentración A"],
    ],
  },
  {
    id: "particles",
    name: "Particle Life",
    short: "Partículas",
    category: "ENJAMBRES",
    year: "EMERGENCIA",
    author: "Familia Clusters / Particle Life",
    accent: "#c7acd2",
    symbol: "∴",
    description: "Atracción, repulsión y pequeñas sociedades de partículas.",
    rule: "Cada tipo reacciona a los demás según una matriz. Hay repulsión a corta distancia y una fuerza de interacción dentro de un radio finito.",
    variant:
      "Fuerza por tramos con β = 0,3. Matriz asimétrica, fricción exponencial, paso fijo de 0,12 y fronteras periódicas. La matriz se puede editar durante la ejecución.",
    sources: [
      [
        "Fuerza de interacción · Particle Life",
        "https://particle-life.com/java-framework/accelerators.html",
      ],
    ],
    defaults: {
      size: 512,
      count: 650,
      types: 4,
      radius: 60,
      force: 12,
      friction: 2,
      pattern: "clusters",
    },
    controls: [
      range("count", "Partículas iniciales", 50, 1800, 50, true),
      range("types", "Tipos", 2, 6, 1, true),
      range("radius", "Radio de interacción", 15, 100),
      range("force", "Intensidad", 1, 25, 0.5),
      range("friction", "Fricción", 0.2, 6, 0.1),
      select("pattern", "Matriz inicial", [
        ["clusters", "Agrupaciones"],
        ["random", "Aleatoria"],
        ["snake", "Persecución circular"],
      ]),
    ],
    presets: [
      { name: "Agrupaciones", params: {} },
      {
        name: "Persecución circular",
        params: { pattern: "snake", friction: 1.5 },
      },
      { name: "Sopa impredecible", params: { pattern: "random" } },
      {
        name: "Seis especies",
        params: { types: 6, pattern: "random", count: 900 },
      },
    ],
    tools: [
      ["add", "Partículas"],
      ["erase", "Borrar"],
    ],
    rate: 60,
    legend: [
      ["#a5dbce", "Tipo 1"],
      ["#e3b674", "Tipo 2"],
      ["#ad9acb", "Tipo 3"],
      ["#81acdc", "Tipo 4"],
    ],
  },
  {
    id: "lenia",
    name: "Lenia · vida continua",
    short: "Lenia",
    category: "CONTINUOS",
    year: "2015",
    author: "Bert Chan",
    accent: "#a2cccb",
    symbol: "◌",
    description:
      "Cuando las células dejan de ser binarias, aparecen otras formas de vida.",
    rule: "Un núcleo circular mide la densidad del entorno. Una función de crecimiento transforma esa densidad en cambio de estado; los valores se mantienen entre cero y uno.",
    variant:
      "Lenia 2D monocanal, convolución periódica mediante FFT. Orbium O2u usa las funciones polinómicas del catálogo original. La opción gaussiana es una variante; cambiar parámetros puede extinguir el organismo.",
    sources: [
      ["Lenia · Bert Chan", "https://chakazul.github.io/lenia.html"],
      [
        "Catálogo Orbium · código y licencia MIT",
        "https://github.com/Chakazul/Lenia/blob/adfc542939266de7f4bb7ebb552e8499701ee107/Python/animals.json",
      ],
    ],
    defaults: {
      size: 128,
      radius: 13,
      mu: 0.15,
      sigma: 0.015,
      dt: 0.1,
      kernel: "polynomial",
      pattern: "orbium",
    },
    controls: [
      select("size", "Resolución", [
        ["64", "64 × 64"],
        ["128", "128 × 128"],
        ["256", "256 × 256"],
      ]),
      range("radius", "Radio del núcleo · R", 6, 24),
      range("mu", "Centro de crecimiento · μ", 0.05, 0.3, 0.001),
      range("sigma", "Anchura · σ", 0.005, 0.08, 0.001),
      range("dt", "Paso numérico · Δt", 0.02, 0.2, 0.01),
      select(
        "kernel",
        "Función",
        [
          ["polynomial", "Polinómica · original O2u"],
          ["gaussian", "Gaussiana · variante"],
        ],
        false,
      ),
      select("pattern", "Organismos iniciales", [
        ["orbium", "Orbium"],
        ["colony", "Colonia"],
        ["noise", "Ruido experimental"],
      ]),
    ],
    presets: [
      { name: "Orbium · original", params: {} },
      { name: "Colonia de Orbium", params: { pattern: "colony" } },
      { name: "Variante gaussiana", params: { kernel: "gaussian" } },
      {
        name: "Ruido experimental",
        params: { pattern: "noise", mu: 0.2, sigma: 0.035 },
      },
    ],
    tools: [
      ["orbium", "Orbium"],
      ["paint", "Materia"],
      ["erase", "Borrar"],
    ],
    rate: 20,
    legend: [
      ["#a0c4c3", "Materia viva"],
      ["#0c1316", "Vacío"],
    ],
  },
];
catalog.push(...extraCatalog);
export function definition(id: string) {
  const d = catalog.find((x) => x.id === id);
  if (!d) throw Error("Modelo desconocido");
  return d;
}
export function validateParams(id: string, input: Params): Params {
  const d = definition(id),
    out = { ...d.defaults };
  for (const [k, v] of Object.entries(input)) {
    if (!(k in out)) continue;
    const c = d.controls.find((c) => c.key === k);
    if (c?.type === "text") {
      const s = String(v).toUpperCase();
      if (id === "lsystem") {
        if (!/^[FX+\-\[\]]{0,160}$/.test(s) || (k === "axiom" && !s.length))
          throw Error(
            "Usa hasta 160 símbolos F X + - [ ]. El axioma no puede estar vacío.",
          );
        let depth = 0;
        for (const c of s) {
          if (c === "[") depth++;
          if (c === "]") depth--;
          if (depth < 0) throw Error("Los corchetes deben estar equilibrados.");
        }
        if (depth) throw Error("Los corchetes deben estar equilibrados.");
        out[k] = s;
        continue;
      }
      if (k === "rule" && !/^[LR]{2,12}$/.test(s))
        throw Error("La regla necesita de 2 a 12 letras L o R.");
      if (k !== "rule" && !/^[0-8]{0,9}$/.test(s))
        throw Error("Usa solamente dígitos de 0 a 8.");
      out[k] = s;
    } else if (c?.type === "select") {
      if (!c.options!.some(([val]) => val === String(v)))
        throw Error("Opción inválida");
      out[k] = typeof d.defaults[k] === "number" ? Number(v) : String(v);
    } else if (typeof d.defaults[k] === "number") {
      const num = Number(v);
      if (!Number.isFinite(num)) throw Error("Valor numérico inválido");
      if (c && (num < c.min! || num > c.max!))
        throw Error(`${c.label}: fuera del intervalo permitido`);
      if (c && (c.step || 1) >= 1 && !Number.isInteger(num))
        throw Error(`${c.label}: introduce un número entero`);
      if (!c && num !== d.defaults[k]) throw Error("Parámetro fijo inválido");
      out[k] = num;
    } else out[k] = String(v);
  }
  if (
    id === "wator" &&
    Number(out.fish) + Number(out.sharks) > Number(out.size) ** 2
  )
    throw Error(
      "Las poblaciones iniciales superan las casillas disponibles. Reduce los animales o amplía el mundo.",
    );
  return out;
}
