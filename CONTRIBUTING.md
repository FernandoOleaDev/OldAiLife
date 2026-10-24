# Contributing to OldAiLife

Bug reports, new presets, translations and new artificial-life models are welcome. You can open issues in English or Spanish.

## Get started

1. Fork the repository and create a branch.
2. Install Node.js 22.12+ and run `npm ci`.
3. Start the local app with `npm run dev`.
4. Before opening a pull request, run `npm test` and `npm run build`.

Describe what changed, why it helps, and how you checked it. Include a screenshot for visual changes. For a simulation bug, include the model, seed, parameters, step number and, if possible, an exported JSON state.

## Adding a model

- Keep the engine independent from the DOM. Extend `Model` and register it in `src/models/index.ts`.
- Add its controls, presets, explanation, sources and declared adaptations to the catalog.
- Use the seeded random generator. Keep mutable simulation state serializable and validate imported states.
- Make update order and boundary conditions explicit. Prefer a primary paper, an author's implementation or an established reference model.
- Test meaningful rules or invariants, plus save/restore continuity. Avoid visual-only assertions of scientific fidelity.
- Update both READMEs and the gallery. `npm run screenshots` captures seeded states with the application renderer; its settings are in `scripts/screenshots.ts`.

Please keep the app local-first: no accounts, trackers, API keys or remote runtime dependencies. Avoid silently reseeding extinct populations or changing a simulation's numerical time step when the user changes playback speed.

## Translations and attribution

`README.md` is the main English document; `README.es.md` is its Spanish counterpart. The application UI currently uses Spanish. Keep those distinctions clear when adding translations.

Preserve attribution and licenses for any third-party material. The included Orbium pattern has its own MIT notice in `docs/LENIA_LICENSE.md`.
