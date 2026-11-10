# @race-planner/engine

Open source engine for planning endurance race strategy from the course itself.

- **GPX → course**: distance, smoothed elevation profile and elevation gain without GPS noise.
- **Grade-based segments**: splits the course into segments of consistent gradient.
- **Grade-adjusted pace**: distributes effort for a target time using Minetti's (2002) energy cost model.
- **Fueling**: carbs per hour based on duration and fluid based on your sweat rate, with an intake schedule.

No server or framework dependencies: it runs in Node, in the browser and in React Native.

## Usage

```ts
import { parseCourse, planFueling, planForTargetTime, segmentCourse } from '@race-planner/engine';

const course = parseCourse(gpxString);
console.log(course.totalDistanceM, course.elevationGainM);

const segments = segmentCourse(course.profile, { minLengthM: 500, maxLengthM: 5000 });

// Even effort to finish in 3h28
const pace = planForTargetTime(segments, 3 * 3600 + 28 * 60);
pace.segments.forEach((s) => console.log(s.startM, s.endM, s.grade, s.targetPaceSPerKm));

const fuel = planFueling({ durationS: pace.totalDurationS, sweatRateMlPerH: 800 });
console.log(fuel.carbsGPerH, fuel.schedule);
```

## API

| Function                                 | What it does                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `parseCourse(xml, opts?)`                | GPX → `Course` (profile, distance, elevation). Options: `smoothingWindowM` (100), `elevationThresholdM` (1).      |
| `parseGpxPoints(xml)`                    | Raw GPX points (tracks or routes). Throws `GpxParseError` if invalid.                                             |
| `segmentCourse(profile, opts?)`          | Segments of consistent gradient. Options: `minLengthM` (500), `maxLengthM` (5000), `gradeChangeThreshold` (0.02). |
| `planForTargetTime(segments, timeS)`     | Pace per segment for a target time.                                                                               |
| `planFromFlatPace(segments, paceSPerKm)` | Pace per segment from your flat-ground pace.                                                                      |
| `gradePaceFactor(grade)`                 | Pace factor for a gradient (1 = flat).                                                                            |
| `planFueling(input)`                     | Carbs, fluid and intake schedule.                                                                                 |

All distances are in meters, times in seconds and gradients as fractions (`0.05` = 5%).

## Models and limitations

This engine gives you a **starting point**, not a prescription. Every athlete should validate it in training.

- **Grade-adjusted pace**: uses the energy cost polynomial from Minetti et al. (2002, _J Appl Physiol_ 93:1039–1046) and assumes constant metabolic power. The model overestimates the gain on steep descents, so the factor is capped (`minDownhillFactor`, 0.85 by default). It does not account for terrain, wind or fatigue.
- **Carbohydrates**: follows common endurance guidelines (e.g. Jeukendrup, 2014, _Sports Med_): 0 to 90 g/h depending on duration. High intakes require gut training and glucose+fructose blends.
- **Fluid**: replaces 70% of the sweat rate you provide by default. Without that figure, no fluid is suggested.
- **Not implemented yet**: heat and humidity adjustment, cycling and swimming models.

## Development

```bash
npm install
npm test -w @race-planner/engine        # tests with Vitest
npm run build -w @race-planner/engine   # builds to dist/
```

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## License

[MIT](./LICENSE)
