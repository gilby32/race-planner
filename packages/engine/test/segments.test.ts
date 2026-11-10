import { describe, expect, it } from 'vitest';
import { elevationAt, parseCourse, segmentCourse } from '../src';
import { syntheticGpx } from './helpers';

const flat = (d: number) => 600;

describe('elevationAt', () => {
  const profile = [
    { distanceM: 0, ele: 0 },
    { distanceM: 100, ele: 10 },
  ];
  it('interpolates linearly and clamps at the ends', () => {
    expect(elevationAt(profile, 50)).toBe(5);
    expect(elevationAt(profile, -10)).toBe(0);
    expect(elevationAt(profile, 500)).toBe(10);
  });
});

describe('segmentCourse', () => {
  it('a flat course is only split by maximum length', () => {
    const { profile } = parseCourse(syntheticGpx(12_000, flat), { smoothingWindowM: 0 });
    const segments = segmentCourse(profile, { maxLengthM: 5000 });
    expect(segments).toHaveLength(3);
    segments.forEach((s) => {
      expect(s.endM - s.startM).toBeLessThanOrEqual(5000 + 1e-6);
      expect(Math.abs(s.grade)).toBeLessThan(0.001);
    });
  });

  it('separates climb and descent', () => {
    // 3 km climbing at 5% and 3 km descending at 5%
    const ele = (d: number) => (d <= 3000 ? 600 + d * 0.05 : 750 - (d - 3000) * 0.05);
    const { profile } = parseCourse(syntheticGpx(6000, ele), { smoothingWindowM: 0 });
    const segments = segmentCourse(profile);
    expect(segments).toHaveLength(2);
    expect(segments[0]!.grade).toBeCloseTo(0.05, 2);
    expect(segments[1]!.grade).toBeCloseTo(-0.05, 2);
  });

  it('segments cover the course with no gaps', () => {
    const ele = (d: number) => 600 + 40 * Math.sin(d / 800);
    const { profile, totalDistanceM } = parseCourse(syntheticGpx(12_345, ele));
    const segments = segmentCourse(profile);
    expect(segments[0]!.startM).toBe(0);
    expect(segments[segments.length - 1]!.endM).toBeCloseTo(totalDistanceM, 5);
    for (let i = 1; i < segments.length; i++) {
      expect(segments[i]!.startM).toBe(segments[i - 1]!.endM);
    }
  });

  it('validates the options', () => {
    const { profile } = parseCourse(syntheticGpx(1000, flat));
    expect(() => segmentCourse(profile, { minLengthM: 0 })).toThrow(RangeError);
    expect(() => segmentCourse(profile, { minLengthM: 1000, maxLengthM: 500 })).toThrow(RangeError);
  });
});
