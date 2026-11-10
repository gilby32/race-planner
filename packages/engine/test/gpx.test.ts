import { describe, expect, it } from 'vitest';
import { GpxParseError, haversineM, parseCourse, parseGpxPoints, smoothElevation } from '../src';
import { syntheticGpx } from './helpers';

describe('haversineM', () => {
  it('measures ~111 km per degree of latitude', () => {
    expect(haversineM(0, 0, 1, 0)).toBeCloseTo(111_195, -1);
  });

  it('returns 0 for the same point', () => {
    expect(haversineM(40.4, -3.7, 40.4, -3.7)).toBe(0);
  });
});

describe('parseGpxPoints', () => {
  it('reads the name and points of a track', () => {
    const { name, points } = parseGpxPoints(syntheticGpx(100, () => 650, 10, 'Retiro'));
    expect(name).toBe('Retiro');
    expect(points).toHaveLength(11);
    expect(points[0]).toMatchObject({ lon: -3.7, ele: 650 });
  });

  it('uses route points when there is no track', () => {
    const xml = `<gpx><rte><name>R</name>
      <rtept lat="40" lon="-3"/><rtept lat="40.01" lon="-3"/></rte></gpx>`;
    const { name, points } = parseGpxPoints(xml);
    expect(name).toBe('R');
    expect(points).toHaveLength(2);
    expect(points[0]!.ele).toBeUndefined();
  });

  it('rejects files without <gpx> or with fewer than 2 points', () => {
    expect(() => parseGpxPoints('<kml/>')).toThrow(GpxParseError);
    expect(() =>
      parseGpxPoints('<gpx><trk><trkseg><trkpt lat="1" lon="1"/></trkseg></trk></gpx>'),
    ).toThrow(GpxParseError);
  });
});

describe('parseCourse', () => {
  it('computes distance and elevation for a steady climb', () => {
    // 5 km climbing at 2% → 100 m of elevation gain
    const course = parseCourse(
      syntheticGpx(5000, (d) => 600 + d * 0.02),
      { smoothingWindowM: 0 },
    );
    expect(course.totalDistanceM).toBeCloseTo(5000, -1);
    expect(course.elevationGainM).toBeGreaterThan(99);
    expect(course.elevationGainM).toBeLessThanOrEqual(100.01);
    expect(course.elevationLossM).toBeCloseTo(0, 5);
  });

  it('smoothing reduces elevation gain inflated by GPS noise', () => {
    // Flat with ±3 m sawtooth noise: unsmoothed, it adds up to hundreds of meters
    const noisy = syntheticGpx(5000, (d) => 600 + ((d / 10) % 2 === 0 ? 3 : -3));
    const raw = parseCourse(noisy, { smoothingWindowM: 0, elevationThresholdM: 0 });
    const smooth = parseCourse(noisy);
    expect(raw.elevationGainM).toBeGreaterThan(1000);
    expect(smooth.elevationGainM).toBeLessThan(5);
  });
});

describe('smoothElevation', () => {
  it('leaves a linear profile unchanged in the interior', () => {
    const profile = Array.from({ length: 101 }, (_, i) => ({ distanceM: i * 10, ele: i }));
    const s = smoothElevation(profile, 100);
    expect(s[50]!.ele).toBeCloseTo(50, 5);
  });
});
