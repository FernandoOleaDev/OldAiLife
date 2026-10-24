# OldAiLife — investigación y plan inicial

24 de octubre de 2026 · Informe previo a la implementación. La aplicación ya está implementada; consulta [README.md](README.md) y [la verificación](docs/VERIFICACION.md).

**Propuesta:** una web local, en español, que funcione como laboratorio de vida artificial: elegir un experimento, cambiar sus reglas, intervenir sobre el mundo y observar qué ocurre al acelerar el tiempo. El directorio está vacío; no hay una aplicación previa que condicione la arquitectura.

## Los modelos que buscas

**Hormiga de Langton, de Christopher Langton (1986).** En su versión clásica, una hormiga lee la casilla: sobre blanco gira 90° a la derecha; sobre negro, a la izquierda. Después invierte el color y avanza. La generalización permite varios colores y una secuencia de giros, como `RL` o `RRL`: cada visita aplica el giro correspondiente y pasa al siguiente color. Varias hormigas y otras condiciones iniciales amplían los experimentos. [Referencia académica sobre Langton y turmites](https://www.mat-unab.cl/~hellouin/Articles/Turmites.pdf).

**Depredadores y presas.** Peces y tiburones corresponde a **Wa-Tor**, presentado por A. K. Dewdney en 1984: una cuadrícula con bordes conectados, movimiento, reproducción y muerte por hambre. Los tiburones buscan peces en las casillas vecinas. Hay implementaciones con reglas distintas, por lo que nuestra ficha deberá indicar qué variante ejecuta. [Publicación original](https://www.scientificamerican.com/article/computer-recreations-1984-12/) y [reglas de la implementación de Larry Leinweber](https://www.leinweb.com/snackbar/wator/).

**Lobos–ovejas–hierba** es otro modelo de esa familia. Añade un recurso que las ovejas consumen y que vuelve a crecer, con consecuencias para ambas poblaciones. Lo trataría como un experimento propio dentro de «Ecosistemas». Puede haber coexistencia con oscilaciones o extinción; conseguir un equilibrio es algo que explorar. [Modelo documentado por NetLogo](https://ccl.netlogo.org/netlogo/models/WolfSheepPredation).

El conjunto encaja en vida artificial, autómatas y sistemas emergentes. Para estas primeras simulaciones basta con programar reglas locales; no requieren entrenamiento de modelos.

## Catálogo propuesto

Selección representativa, ampliable. La prioridad y dificultad son estimaciones de implementación propias, considerando que ya existe la interfaz común.

| Experimento | Qué permite observar y configurar | Prioridad / esfuerzo |
| --- | --- | --- |
| Hormiga de Langton y variantes | Dibujos emergentes; giros, colores, hormigas y patrón inicial. | Inicial / bajo |
| Wa-Tor | Ciclos de peces y tiburones; poblaciones, reproducción y hambre. | Inicial / medio |
| Lobos–ovejas–hierba | Efecto de recursos limitados; energía, reproducción y regeneración. | Inicial / medio |
| [Juego de la Vida de Conway](https://ccl.northwestern.edu/netlogo/models/Life) | Células que forman estructuras estables, osciladores y figuras móviles; dibujo y reglas de nacimiento/supervivencia. | Siguiente / bajo |
| [Autómatas elementales de Wolfram](https://ccl.northwestern.edu/netlogo/models/CA1DElementary) | Patrones por filas; explorar las 256 reglas, con accesos a 30, 90 y 110. | Siguiente / bajo |
| [Boids, de Craig Reynolds](https://www.red3d.com/cwr/boids/) | Bandadas y bancos de peces; separación, alineación y cohesión. | Ampliación / medio |
| [Hormigas con feromonas](https://ccl.northwestern.edu/netlogo/models/Ants) | Búsqueda colectiva de comida; nido, alimento, difusión y evaporación del rastro. | Ampliación / medio |
| [Reacción-difusión Gray–Scott](https://www.karlsims.com/rd.html) | Manchas, laberintos y formas que se dividen; difusión y tasas de alimentación/eliminación. | Posterior / medio-alto |
| [Particle Life](https://particle-life.com/java-framework/settings.html) | Partículas de tipos distintos; editar una matriz de interacciones para explorar agrupaciones. | Posterior / medio-alto |
| [Lenia, de Bert Chan](https://chakazul.github.io/lenia.html) | Autómatas continuos con formas que recuerdan a microorganismos; patrones y parámetros de crecimiento. | Posterior / alto |

Las hormigas con feromonas serían un módulo adicional: siguen rastros químicos y buscan alimento. La hormiga de Langton transforma casillas siguiendo una regla determinista.

## Primera versión utilizable

**Pantalla:** biblioteca de experimentos, mundo central grande, panel lateral de controles y gráficas inferiores. Cada experimento tendrá una explicación breve, fuente, reglas efectivas y varios ejemplos preparados.

**Controles compartidos:** iniciar/pausar, avanzar un paso, reiniciar con la misma configuración, generar otra semilla, acelerar, zoom, desplazamiento y pantalla completa. Mostrar pasos simulados y velocidad real alcanzada. Añadir captura PNG y guardado/carga de experimentos en JSON.

**Langton:** modo clásico con una hormiga y tablero vacío; editor de secuencias `L/R`, paleta, cantidad, posición y orientación de hormigas; pincel para pintar/borrar casillas. Incluir `RL`, `LR` y variantes multicolor revisadas visualmente. Usar un plano que pueda crecer para el modo clásico; ofrecer tablero cerrado con bordes conectados como variante explícita. Con varias hormigas, fijar orden de actualización por identificador y permitir compartir casilla; documentar que las posteriores leen los cambios de las anteriores.

**Ecosistemas:** pestañas Wa-Tor y lobos–ovejas–hierba, con poblaciones iniciales, tamaño del mundo y parámetros propios. Wa-Tor tendrá intervalos de reproducción y tolerancia al hambre; la versión terrestre, energía, probabilidad de reproducción y regeneración de hierba. Poder colocar o retirar individuos con el ratón, incluso añadir un único lobo durante una ejecución. Gráficas de poblaciones y recursos, contador de nacimientos/muertes y aviso de extinción. Conservar el estado final para inspeccionarlo.

Los cambios compatibles se aplicarán en el siguiente paso y quedarán registrados. Cambiar dimensiones o familia de reglas requerirá reiniciar explícitamente. Preparar ejemplos para estudiar coexistencia y colapso, comprobados con semillas concretas.

## Implementación local

- **Vite + TypeScript y HTML/CSS**, con Canvas 2D para el mundo. Una interfaz pequeña puede empezar sin framework. Arranque previsto mediante `npm install` y `npm run dev`, accesible en `localhost`; esos comandos se crearán durante la implementación. [Documentación de Vite](https://vite.dev/guide/).
- **Cálculo en un Web Worker**, separado de controles y dibujo para mantener la interfaz utilizable al acelerar. Un contrato común —iniciar, avanzar, intervenir, medir y guardar/cargar— permitirá añadir módulos con estructuras internas diferentes. [Documentación de Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).
- **Tiempo independiente de los fotogramas:** acelerar ejecutará más pasos completos, conservando las reglas. En modelos continuos se mantendrá el paso numérico y se aumentarán las iteraciones. Dibujar y actualizar gráficas con menor frecuencia que el cálculo.
- **Estructuras sencillas:** arrays tipados para cuadrículas, bloques dispersos para el plano creciente de Langton y vecindarios espaciales para futuras bandadas/partículas. Evaluar WebGL cuando las mediciones lo justifiquen, especialmente para Lenia.
- **Persistencia local:** IndexedDB para partidas y preferencias; JSON versionado para exportar. Guardar modelo, configuración, estado del mundo, generador aleatorio y paso actual. La semilla reproduce el inicio; continuar exactamente necesita el estado completo. Registrar también intervenciones si queremos repetir toda la sesión.
- **Uso sin conexión:** empaquetar código, fuentes y ejemplos localmente. Tras instalar las dependencias, la simulación funcionará sin Internet con el servidor local activo. El equipo suspendido detendrá el cálculo; una partida guardada permitirá retomarlo.

Separación prevista: `src/core/`, `src/models/`, `src/render/`, `src/ui/` y `src/presets/`. NetLogo sirve como referencia de modelos y experimentación; la interfaz propuesta se implementaría aquí con código propio.

## Orden de trabajo y comprobación

1. **Base + Langton.** Montar interfaz, ejecución por pasos, pinceles, reglas configurables y guardado. Verificar los primeros movimientos y que cargar una partida permite continuar el mismo recorrido.
2. **Ecosistemas.** Añadir Wa-Tor y la variante terrestre, intervención manual y gráficas. Fijar el orden de actualización; cada individuo actuará como máximo una vez por paso y los nacidos esperarán al siguiente. Comprobar reproducción, hambre, ocupación y coherencia entre mundo y contadores.
3. **Cerrar la primera versión.** Misma semilla y mismas intervenciones deben dar el mismo estado al mismo paso, aunque cambie la velocidad. Probar importación/exportación, uso sin red y sesiones largas con historial acotado. Medir rendimiento en este Mac antes de fijar tamaños y velocidades máximas.
4. **Ampliar el catálogo.** Conway y Wolfram primero; después Boids y feromonas. Abordar Gray–Scott, Particle Life y Lenia según el interés visual y el rendimiento medido.

Los algoritmos iniciales son relativamente pequeños. El trabajo principal estará en hacer cómodos los controles, definir las variantes sin ambigüedad y conservar resultados reproducibles. La primera entrega propuesta contiene los dos espacios solicitados —Hormigas y Ecosistemas— con tres simulaciones concretas.
