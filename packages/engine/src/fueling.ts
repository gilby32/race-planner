export interface FuelingInput {
  /** Expected duration in seconds. */
  durationS: number;
  /** Sweat rate in ml/h (measured by weighing yourself before and after training). */
  sweatRateMlPerH?: number;
  /** Maximum carbs per hour the athlete tolerates (trained). */
  maxCarbsGPerH?: number;
  /** Fraction of sweat loss to replace. Defaults to 0.7. */
  fluidReplacementRatio?: number;
  /** How often to take something, in minutes. Defaults to 20. */
  intervalMin?: number;
}

export interface FuelingStep {
  /** Race minute at which to take it. */
  atMin: number;
  carbsG: number;
  fluidMl: number;
}

export interface FuelingPlan {
  carbsGPerH: number;
  fluidMlPerH: number;
  totalCarbsG: number;
  totalFluidMl: number;
  schedule: FuelingStep[];
}

/**
 * Recommended carbs per hour by duration, following common endurance
 * sports nutrition guidelines
 * (e.g. Jeukendrup, 2014, Sports Med 44 Suppl 1:S25–33):
 * - under 45 min: not needed
 * - 45–75 min: small amounts (mouth rinse / ~15 g/h)
 * - 1–2 h: up to 30 g/h
 * - 2–2.5 h: up to 60 g/h
 * - over 2.5 h: up to 90 g/h (with glucose+fructose blends)
 *
 * It's a starting point: every athlete needs to train their tolerance.
 */
export function recommendedCarbsGPerH(durationS: number): number {
  const h = durationS / 3600;
  if (h < 0.75) return 0;
  if (h < 1.25) return 15;
  if (h < 2) return 30;
  if (h < 2.5) return 60;
  return 90;
}

/** Carb and fluid plan spread over regular intervals. */
export function planFueling(input: FuelingInput): FuelingPlan {
  const {
    durationS,
    sweatRateMlPerH = 0,
    maxCarbsGPerH = 90,
    fluidReplacementRatio = 0.7,
    intervalMin = 20,
  } = input;
  if (durationS <= 0) throw new RangeError('Duration must be positive');
  if (intervalMin <= 0) throw new RangeError('Interval must be positive');

  const carbsGPerH = Math.min(recommendedCarbsGPerH(durationS), maxCarbsGPerH);
  const fluidMlPerH = Math.round(sweatRateMlPerH * fluidReplacementRatio);

  const durationMin = durationS / 60;
  const schedule: FuelingStep[] = [];
  const perStepCarbs = (carbsGPerH * intervalMin) / 60;
  const perStepFluid = (fluidMlPerH * intervalMin) / 60;
  if (carbsGPerH > 0 || fluidMlPerH > 0) {
    // First intake after one interval; nothing in the last 10 minutes
    for (let t = intervalMin; t <= durationMin - 10; t += intervalMin) {
      schedule.push({
        atMin: t,
        carbsG: Math.round(perStepCarbs),
        fluidMl: Math.round(perStepFluid),
      });
    }
  }

  return {
    carbsGPerH,
    fluidMlPerH,
    totalCarbsG: schedule.reduce((s, x) => s + x.carbsG, 0),
    totalFluidMl: schedule.reduce((s, x) => s + x.fluidMl, 0),
    schedule,
  };
}
