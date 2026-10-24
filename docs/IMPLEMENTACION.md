# Decisiones de implementación

24 de octubre de 2026. Aplicación local, sin backend de datos. Las referencias se han consultado para programar los modelos; salvo el patrón Orbium expresamente atribuido, el código de simulación es propio.

| Modelo        | Decisión y referencia                                                                                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Langton       | Mapa disperso para el plano abierto; regla L/R, ciclo de colores y orden explícito entre hormigas. Encuadre automático que reduce resolución de visualización en mundos grandes, conservando las casillas del estado. [Definición académica](https://www.mat-unab.cl/~hellouin/Articles/Turmites.pdf).                                     |
| Wa-Tor        | Un individuo por celda, cuatro vecinos y búsqueda prioritaria de peces. Lista de individuos al inicio de cada paso, orden aleatorio reproducible; las crías no actúan hasta el siguiente paso. Los peces recién nacidos sí pueden ser comidos. [Referencia de implementación de Larry Leinweber](https://www.leinweb.com/snackbar/wator/). |
| Ecosistema    | Energía y recursos, probabilidades de reproducción y regeneración. Adaptación propia con movimiento continuo, recursos por casilla y nacimientos al final del paso. No se presenta como réplica exacta del código NetLogo. [Wolf Sheep Predation](https://ccl.netlogo.org/netlogo/models/WolfSheepPredation).                              |
| Conway        | Vecindario de ocho celdas, reglas B/S y doble búfer para actualización simultánea. Frontera periódica. [Life](https://ccl.northwestern.edu/netlogo/models/Life).                                                                                                                                                                           |
| Wolfram       | Vecindario de tres celdas; el número binario de cada vecindario selecciona un bit de la regla. Bordes horizontales conectados e historial visual acotado. En un mundo finito algunas reglas pueden extinguirse; no se resembran silenciosamente. [CA 1D Elementary](https://ccl.northwestern.edu/netlogo/models/CA1DElementary).           |
| Boids         | Suma ponderada de separación, alineación y cohesión, percepción limitada, velocidad y aceleración acotadas. Búsqueda por rejilla espacial, distancias toroidales y actualización simultánea. [Craig Reynolds](https://www.red3d.com/cwr/boids/).                                                                                           |
| Feromonas     | Agentes y campo químico separado. Difusión explícita estable, evaporación y paredes sin flujo. Adaptación con tres sensores y retorno directo hacia el nido; la intensidad química no reproduce la escala original. [Ants](https://ccl.northwestern.edu/netlogo/models/Ants).                                                              |
| Gray–Scott    | Dos concentraciones, laplaciano de nueve puntos (centro −1, ortogonales 0,2, diagonales 0,05), actualización simultánea y paso numérico fijo. [Karl Sims](https://www.karlsims.com/rd.html).                                                                                                                                               |
| Particle Life | Fuerza de repulsión cercana y atracción/repulsión triangular a media distancia, β=0,3. Matriz dirigida, fricción exponencial y paso fijo. Rejilla espacial para evitar comparar sistemáticamente todos los pares. [Documentación del simulador](https://particle-life.com/java-framework/accelerators.html).                               |
| Lenia         | Convolución circular FFT 2D con espectro del núcleo precalculado. Orbium O2u: R=13, μ=0,15, σ=0,015 y Δt=0,1; kernel y crecimiento polinómicos del catálogo. La gaussiana se identifica como variante. [Repositorio de Bert Chan](https://github.com/Chakazul/Lenia).                                                                      |

## Ampliación: diez modelos adicionales

| Modelo | Decisión y referencia primaria |
| --- | --- |
| Physarum | Tres fases: motor aleatorio con exclusión por celda, sensores y difusión 3×3 con evaporación. Parámetros de Jones: distancia 9, sensor 22,5°, giro 45°, paso 1, depósito 5, evaporación 0,1. Resolución 128² y fuentes pintadas configurables; saturación química en 1.000. [Jones 2010](https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks). |
| Brian’s Brain | Regla clásica 0→1 con dos vecinos activos; 1→2; 2→0. Doble búfer y toro. Las duraciones refractarias y vecindades distintas se identifican como variantes. [CelLab, implementación Brain](https://www.fourmilab.ch/cellab/manual/ruledef-js.html). |
| Competencia cíclica | Selección deja hueco, reproducción ocupa hueco y movilidad intercambia vecinos. N eventos asíncronos por paso con pesos relativos configurables; adaptación del proceso espacial, sin afirmar equivalencia temporal con eventos Poisson. [NetLogo Rock Paper Scissors](https://ccl.northwestern.edu/netlogo/models/RockPaperScissors). |
| Incendios | Vecindad cardinal, actualización simultánea y bordes cerrados. Preset clásico sin regeneración; rayos y rebrote son una extensión explícita. [NetLogo Fire](https://ccl.northwestern.edu/netlogo/models/Fire). |
| Arena | Umbral 4 y cada derrumbe transfiere exactamente cuatro granos. Se paralelizan derrumbes válidos en cada ronda, con sumas enteras y frontera disipativa. No entra arena durante una avalancha. [Bak–Tang–Wiesenfeld 1987](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381). |
| DLA | Caminatas cardinales, adhesión por contacto configurable, círculos de lanzamiento y descarte. No hay envoltura del cristal; detención al alcanzar el margen exterior. [NetLogo DLA y Witten–Sander](https://ccl.northwestern.edu/netlogo/models/DLA). |
| Schelling | Agentes abstractos de dos tipos, fracción sobre vecinos ocupados, orden aleatorio y una acción por agente. La lista de vacantes permite mudanzas sin solapamiento ni pérdida de individuos. [NetLogo Segregation](https://ccl.northwestern.edu/netlogo/models/Segregation). |
| Wireworld | Cuatro estados, ocho vecinos y actualización simultánea. Conductor→cabeza con una o dos cabezas vecinas; cabeza→cola→conductor. Frontera cerrada, también para el pincel. [Implementación Wireworld](https://wireworld.co/), [Golly](https://golly.sourceforge.io/Help/formats.html). |
| Luciérnagas | Kuramoto global: dθᵢ/dt = ωᵢ + K(S cos θᵢ − C sin θᵢ), donde S y C son promedios poblacionales. Cálculo O(N), Euler simultáneo Δt=0,04 y orden R=√(C²+S²). Las posiciones son visuales, no un vecindario espacial. [Estudio primario con ecuaciones](https://pmc.ncbi.nlm.nih.gov/articles/PMC3532102/). |
| Sistemas L | Reescritura paralela y tortuga con pila. Gramáticas de plantas de ABOP, más curva de Koch. Producciones editables sin ejecución de código, corchetes validados, máximo 80.000 símbolos y 18.000 segmentos. Animación por revelado; no se atribuye tiempo biológico. [Prusinkiewicz y Lindenmayer, capítulo 1](https://www.algorithmicbotany.org/papers/abop/abop-ch1.lowquality.pdf). |

Los modelos 11–20 tienen ejemplos, pinceles o acciones, telemetría, semillas, exportación/restauración y controles comunes. La navegación usa el catálogo para contar y recorrer las pestañas; los filtros no destruyen los mundos. Los modelos de generación finita (DLA y sistemas L) muestran un aviso al completar su desarrollo.

## Tiempo, persistencia y rendimiento

El Worker ejecuta pasos discretos completos con presupuesto de trabajo por ciclo, para poder atender comandos. El dibujo y la telemetría se envían a una frecuencia inferior. Acelerar modifica la cantidad de pasos, sin aumentar el paso numérico de los modelos continuos. El contador indica pasos del modelo, no segundos físicos compartidos entre modelos.

Cada motor usa un PRNG explícito con estado serializable. Los guardados incluyen el estado actual; no almacenan una reproducción cronológica de todas las intervenciones. Permiten continuar exactamente, mientras que repetir toda una sesión desde el inicio exigiría ejecutar las mismas intervenciones en los mismos pasos.

Se acotan las gráficas a 240 muestras. El plano abierto de Langton conserva hasta un millón de casillas pintadas y se detiene al alcanzar el límite. El ecosistema se detiene si supera 20.000 animales. La interfaz limita la incorporación manual de agentes en los modelos de enjambre. Las resoluciones son configurables; Lenia usa potencias de dos para la FFT.

Canvas 2D y Worker son suficientes para las resoluciones actuales. WebGL no es necesario para la primera versión completa; resultaría útil para futuros campos de alta resolución. La implementación FFT se verifica contra una convolución directa, no solo mediante capturas.

## Procedencia

`src/data/orbium.json` deriva de un patrón del catálogo original bajo MIT. `docs/lenia-provenance.json` registra commit, URL, huella y comprobación de extracción; `docs/LENIA_LICENSE.md` conserva el aviso del autor.

El código fuente de NetLogo tiene su propia licencia; no se ha copiado a la aplicación. Sus modelos se citan como referencias conceptuales y se declaran las adaptaciones.
