import { describe, expect, it } from 'vitest';
import { planFueling, recommendedCarbsGPerH } from '../src';

const h = (hours: number) => hours * 3600;

describe('recommendedCarbsGPerH', () => {
  it.each([
    [0.5, 0],
    [1, 15],
    [1.5, 30],
    [2.25, 60],
    [3.5, 90],
    [10, 90],
  ])('%s h → %s g/h', (hours, expected) => {
    expect(recommendedCarbsGPerH(h(hours))).toBe(expected);
  });
});

describe('planFueling', () => {
  it('3h30 marathon with 800 ml/h sweat rate', () => {
    const plan = planFueling({ durationS: h(3.5), sweatRateMlPerH: 800 });
    expect(plan.carbsGPerH).toBe(90);
    expect(plan.fluidMlPerH).toBe(560);
    // intakes at 20, 40, ..., 200 min (none in the last 10)
    expect(plan.schedule.map((s) => s.atMin)).toEqual([
      20, 40, 60, 80, 100, 120, 140, 160, 180, 200,
    ]);
    expect(plan.schedule[0]).toEqual({ atMin: 20, carbsG: 30, fluidMl: 187 });
  });

  it('respects the athlete’s maximum tolerance', () => {
    expect(planFueling({ durationS: h(5), maxCarbsGPerH: 60 }).carbsGPerH).toBe(60);
  });

  it('a short race with no known sweat rate produces no intakes', () => {
    const plan = planFueling({ durationS: 30 * 60 });
    expect(plan.schedule).toHaveLength(0);
    expect(plan.totalCarbsG).toBe(0);
  });

  it('validates the input', () => {
    expect(() => planFueling({ durationS: 0 })).toThrow(RangeError);
    expect(() => planFueling({ durationS: h(1), intervalMin: 0 })).toThrow(RangeError);
  });
});
