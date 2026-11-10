# Contributing

Thanks for wanting to help! A few rules to keep the engine reliable.

## Principles

1. **Every model needs a source.** If you add or change a physiological calculation, cite the study or reference it's based on in the code and explain its limitations in the README.
2. **No heavy dependencies.** The engine must run in Node, in the browser and in React Native. No Node APIs (`fs`, `path`…) in `src/`.
3. **Pure functions.** Input → output, no global state or side effects.
4. **SI units in the API**: meters, seconds and gradients as fractions. Conversions to km or min/km happen in the UI.

## Workflow

1. Open an issue describing the change, especially if it touches a model.
2. Create a branch from `main`.
3. Add tests covering the new case. `npm test -w @race-planner/engine` must pass.
4. Update `CHANGELOG.md` under the `Unreleased` section.
5. Open the PR.

## Open ideas

- Pace adjustment for temperature and humidity.
- Cycling: power per segment from FTP, weight and CdA.
- Reading FIT and TCX files.
- Detecting aid stations from GPX waypoints.
