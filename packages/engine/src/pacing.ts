import type { CourseSegment } from './types';

/** Gradient range over which Minetti's model was measured (±45%). */
export const MINETTI_GRADE_LIMIT = 0.45;

/**
 * Energy cost of running on a gradient, in J/kg/m.
 * Minetti et al. (2002), J Appl Physiol 93:1039–1046. `grade` is a fraction.
 * Outside ±45% it is clamped to the edge of the measured range.
 */
export function minettiCostOfRunning(grade: number): number {
  const i = Math.max(-MINETTI_GRADE_LIMIT, Math.min(MINETTI_GRADE_LIMIT, grade));
  return 155.4 * i ** 5 - 30.4 * i ** 4 - 43.3 * i ** 3 + 46.3 * i ** 2 + 19.5 * i + 3.6;
}

/**
 * Factor to multiply the flat-ground pace by to get an equivalent-effort
 * pace on that gradient (>1 = slower).
 *
 * Assumes constant metabolic power. The model tends to overestimate the gain
 * on steep descents, so it is capped with `minDownhillFactor`.
 */
export function gradePaceFactor(grade: number, minDownhillFactor = 0.85): number {
  const factor = minettiCostOfRunning(grade) / minettiCostOfRunning(0);
  return Math.max(minDownhillFactor, factor);
}

export interface PacedSegment extends CourseSegment {
  /** Target pace in seconds per km. */
  targetPaceSPerKm: number;
  /** Estimated segment duration in seconds. */
  durationS: number;
}

export interface PacePlan {
  segments: PacedSegment[];
  totalDurationS: number;
  /** Flat-ground pace that produces the target time. */
  flatPaceSPerKm: number;
}

function applyFactors(segments: CourseSegment[], flatPace: number, minDownhillFactor: number) {
  return segments.map((s) => {
    const targetPaceSPerKm = flatPace * gradePaceFactor(s.grade, minDownhillFactor);
    return { ...s, targetPaceSPerKm, durationS: (targetPaceSPerKm * (s.endM - s.startM)) / 1000 };
  });
}

/** Distributes effort from a known flat-ground pace. */
export function planFromFlatPace(
  segments: CourseSegment[],
  flatPaceSPerKm: number,
  minDownhillFactor = 0.85,
): PacePlan {
  const paced = applyFactors(segments, flatPaceSPerKm, minDownhillFactor);
  return {
    segments: paced,
    totalDurationS: paced.reduce((sum, s) => sum + s.durationS, 0),
    flatPaceSPerKm,
  };
}

/**
 * Distributes effort to finish in `targetTimeS` at an even effort:
 * slower uphill, faster downhill.
 */
export function planForTargetTime(
  segments: CourseSegment[],
  targetTimeS: number,
  minDownhillFactor = 0.85,
): PacePlan {
  if (targetTimeS <= 0) throw new RangeError('Target time must be positive');
  // Total time is linear in the flat pace, so we can solve for it directly
  const weightedKm = segments.reduce(
    (sum, s) => sum + (gradePaceFactor(s.grade, minDownhillFactor) * (s.endM - s.startM)) / 1000,
    0,
  );
  if (weightedKm <= 0) throw new RangeError('The course has no distance');
  return planFromFlatPace(segments, targetTimeS / weightedKm, minDownhillFactor);
}
