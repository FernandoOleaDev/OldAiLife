import type { Definition, Param } from "./core/types";
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
const text = (key: string, label: string): Param => ({
  key,
  label,
  type: "text",
  rebuild: true,
});
const size = select("size", "Tamaño del mundo", [
  ["64", "64 × 64"],
  ["128", "128 × 128"],
  ["192", "192 × 192"],
  ["256", "256 × 256"],
]);
export const extraCatalog: Definition[] = [
  {
    id: "physarum",
    name: "Redes de Physarum",
    short: "Physarum",
    category: "ENJAMBRES",
    year: "2010",
    author: "Jeff Jones",
    accent: "#c7d5a1",
    symbol: "⌁",
    description: "Miles de partículas construyen una red sin conocer el mapa.",
    rule: "Cada partícula intenta avanzar, deposita rastro si puede y compara tres sensores para girar hacia él. El campo se difunde y evapora; ninguna celda admite dos partículas.",
    variant:
      "Motor, sensores y difusión en etapas, con bordes periódicos y movimiento de un píxel. Modelo de Jones sobre 128² celdas; pintar alimento añade fuentes persistentes. El rastro se limita a 1.000 unidades. SA 22,5° / RA 45° favorece redes dinámicas; SA 45° cambia su evolución.",
    sources: [
      [
        "Jones · artículo original (2010)",
        "https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks",
      ],
    ],
    defaults: {
      size: 128,
      density: 0.15,
      sensor: 9,
      sensorAngle: 22.5,
      rotation: 45,
      deposit: 5,
      decay: 0.1,
      pattern: "random",
      show: "no",
      warmup: 60,
    },
    controls: [
      size,
      range("density", "Ocupación inicial", 0.02, 0.3, 0.01, true),
      range("sensor", "Distancia de sensores", 1, 24),
      range("sensorAngle", "Ángulo de sensores · °", 5, 90, 0.5),
      range("rotation", "Ángulo de giro · °", 5, 90, 0.5),
      range("deposit", "Depósito por movimiento", 1, 20),
      range("decay", "Evaporación", 0.01, 0.5, 0.01),
      select("pattern", "Campo inicial", [
        ["random", "Sin alimento"],
        ["food", "Tres fuentes de alimento"],
      ]),
      select(
        "show",
        "Partículas visibles",
        [
          ["no", "Solo la red"],
          ["yes", "Red y partículas"],
        ],
        false,
      ),
      range("warmup", "Pasos iniciales", 0, 200, 1, true),
    ],
    presets: [
      { name: "Red dinámica · Jones", params: {} },
      { name: "Red que se simplifica", params: { sensorAngle: 45 } },
      { name: "Tres fuentes", params: { pattern: "food", sensorAngle: 45 } },
      { name: "Desde cero", params: { warmup: 0 } },
    ],
    tools: [
      ["food", "Alimento"],
      ["trail", "Rastro"],
      ["erase", "Borrar"],
    ],
    rate: 40,
    legend: [
      ["#c7d5a1", "Rastro químico"],
      ["#d5ab69", "Fuente de alimento"],
    ],
  },
  {
    id: "brain",
    name: "Brian’s Brain",
    short: "Brian’s Brain",
    category: "AUTÓMATAS",
    year: "1984",
    author: "Brian Silverman",
    accent: "#a5c4eb",
    symbol: "✧",
    description: "Una chispa se convierte en ondas, naves y lluvia de señales.",
    rule: "Una celda apagada se activa con exactamente dos vecinos activos. En el siguiente paso entra en estado refractario y después vuelve a apagarse. Las ocho vecinas se leen simultáneamente.",
    variant:
      "El ejemplo clásico usa tres estados y bordes conectados. Cambiar vecinos o duración refractaria define otras reglas excitables, no la regla original de Brian’s Brain.",
    sources: [
      [
        "CelLab · implementación y regla Brain",
        "https://www.fourmilab.ch/cellab/manual/ruledef-js.html",
      ],
    ],
    defaults: {
      size: 128,
      density: 0.2,
      neighbors: 2,
      refractory: 1,
      pattern: "soup",
    },
    controls: [
      size,
      range("density", "Densidad inicial", 0.01, 0.7, 0.01, true),
      range("neighbors", "Vecinos para activarse", 1, 8),
      range("refractory", "Duración refractaria · pasos", 1, 8, 1, true),
      select("pattern", "Estado inicial", [
        ["soup", "Sopa aleatoria"],
        ["spark", "Chispa central"],
        ["empty", "Vacío"],
      ]),
    ],
    presets: [
      { name: "Clásico · B2/S/3", params: {} },
      { name: "Chispa", params: { pattern: "spark" } },
      { name: "Reposo prolongado", params: { refractory: 4 } },
      { name: "Lienzo vacío", params: { pattern: "empty" } },
    ],
    tools: [
      ["fire", "Excitar"],
      ["rest", "Refractaria"],
      ["erase", "Borrar"],
    ],
    rate: 30,
    legend: [
      ["#c4e0f2", "Activa"],
      ["#3f5c8f", "Refractaria"],
    ],
  },
  {
    id: "cyclic",
    name: "Piedra, papel, tijera",
    short: "Competencia",
    category: "ECOSISTEMAS",
    year: "2007",
    author: "Reichenbach, Mobilia y Frey",
    accent: "#c5a5bf",
    symbol: "↻",
    description:
      "Tres especies se persiguen en un ciclo sin un ganador absoluto.",
    rule: "Roca elimina a tijera, tijera a papel y papel a roca. La selección deja un hueco; la reproducción lo ocupa. La movilidad intercambia vecinos, incluidos los huecos.",
    variant:
      "Adaptación espacial de selección, reproducción e intercambio: un evento aleatorio por celda de media y paso; cuatro vecinos y toro. Los controles son pesos relativos de eventos, no tasas Poisson del modelo NetLogo. La coexistencia no está garantizada.",
    sources: [
      [
        "NetLogo · Rock Paper Scissors, código y referencias",
        "https://ccl.northwestern.edu/netlogo/models/RockPaperScissors",
      ],
    ],
    defaults: {
      size: 128,
      density: 0.9,
      selection: 1,
      reproduction: 1,
      mobility: 2,
      pattern: "random",
      warmup: 80,
    },
    controls: [
      size,
      range("density", "Ocupación inicial", 0.1, 1, 0.05, true),
      range("selection", "Peso de selección", 0, 5, 0.1),
      range("reproduction", "Peso de reproducción", 0, 5, 0.1),
      range("mobility", "Peso de movilidad", 0, 10, 0.1),
      select("pattern", "Distribución inicial", [
        ["random", "Mezcla aleatoria"],
        ["sectors", "Tres territorios"],
      ]),
      range("warmup", "Pasos iniciales", 0, 200, 1, true),
    ],
    presets: [
      { name: "Coexistencia espacial", params: {} },
      {
        name: "Fronteras en movimiento",
        params: { pattern: "sectors", warmup: 0 },
      },
      { name: "Movilidad elevada", params: { mobility: 10 } },
      { name: "Sin reproducción", params: { reproduction: 0, warmup: 0 } },
    ],
    tools: [
      ["1", "Roca"],
      ["2", "Tijera"],
      ["3", "Papel"],
      ["erase", "Borrar"],
    ],
    rate: 25,
    legend: [
      ["#d38770", "Roca"],
      ["#77b197", "Tijera"],
      ["#7d9ad5", "Papel"],
    ],
  },
  {
    id: "forest",
    name: "Bosque e incendios",
    short: "Incendios",
    category: "ECOSISTEMAS",
    year: "1997",
    author: "Inspirado en Uri Wilensky",
    accent: "#d7a171",
    symbol: "♨",
    description: "Un pequeño fuego revela cómo está conectado todo el bosque.",
    rule: "Un árbol arde si alguno de sus cuatro vecinos está en llamas. El fuego dura un paso y deja ceniza. El rebrote y los rayos, si están activos, aportan árboles e incendios nuevos.",
    variant:
      "Actualización simultánea y límites cerrados. El ejemplo Fuego clásico desactiva rayos y rebrote y enciende el borde izquierdo, como NetLogo Fire. El bosque dinámico añade regeneración y rayos probabilísticos: es una extensión, no una predicción de incendios reales.",
    sources: [
      ["NetLogo · Fire", "https://ccl.northwestern.edu/netlogo/models/Fire"],
    ],
    defaults: {
      size: 128,
      density: 0.64,
      growth: 0.008,
      lightning: 0.00005,
      ignition: "center",
    },
    controls: [
      size,
      range("density", "Densidad inicial de árboles", 0.1, 1, 0.01, true),
      range("growth", "Probabilidad de rebrote / paso", 0, 0.05, 0.001),
      range("lightning", "Probabilidad de rayo / árbol", 0, 0.001, 0.00001),
      select("ignition", "Ignición inicial", [
        ["center", "En el centro"],
        ["edge", "Borde izquierdo"],
        ["none", "Sin fuego"],
      ]),
    ],
    presets: [
      { name: "Bosque dinámico", params: {} },
      {
        name: "Fuego clásico · 64%",
        params: { growth: 0, lightning: 0, ignition: "edge" },
      },
      {
        name: "Bosque fragmentado · 45%",
        params: { density: 0.45, growth: 0, lightning: 0, ignition: "edge" },
      },
      {
        name: "Bosque denso · 80%",
        params: { density: 0.8, growth: 0, lightning: 0, ignition: "edge" },
      },
    ],
    tools: [
      ["fire", "Fuego"],
      ["tree", "Árboles"],
      ["erase", "Cortafuegos"],
    ],
    rate: 20,
    legend: [
      ["#598759", "Árbol"],
      ["#f3964c", "Fuego"],
      ["#615043", "Ceniza"],
    ],
  },
  {
    id: "sandpile",
    name: "Montículo de arena",
    short: "Arena",
    category: "PATRONES",
    year: "1987",
    author: "Bak, Tang y Wiesenfeld",
    accent: "#d6be86",
    symbol: "⋰",
    description:
      "Añade un grano. Puede no pasar nada, o empezar una avalancha.",
    rule: "Una celda con cuatro granos o más reparte cuatro: uno a cada vecino cardinal. Las celdas del borde pierden los granos que salen del mundo. El aporte espera a que termine la avalancha.",
    variant:
      "Montículo abeliano con frontera disipativa. Cada paso muestra una ronda paralela de derrumbes; una celda puede derrumbarse varias veces en esa ronda. No se conectan los bordes. Los granos se conservan salvo el aporte y la disipación registrados.",
    sources: [
      [
        "Bak, Tang y Wiesenfeld · artículo original",
        "https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381",
      ],
      [
        "NetLogo · exploración Sandpile",
        "https://ccl.northwestern.edu/netlogo/models/Sandpile",
      ],
    ],
    defaults: {
      size: 128,
      pattern: "pile",
      initial: 20000,
      drive: 1,
      drop: "center",
      brushGrains: 100,
    },
    controls: [
      size,
      select("pattern", "Preparación", [
        ["pile", "Montículo central"],
        ["critical", "Tres granos por celda"],
        ["random", "Fondo aleatorio"],
        ["empty", "Vacío"],
      ]),
      range("initial", "Granos del montículo inicial", 100, 100000, 100, true),
      range("drive", "Aporte al estabilizarse", 0, 100),
      select(
        "drop",
        "Dónde cae la arena",
        [
          ["center", "Centro"],
          ["random", "Al azar"],
        ],
        false,
      ),
      range("brushGrains", "Granos por celda del pincel", 1, 1000),
    ],
    presets: [
      { name: "Geometría de una avalancha", params: {} },
      {
        name: "Al borde del derrumbe",
        params: { pattern: "critical", drop: "random" },
      },
      {
        name: "Lluvia de arena",
        params: { pattern: "random", drive: 20, drop: "random" },
      },
      { name: "Montículo aislado", params: { drive: 0, initial: 50000 } },
    ],
    tools: [
      ["sand", "Arena"],
      ["erase", "Vaciar"],
    ],
    rate: 120,
    legend: [
      ["#568585", "1 grano"],
      ["#bfa762", "2"],
      ["#b16c65", "3"],
      ["#eae2af", "4 o más"],
    ],
  },
  {
    id: "dla",
    name: "Agregación por difusión",
    short: "Cristales DLA",
    category: "PATRONES",
    year: "1981",
    author: "Thomas Witten y Leonard Sander",
    accent: "#92c4cb",
    symbol: "❄",
    description: "Caminatas aleatorias dibujan ramas que parecen minerales.",
    rule: "Partículas sueltas caminan al azar y se fijan al tocar el agregado. Las puntas capturan más caminantes que los huecos interiores: así nacen las ramificaciones.",
    variant:
      "DLA en retícula cuadrada. Los caminantes aparecen en un círculo exterior y se relanzan si se alejan demasiado. Adhesión con 4 u 8 vecinos y probabilidad configurable. El agregado se detiene antes del borde para evitar envolver el cristal.",
    sources: [
      [
        "NetLogo · DLA y referencia a Witten–Sander",
        "https://ccl.northwestern.edu/netlogo/models/DLA",
      ],
    ],
    defaults: {
      size: 128,
      walkers: 160,
      walk: 20,
      neighbors: 8,
      stickiness: 1,
      pattern: "seed",
      show: "no",
      warmup: 60,
    },
    controls: [
      size,
      range("walkers", "Caminantes", 20, 400, 1, true),
      range("walk", "Micro pasos por caminante", 1, 80),
      select(
        "neighbors",
        "Contacto para adhesión",
        [
          ["4", "Cuatro vecinos"],
          ["8", "Ocho vecinos"],
        ],
        false,
      ),
      range("stickiness", "Probabilidad de adhesión", 0.05, 1, 0.05),
      select("pattern", "Núcleo", [
        ["seed", "Punto"],
        ["cross", "Cruz"],
      ]),
      select(
        "show",
        "Caminantes visibles",
        [
          ["no", "Solo agregado"],
          ["yes", "Agregado y caminantes"],
        ],
        false,
      ),
      range("warmup", "Pasos iniciales", 0, 150, 1, true),
    ],
    presets: [
      { name: "Cristal ramificado", params: {} },
      { name: "Desde una partícula", params: { warmup: 0 } },
      { name: "Contacto cardinal", params: { neighbors: 4 } },
      { name: "Adhesión débil", params: { stickiness: 0.15, walk: 40 } },
    ],
    tools: [
      ["seed", "Núcleo"],
      ["erase", "Borrar"],
    ],
    rate: 30,
    legend: [
      ["#5aa6b2", "Interior"],
      ["#e6d96d", "Crecimiento reciente"],
    ],
  },
  {
    id: "schelling",
    name: "Agrupación de Schelling",
    short: "Schelling",
    category: "SOCIEDAD",
    year: "1971",
    author: "Thomas Schelling",
    accent: "#d6a76f",
    symbol: "▦",
    description:
      "Preferencias locales pequeñas pueden producir grandes agrupaciones.",
    rule: "Dos tipos de agentes comparten un tablero. Si la fracción de vecinos de su mismo tipo queda por debajo del umbral, el agente se muda a una casilla vacía aleatoria.",
    variant:
      "Ocho vecinos, toro y orden aleatorio; cada agente se evalúa una sola vez por paso. Los huecos no cuentan como vecinos y un agente aislado está satisfecho. Es un modelo abstracto: los colores no representan grupos reales ni explican por sí solos una sociedad.",
    sources: [
      [
        "NetLogo · Segregation, modelo y referencias",
        "https://ccl.northwestern.edu/netlogo/models/Segregation",
      ],
    ],
    defaults: { size: 64, density: 0.85, balance: 0.5, similarity: 0.4 },
    controls: [
      select("size", "Tamaño del barrio", [
        ["64", "64 × 64"],
        ["96", "96 × 96"],
        ["128", "128 × 128"],
      ]),
      range("density", "Ocupación inicial", 0.1, 0.98, 0.01, true),
      range("balance", "Fracción inicial del tipo A", 0.05, 0.95, 0.01, true),
      range("similarity", "Mínimo de vecinos similares", 0, 1, 0.05),
    ],
    presets: [
      { name: "Preferencia moderada · 40%", params: {} },
      { name: "Sin preferencia", params: { similarity: 0 } },
      { name: "Preferencia alta · 75%", params: { similarity: 0.75 } },
      { name: "Más espacio libre", params: { density: 0.55 } },
    ],
    tools: [
      ["1", "Tipo A"],
      ["2", "Tipo B"],
      ["erase", "Vacío"],
    ],
    rate: 8,
    legend: [
      ["#d6a76f", "Tipo A"],
      ["#87a6ce", "Tipo B"],
    ],
  },
  {
    id: "wireworld",
    name: "Circuitos Wireworld",
    short: "Wireworld",
    category: "AUTÓMATAS",
    year: "1987",
    author: "Brian Silverman",
    accent: "#d5b573",
    symbol: "⌗",
    description:
      "Cuatro estados bastan para hacer circular señales por un circuito.",
    rule: "Vacío permanece vacío. Cabeza de electrón pasa a cola; cola pasa a conductor. Un conductor se vuelve cabeza si tiene exactamente una o dos cabezas entre sus ocho vecinos.",
    variant:
      "Actualización simultánea y frontera cerrada. Los bucles iniciales omiten las esquinas para evitar atajos diagonales. Puedes dibujar cables y colocar cabeza seguida de cola para introducir un pulso dirigido.",
    sources: [
      ["Wireworld · implementación y reglas", "https://wireworld.co/"],
      [
        "Golly · estados de Wireworld",
        "https://golly.sourceforge.io/Help/formats.html",
      ],
    ],
    defaults: { size: 128, pattern: "loops" },
    controls: [
      size,
      select("pattern", "Circuito inicial", [
        ["loops", "Bucles de señal"],
        ["wires", "Cables paralelos"],
        ["empty", "Placa vacía"],
      ]),
    ],
    presets: [
      { name: "Bucles de señal", params: {} },
      { name: "Cables paralelos", params: { pattern: "wires" } },
      { name: "Construir desde cero", params: { pattern: "empty" } },
    ],
    tools: [
      ["wire", "Conductor"],
      ["head", "Cabeza"],
      ["tail", "Cola"],
      ["loop", "Bucle"],
      ["erase", "Borrar"],
    ],
    rate: 18,
    legend: [
      ["#bf9546", "Conductor"],
      ["#89d4ed", "Cabeza"],
      ["#e17469", "Cola"],
    ],
  },
  {
    id: "fireflies",
    name: "Sincronía de luciérnagas",
    short: "Luciérnagas",
    category: "ENJAMBRES",
    year: "1975",
    author: "Yoshiki Kuramoto",
    accent: "#e2df9a",
    symbol: "✺",
    description:
      "Cada luz lleva su propio ritmo. Juntas pueden encontrar un pulso común.",
    rule: "Cada fase avanza a su frecuencia natural más un acoplamiento sinusoidal con las demás. El parámetro de orden R mide la coherencia: cero indica dispersión y uno, fases coincidentes.",
    variant:
      "Osciladores de Kuramoto con acoplamiento global, visualizados como luciérnagas inmóviles. Euler simultáneo con Δt = 0,04; acelerar repite pasos, no agranda Δt. No reproduce el modelo de reinicio por destellos de NetLogo ni la biología de una especie.",
    sources: [
      [
        "Estudio de Kuramoto · ecuación y parámetro de orden",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC3532102/",
      ],
      [
        "NetLogo · otra familia de modelos de luciérnagas",
        "https://ccl.northwestern.edu/netlogo/models/Fireflies",
      ],
    ],
    defaults: { size: 128, count: 240, spread: 0.2, coupling: 1.5, dt: 0.04 },
    controls: [
      range("count", "Luciérnagas", 20, 1000, 1, true),
      range("coupling", "Acoplamiento · K", 0, 4, 0.05),
      range("spread", "Diversidad de frecuencias", 0, 1, 0.05, true),
    ],
    presets: [
      { name: "Encontrar el ritmo", params: {} },
      { name: "Cada una a su aire", params: { coupling: 0 } },
      { name: "Sincronía fuerte", params: { coupling: 3 } },
      { name: "Frecuencias diversas", params: { spread: 1, coupling: 0.5 } },
    ],
    tools: [
      ["sync", "Destello local"],
      ["scatter", "Desordenar"],
    ],
    rate: 30,
    legend: [
      ["#f4eb8b", "Destello"],
      ["#303927", "Entre destellos"],
    ],
  },
  {
    id: "lsystem",
    name: "Jardín de sistemas L",
    short: "Sistemas L",
    category: "PATRONES",
    year: "1968",
    author: "Aristid Lindenmayer",
    accent: "#bdd59c",
    symbol: "⚘",
    description:
      "Una gramática se reescribe y crece hasta convertirse en planta.",
    rule: "Cada generación sustituye todos los símbolos a la vez. F avanza dibujando; + y − giran; [ guarda la posición y ] vuelve a ella. X organiza la expansión sin dibujar.",
    variant:
      "Gramáticas deterministas del libro The Algorithmic Beauty of Plants. El desarrollo visual revela segmentos de la generación elegida; un paso muestra un tramo, no una generación ni tiempo biológico. Encuadre automático; límites de 80.000 símbolos y 18.000 segmentos.",
    sources: [
      [
        "Prusinkiewicz y Lindenmayer · libro, capítulo 1 (figura 1.24)",
        "https://www.algorithmicbotany.org/papers/abop/abop-ch1.lowquality.pdf",
      ],
    ],
    defaults: {
      size: 256,
      axiom: "X",
      ruleF: "FF",
      ruleX: "F-[[X]+X]+F[+FX]-X",
      angle: 22.5,
      generations: 5,
      growth: 12,
    },
    controls: [
      text("axiom", "Axioma · F X + − [ ]"),
      text("ruleF", "Producción F →"),
      text("ruleX", "Producción X →"),
      range("angle", "Ángulo de giro · °", 5, 90, 0.1, true),
      range("generations", "Generaciones", 0, 6, 1, true),
      range("growth", "Segmentos visibles por paso", 1, 100),
    ],
    presets: [
      { name: "Planta · ABOP 1.24f", params: {} },
      {
        name: "Ramificación · ABOP 1.24a",
        params: {
          axiom: "F",
          ruleF: "F[+F]F[-F]F",
          ruleX: "X",
          angle: 25.7,
          generations: 5,
        },
      },
      {
        name: "Arbusto · ABOP 1.24d",
        params: {
          axiom: "F",
          ruleF: "FF-[-F+F+F]+[+F-F-F]",
          ruleX: "X",
          angle: 22.5,
          generations: 4,
        },
      },
      {
        name: "Curva de Koch",
        params: {
          axiom: "F",
          ruleF: "F+F--F+F",
          ruleX: "X",
          angle: 60,
          generations: 4,
        },
      },
    ],
    tools: [
      ["reveal", "Ver completo"],
      ["rewind", "Volver al inicio"],
    ],
    rate: 25,
    legend: [
      ["#a68a62", "Tallo"],
      ["#b6cf97", "Ramificación"],
    ],
  },
];
