# OldAiLife

**Simple rules. Unexpected worlds.**

A local artificial-life playground with **20 interactive simulations**, a dark late-90s / early-2000s aesthetic, and plenty of room to experiment.

**English** · [Español](README.es.md)

[![CI](https://github.com/FernandoOleaDev/OldAiLife/actions/workflows/ci.yml/badge.svg)](https://github.com/FernandoOleaDev/OldAiLife/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-c0dc92.svg)](LICENSE)
[![Models: 20](https://img.shields.io/badge/Models-20-7dc9d1.svg)](#model-gallery)

![OldAiLife — eight of the twenty simulated worlds](docs/images/overview.png)

[Why this exists](#why-this-exists) · [Quick start](#quick-start) · [Model gallery](#model-gallery) · [Controls](#using-the-lab) · [Development](#development) · [Credits](#credits-and-references)

## Why this exists

Long before the current AI boom, I was fascinated by this kind of artificial intelligence as a kid: ants following simple rules, predators and prey sharing a world, and little systems that seemed to take on a life of their own.

OldAiLife is my way of returning to that curiosity. Pick a world, change a rule, speed up time, and watch what happens. Sometimes order appears. Sometimes everything collapses. Both are worth exploring.

— **Fernando Olea**

The collection brings together artificial life, cellular automata, agent-based models and other emergent systems. It includes older classics and newer additions such as Lenia and Physarum. The simulations run locally from explicit rules; they do not use a language model or require an AI service.

## What you can do

- Explore **20 independent worlds**, organized into six families.
- Start from curated presets, edit rules, and intervene with model-specific brushes.
- Pause, step forward, restart and accelerate time; compare requested and actual speed.
- Follow populations and other measurements in live charts.
- Save locally, export complete JSON states, import them later, and capture PNG images.
- Reproduce experiments with seeded randomness.
- Use zoom, panning, a grid, fullscreen and an optional CRT texture.

**Local-first:** no accounts, API keys, tracking, remote fonts or CDN dependencies during use. The initial dependency installation needs Internet access; the simulations then work with a local server. References only open when you click them.

> **Language:** the application UI is currently in **Spanish**. This README is available in English and Spanish; the language links switch documentation, not the application interface.

<details>
<summary>View the application interface (Spanish)</summary>

![OldAiLife running locally in Safari, showing Physarum and the model controls](docs/images/application.png)

</details>

## Quick start

Install **Node.js 22.12 or newer** and npm, then:

```sh
git clone https://github.com/FernandoOleaDev/OldAiLife.git
cd OldAiLife
npm ci
npm run dev
```

Open **[http://127.0.0.1:5174/](http://127.0.0.1:5174/)**. If that port is occupied, use the local URL printed by Vite. The server listens on `127.0.0.1`.

On macOS, you can also double-click [`Iniciar.command`](Iniciar.command) after installing Node.js. On other systems, use the terminal commands above.

For a production build served locally:

```sh
npm run build
npm run preview
```

The preview normally runs at **http://127.0.0.1:4173/**. Keep the terminal running while using the app. A suspended computer does not continue simulating.

## Model gallery

Each image shows an **actual seeded simulation state**, drawn by the same Canvas renderer used in the app. The surrounding English labels are documentation captions, not a translated app UI. Click an image for the full-size PNG. [Parameters, step counts and hashes](docs/images/manifest.json) are recorded, and `npm run screenshots` regenerates the gallery.

<table>
<tr>
<td width="50%" valign="top">
<h3>01 · Langton’s Ant</h3>
<a href="docs/images/langton.png"><img src="docs/images/langton.png" alt="Langton’s Ant — actual simulation state" width="480"></a>
<p>A tiny walker reads a cell, turns left or right, changes its color and moves on. A simple rule can produce a long, repeating highway.</p>
<p><strong>Try:</strong> Change the L/R sequence or let several ants share the board.</p>
<p><a href="https://www.mat-unab.cl/~hellouin/Articles/Turmites.pdf">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>02 · Wa-Tor</h3>
<a href="docs/images/wator.png"><img src="docs/images/wator.png" alt="Wa-Tor — actual simulation state" width="480"></a>
<p>Fish reproduce; sharks eat fish and starve when food runs out. Population cycles emerge from local movement and limited space.</p>
<p><strong>Try:</strong> Start with one shark and adjust breeding and starvation periods.</p>
<p><a href="https://www.leinweb.com/snackbar/wator/">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>03 · Wolves, Sheep &amp; Grass</h3>
<a href="docs/images/ecosystem.png"><img src="docs/images/ecosystem.png" alt="Wolves, Sheep &amp; Grass — actual simulation state" width="480"></a>
<p>An energy-based ecosystem adds a renewable resource: grass. Sheep feed on grass, wolves feed on sheep, and reproduction shares available energy.</p>
<p><strong>Try:</strong> Change grass regrowth and see whether both animal populations survive.</p>
<p><a href="https://ccl.netlogo.org/netlogo/models/WolfSheepPredation">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>04 · Conway’s Game of Life</h3>
<a href="docs/images/life.png"><img src="docs/images/life.png" alt="Conway’s Game of Life — actual simulation state" width="480"></a>
<p>Cells are born and survive according to their eight neighbors. Still lifes, oscillators and moving patterns emerge from simultaneous updates.</p>
<p><strong>Try:</strong> Launch a Gosper glider gun, then explore HighLife or Seeds.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/Life">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>05 · Elementary Cellular Automata</h3>
<a href="docs/images/wolfram.png"><img src="docs/images/wolfram.png" alt="Elementary Cellular Automata — actual simulation state" width="480"></a>
<p>Each cell in a new row depends on three cells in the previous row. Eight binary decisions define one of 256 possible rules.</p>
<p><strong>Try:</strong> Compare the triangles of rule 90 with rules 30, 110 and 184.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/CA1DElementary">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>06 · Boids</h3>
<a href="docs/images/boids.png"><img src="docs/images/boids.png" alt="Boids — actual simulation state" width="480"></a>
<p>Agents steer using separation, alignment and cohesion. Each one reacts to nearby neighbors, yet the group behaves like a flock.</p>
<p><strong>Try:</strong> Increase alignment, weaken cohesion or draw an attraction point.</p>
<p><a href="https://www.red3d.com/cwr/boids/">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>07 · Ant Colony</h3>
<a href="docs/images/ants.png"><img src="docs/images/ants.png" alt="Ant Colony — actual simulation state" width="480"></a>
<p>Foragers search for food and leave pheromone trails on the way home. Diffusion and evaporation let paths form, compete and disappear.</p>
<p><strong>Try:</strong> Move food, build walls or adjust pheromone evaporation.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/Ants">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>08 · Gray–Scott Reaction–Diffusion</h3>
<a href="docs/images/reaction.png"><img src="docs/images/reaction.png" alt="Gray–Scott Reaction–Diffusion — actual simulation state" width="480"></a>
<p>Two chemical concentrations react and diffuse over a grid. Small changes in feed and removal rates can turn spots into stripes or moving structures.</p>
<p><strong>Try:</strong> Switch presets, then paint a disturbance into the chemical field.</p>
<p><a href="https://www.karlsims.com/rd.html">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>09 · Particle Life</h3>
<a href="docs/images/particles.png"><img src="docs/images/particles.png" alt="Particle Life — actual simulation state" width="480"></a>
<p>Colored particle types attract or repel each other through an editable interaction matrix. Asymmetric relationships create chasing and clustering.</p>
<p><strong>Try:</strong> Make one type chase another that repels it.</p>
<p><a href="https://particle-life.com/java-framework/accelerators.html">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>10 · Lenia</h3>
<a href="docs/images/lenia.png"><img src="docs/images/lenia.png" alt="Lenia — actual simulation state" width="480"></a>
<p>A continuous cellular automaton combines a neighborhood kernel with a growth function. The included Orbium pattern comes from Bert Chan’s original catalog.</p>
<p><strong>Try:</strong> Start with Orbium or a colony; make small, careful parameter changes.</p>
<p><a href="https://chakazul.github.io/lenia.html">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>11 · Physarum Networks</h3>
<a href="docs/images/physarum.png"><img src="docs/images/physarum.png" alt="Physarum Networks — actual simulation state" width="480"></a>
<p>Particles sense and deposit a diffusing chemical trail. Local steering and one-particle-per-cell exclusion produce networks that reorganize themselves.</p>
<p><strong>Try:</strong> Paint persistent food sources and compare sensor angles.</p>
<p><a href="https://uwe-repository.worktribe.com/output/980579/characteristics-of-pattern-formation-and-evolution-in-approximations-of-physarum-transport-networks">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>12 · Brian’s Brain</h3>
<a href="docs/images/brain.png"><img src="docs/images/brain.png" alt="Brian’s Brain — actual simulation state" width="480"></a>
<p>Cells cycle through resting, firing and refractory states. Exactly two firing neighbors trigger a resting cell in the classic rule.</p>
<p><strong>Try:</strong> Introduce a spark or lengthen the refractory period to create a variant.</p>
<p><a href="https://www.fourmilab.ch/cellab/manual/ruledef-js.html">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>13 · Rock–Paper–Scissors</h3>
<a href="docs/images/cyclic.png"><img src="docs/images/cyclic.png" alt="Rock–Paper–Scissors — actual simulation state" width="480"></a>
<p>Three species compete in a cycle: each defeats one and loses to another. Selection, reproduction and movement create shifting spatial territories.</p>
<p><strong>Try:</strong> Increase mobility or begin with three separate territories.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/RockPaperScissors">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>14 · Forest Fire</h3>
<a href="docs/images/forest.png"><img src="docs/images/forest.png" alt="Forest Fire — actual simulation state" width="480"></a>
<p>Fire spreads to four neighboring trees, leaving ash behind. Optional regrowth and lightning extend the classic one-off fire into a dynamic forest.</p>
<p><strong>Try:</strong> Compare dense and sparse forests, or draw a firebreak.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/Fire">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>15 · Abelian Sandpile</h3>
<a href="docs/images/sandpile.png"><img src="docs/images/sandpile.png" alt="Abelian Sandpile — actual simulation state" width="480"></a>
<p>A cell with four or more grains topples, sending one grain to each cardinal neighbor. Grains leaving the boundary are lost; new input waits for stability.</p>
<p><strong>Try:</strong> Drop a large central pile or add slow, random rainfall.</p>
<p><a href="https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.59.381">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>16 · Diffusion-Limited Aggregation</h3>
<a href="docs/images/dla.png"><img src="docs/images/dla.png" alt="Diffusion-Limited Aggregation — actual simulation state" width="480"></a>
<p>Random walkers attach to an existing aggregate. Exposed tips collect more particles than sheltered gaps, producing branching mineral-like forms.</p>
<p><strong>Try:</strong> Compare four- and eight-neighbor contact or lower adhesion probability.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/DLA">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>17 · Schelling Segregation</h3>
<a href="docs/images/schelling.png"><img src="docs/images/schelling.png" alt="Schelling Segregation — actual simulation state" width="480"></a>
<p>Two abstract agent types relocate when too few occupied neighbors match their type. Local preferences can lead to large-scale clusters.</p>
<p><strong>Try:</strong> Compare no preference, a moderate threshold and a demanding one.</p>
<p><a href="https://ccl.northwestern.edu/netlogo/models/Segregation">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>18 · Wireworld</h3>
<a href="docs/images/wireworld.png"><img src="docs/images/wireworld.png" alt="Wireworld — actual simulation state" width="480"></a>
<p>Four states model signal propagation: empty, conductor, electron head and electron tail. Simple neighborhood rules keep pulses moving through drawn circuits.</p>
<p><strong>Try:</strong> Build a wire or a loop, then place a head followed by a tail.</p>
<p><a href="https://wireworld.co/">Reference ↗</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>19 · Kuramoto Fireflies</h3>
<a href="docs/images/fireflies.png"><img src="docs/images/fireflies.png" alt="Kuramoto Fireflies — actual simulation state" width="480"></a>
<p>Globally coupled phase oscillators are displayed as flashing lights. The order parameter measures how closely their phases align.</p>
<p><strong>Try:</strong> Turn coupling off, then increase it and watch synchronization emerge.</p>
<p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3532102/">Reference ↗</a></p>
</td>
<td width="50%" valign="top">
<h3>20 · L-System Garden</h3>
<a href="docs/images/lsystem.png"><img src="docs/images/lsystem.png" alt="L-System Garden — actual simulation state" width="480"></a>
<p>Parallel rewriting expands a small grammar; a turtle interprets its symbols as branches and turns. The animation reveals the resulting geometry.</p>
<p><strong>Try:</strong> Edit the F/X productions, branch angle and generation count.</p>
<p><a href="https://www.algorithmicbotany.org/papers/abop/abop-ch1.lowquality.pdf">Reference ↗</a></p>
</td>
</tr>
</table>
## Using the lab

| Control in the app | What it does |
| --- | --- |
| Family filters / model tabs | Switch experiments. Each tab retains its world; only the active one advances. |
| **Punto de partida** | Load a preset with its own starting conditions. Some presets include warm-up steps, shown in the counter. |
| **Iniciar / Pausar**, step and restart | Run continuously, advance one step, or restart with the selected parameters and seed. |
| **VELOCIDAD** | Request 1–10,000 steps/s. The actual rate depends on the model and hardware. |
| **EN VIVO** | Apply a parameter to the existing world. |
| **INICIO** | Stage a change; **Aplicar y reiniciar** rebuilds the world. |
| Brushes | Add organisms, draw matter or resources, erase cells, or trigger model-specific actions. |
| **Guardar aquí** | Save to this browser's IndexedDB; the active world is also autosaved every 20 seconds. |
| **Exportar / Importar JSON** | Transfer a complete state, including parameters, seed and random-generator state. |
| **Captura PNG** | Download the current world view. |

**Keyboard:** `Space` toggles playback, `N` advances one step, `R` restarts, and `F` fits the view. On focused model tabs, `←` / `→`, `Home` and `End` navigate the current family. `Shift` + drag pans; `Ctrl` / `Cmd` + wheel zooms.

Browser saves belong to a specific origin: `localhost`, `127.0.0.1` and different ports have separate storage. Use JSON to move experiments between them. Chart history starts fresh after loading a state. Background tabs may be throttled by the browser.

### Understanding what you see

- **Coexistence is an outcome, not a guarantee.** Species can go extinct; a model is not silently reseeded to keep the screen busy.
- **Update order and boundaries matter.** Some worlds wrap around, while sandpiles dissipate grains at their edges and DLA stops before reaching the border.
- **Playback speed does not change the numerical time step.** Faster playback repeats more simulation steps.
- **Variations are labeled.** The model notes distinguish canonical rules from adaptations and experimental settings.
- **The models have different meanings of time.** L-system playback reveals segments of a chosen generation; Kuramoto lights visualize phase oscillators. These are not biological predictions.

Open **Ver detalles** in a model's notebook for implementation notes and source links.

## How it is built

**TypeScript + Vite + Canvas 2D + a Web Worker.** The worker advances the simulations while the main thread handles controls, rendering and charts. There is no backend, database service or runtime UI framework.

```text
src/
  catalog.ts, catalog-extra.ts   Model descriptions, controls and presets
  models/                       Twenty simulation engines
  core/                         State, seeded randomness, spatial bins and FFT
  worker.ts                     Simulation scheduling and messages
  render.ts                     Canvas worlds and charts
  main.ts, style.css            Interface and retro visual design
  storage.ts                    Local IndexedDB saves
  data/orbium.json               Attributed Lenia pattern
scripts/                        Benchmarks and reproducible gallery generation
tests/                          Model rules, invariants, persistence and worker integration
docs/                           References, validation notes and images
```

The engines use typed arrays for grid fields, spatial bins for relevant agent interactions, and FFT convolution for Lenia. Every model has serializable state and a seeded random generator.

## Development

```sh
npm test                 # Rules, invariants, save/restore and worker integration
npm run build            # Type checking and production build
npm run benchmark        # 1,000 steps per model; writes docs/benchmark.json
npm run screenshots      # Rebuild the 20 gallery images and overview
npm run format           # Format source, tests and scripts
```

The current suite has **53 passing tests**, including known cellular patterns, predator reproduction and starvation, mass conservation, Physarum occupancy, Wireworld signals, Kuramoto synchronization, L-system rewriting, and exact continuation after JSON restoration. GitHub Actions runs the tests and build on pushes and pull requests.

Benchmarks measure engine execution in Node, **not browser FPS**. Finite generators such as DLA and L-systems do little work after completion; their later steps should not be interpreted as active-growth throughput. Tests establish the checked behavior, not universal stability or scientific fidelity.

## Contributing

Issues and pull requests are welcome in **English or Spanish**. Useful contributions include new models, presets, translations, accessibility improvements and performance work.

Read [CONTRIBUTING.md](CONTRIBUTING.md). For a bug, include the model, seed, settings and an exported state if possible. [Open an issue](https://github.com/FernandoOleaDev/OldAiLife/issues).

## Credits and references

This project builds on the ideas of Christopher Langton, John Horton Conway, Stephen Wolfram, Craig Reynolds, A. K. Dewdney, Uri Wilensky and the NetLogo community, Bert Chan, Jeff Jones, Brian Silverman, Bak–Tang–Wiesenfeld, Witten–Sander, Thomas Schelling, Yoshiki Kuramoto, Aristid Lindenmayer, Przemysław Prusinkiewicz, and other researchers and implementers linked in each model.

The simulation implementations are written for this project. The **Orbium O2u pattern** is derived from [Bert Chan’s Lenia catalog](https://github.com/Chakazul/Lenia), with its [MIT notice](docs/LENIA_LICENSE.md) and [provenance record](docs/lenia-provenance.json) preserved. NetLogo models are conceptual references; their source code has not been copied into this application.

More background, currently in Spanish: [implementation decisions and references](docs/IMPLEMENTACION.md), [validation scope](docs/VERIFICACION.md), and the [initial research plan](PLAN_INICIAL.md).

## License

[MIT](LICENSE) © 2026 Fernando Olea. Third-party material retains its own attribution and license notices.
