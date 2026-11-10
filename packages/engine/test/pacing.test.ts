import { describe, expect, it } from 'vitest';
import {
  gradePaceFactor,
  minettiCostOfRunning,
  planForTargetTime,
  planFromFlatPace,
  type CourseSegment,
} from '../src';

const seg = (startM: number, endM: number, grade: number): CourseSegment => ({
  startM,
  endM,
  grade,
  elevationDeltaM: (endM - startM) * grade,
});

describe('minettiCostOfRunning', () => {
  it('is 3.6 J/kg/m on flat ground', () => {
    expect(minettiCostOfRunning(0)).toBeCloseTo(3.6, 5);
  });

  it('has its minimum on a gentle descent (~-10% / -20%)', () => {
    const costs = [-0.3, -0.2, -0.15, -0.1, 0].map(minettiCostOfRunning);
    const min = Math.min(...costs);
    expect(min).toBeLessThan(minettiCostOfRunning(0));
    expect(min).toBe(
      Math.min(minettiCostOfRunning(-0.2), minettiCostOfRunning(-0.15), minettiCostOfRunning(-0.1)),
    );
  });

  it('clamps outside ±45%', () => {
    expect(minettiCostOfRunning(0.8)).toBe(minettiCostOfRunning(0.45));
  });
});

describe('gradePaceFactor', () => {
  it('is 1 on flat ground, >1 uphill and <1 on a gentle descent', () => {
    expect(gradePaceFactor(0)).toBeCloseTo(1, 10);
    expect(gradePaceFactor(0.05)).toBeGreaterThan(1.2);
    expect(gradePaceFactor(-0.03)).toBeLessThan(1);
  });

  it('respects the downhill cap', () => {
    expect(gradePaceFactor(-0.15, 0.9)).toBe(0.9);
  });
});

describe('planForTargetTime', () => {
  it('on flat ground gives an even pace that hits the target exactly', () => {
    const plan = planForTargetTime([seg(0, 21_097.5, 0)], 90 * 60);
    expect(plan.totalDurationS).toBeCloseTo(5400, 6);
    expect(plan.segments[0]!.targetPaceSPerKm).toBeCloseTo(5400 / 21.0975, 6);
  });

  it('goes slower uphill, faster downhill and adds up to the target time', () => {
    const segments = [seg(0, 5000, 0), seg(5000, 8000, 0.04), seg(8000, 11_000, -0.04)];
    const plan = planForTargetTime(segments, 3600);
    const [flat, up, down] = plan.segments;
    expect(plan.totalDurationS).toBeCloseTo(3600, 6);
    expect(up!.targetPaceSPerKm).toBeGreaterThan(flat!.targetPaceSPerKm);
    expect(down!.targetPaceSPerKm).toBeLessThan(flat!.targetPaceSPerKm);
  });

  it('rejects non-positive times', () => {
    expect(() => planForTargetTime([seg(0, 1000, 0)], 0)).toThrow(RangeError);
  });
});

describe('planFromFlatPace', () => {
  it('at 5:00/km on flat ground, 10 km takes 50 minutes', () => {
    const plan = planFromFlatPace([seg(0, 10_000, 0)], 300);
    expect(plan.totalDurationS).toBeCloseTo(3000, 6);
  });
});
