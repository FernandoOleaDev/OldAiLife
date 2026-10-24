# Verificación de la entrega

24 de octubre de 2026. Colección ampliada de diez a veinte modelos.

- `npm run build`: correcto. TypeScript sin errores; salida estática de aproximadamente 165 kB sin comprimir, incluyendo el Worker y los estilos.
- `npm test`: **53 pruebas aprobadas**. Incluyen los veinte motores, patrones conocidos, semillas reproducibles, validación de partidas y continuidad exacta tras exportar/importar.
- Integración del Worker real: selección de las veinte pestañas, avance, pinceles, guardado, restauración, modificación de parámetros, ejecución y pausa.
- Todos los ejemplos de los diez modelos nuevos arrancan, avanzan y se restauran con continuidad exacta.
- Invariantes nuevos: exclusión de partículas Physarum; pulso Wireworld conservado durante 400 pasos; balance de masa y disipación de arena; conectividad de DLA; propagación cardinal del fuego; conservación de poblaciones de Schelling; movilidad cíclica; sincronización de Kuramoto; reescritura y pila de sistemas L; pinceles recortados en fronteras cerradas.
- Benchmark: 1.000 pasos por modelo en Node en este Mac, resultados en `benchmark.json`. No mide FPS de la interfaz. DLA y sistemas L dejan de cambiar al completar su desarrollo; sus pasos posteriores son muy baratos y no representan velocidad de crecimiento activo.
- Con semilla 1997, tras 1.000 pasos, Wa-Tor conserva ambas especies; el ecosistema conserva lobos y ovejas; la competencia cíclica conserva sus tres especies. No se garantiza coexistencia indefinida ni para todas las semillas.
- Physarum conserva 2.457 partículas; Brian’s Brain mantiene actividad; Wireworld conserva 16 pulsos. Schelling llega al 100 % de satisfacción y Kuramoto alcanza un orden de 99,7 % en ese ensayo.
- Orbium original conserva masa aproximada 73,84 tras 1.000 pasos, frente a 76,86 inicial; estados en [0,1].
- Servidor local: `http://127.0.0.1:5174/`. Compilación estática en `dist/`.
- Sin scripts, estilos o fuentes de CDN durante el uso. Los enlaces externos son referencias abiertas por acción del usuario.

## Revisión de navegador

Se comprobó en Chrome el arranque y avance de los diez modelos nuevos, sus controles y telemetría. Se inspeccionaron visualmente las redes de Physarum, el cristal DLA y el desarrollo completo de la planta de sistemas L. Se probó pausa, el filtro Patrones, navegación con flechas y la tecla Fin dentro del conjunto filtrado.

La vista móvil se revisó con emulación iPhone SE de Chrome (375 × 667): cabecera, filtros, las veinte pestañas, controles de tiempo, monitor de luciérnagas, pinceles, gráficas y comienzo del panel de configuración. No se observaron desbordamientos en esas vistas. No equivale a una prueba en un dispositivo físico ni a una revisión de cada combinación de parámetros.

La consola observada mostró únicamente mensajes de Vite, sin errores de aplicación. Se dejó Chrome en escritorio, con Physarum abierto y funcionando. Las incidencias del control de ventanas de la revisión inicial no impidieron esta segunda revisión.
