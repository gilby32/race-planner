import { XMLParser } from 'fast-xml-parser';
import { haversineM } from './geo';
import type { Course, ProfilePoint, TrackPoint } from './types';

export class GpxParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GpxParseError';
  }
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  isArray: (name) => ['trk', 'trkseg', 'trkpt', 'rte', 'rtept'].includes(name),
});

type RawPoint = { lat?: string; lon?: string; ele?: string | number };

function toTrackPoint(raw: RawPoint): TrackPoint {
  const lat = Number(raw.lat);
  const lon = Number(raw.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new GpxParseError('Point without valid lat/lon');
  }
  const ele = raw.ele === undefined ? undefined : Number(raw.ele);
  return { lat, lon, ele: Number.isFinite(ele) ? ele : undefined };
}

/** Extracts the points of a GPX (tracks or, if there are none, routes). */
export function parseGpxPoints(xml: string): { name?: string; points: TrackPoint[] } {
  let doc: any;
  try {
    doc = parser.parse(xml);
  } catch (e) {
    throw new GpxParseError(`Invalid XML: ${(e as Error).message}`);
  }
  const gpx = doc?.gpx;
  if (!gpx) throw new GpxParseError('The file does not contain a <gpx> element');

  const fromTracks: RawPoint[] = (gpx.trk ?? []).flatMap((trk: any) =>
    (trk.trkseg ?? []).flatMap((seg: any) => seg.trkpt ?? []),
  );
  const fromRoutes: RawPoint[] = (gpx.rte ?? []).flatMap((rte: any) => rte.rtept ?? []);
  const raw = fromTracks.length > 0 ? fromTracks : fromRoutes;

  if (raw.length < 2) throw new GpxParseError('The GPX needs at least 2 points');

  const name = gpx.trk?.[0]?.name ?? gpx.rte?.[0]?.name ?? gpx.metadata?.name;
  return { name: name ? String(name) : undefined, points: raw.map(toTrackPoint) };
}

/**
 * Converts points into a distance/elevation profile.
 * Missing elevations are filled with the last known value (or 0).
 */
export function buildProfile(points: TrackPoint[]): ProfilePoint[] {
  const profile: ProfilePoint[] = [];
  let distance = 0;
  let lastEle = points.find((p) => p.ele !== undefined)?.ele ?? 0;

  points.forEach((p, i) => {
    if (i > 0) {
      const prev = points[i - 1]!;
      distance += haversineM(prev.lat, prev.lon, p.lat, p.lon);
    }
    if (p.ele !== undefined) lastEle = p.ele;
    profile.push({ distanceM: distance, ele: lastEle });
  });
  return profile;
}

/**
 * Smooths elevation with a distance-based moving average to reduce GPS
 * noise, which inflates the cumulative elevation gain.
 */
export function smoothElevation(profile: ProfilePoint[], windowM = 100): ProfilePoint[] {
  if (windowM <= 0) return profile;
  const half = windowM / 2;
  let lo = 0;
  let hi = 0;
  let sum = 0;
  return profile.map((p) => {
    while (hi < profile.length && profile[hi]!.distanceM <= p.distanceM + half) {
      sum += profile[hi]!.ele;
      hi++;
    }
    while (profile[lo]!.distanceM < p.distanceM - half) {
      sum -= profile[lo]!.ele;
      lo++;
    }
    return { distanceM: p.distanceM, ele: sum / (hi - lo) };
  });
}

export interface ParseCourseOptions {
  /** Elevation smoothing window in meters (0 to disable). Defaults to 100. */
  smoothingWindowM?: number;
  /**
   * Minimum elevation change (m) to count towards cumulative gain/loss.
   * Avoids adding up residual noise after smoothing. Defaults to 1.
   */
  elevationThresholdM?: number;
}

/**
 * Cumulative elevation gain and loss with hysteresis: a change only counts
 * once it moves `thresholdM` meters away from the last counted elevation.
 */
export function accumulateElevation(
  profile: ProfilePoint[],
  thresholdM = 1,
): { gain: number; loss: number } {
  let gain = 0;
  let loss = 0;
  let anchor = profile[0]?.ele ?? 0;
  for (const { ele } of profile) {
    const d = ele - anchor;
    if (Math.abs(d) >= thresholdM) {
      if (d > 0) gain += d;
      else loss -= d;
      anchor = ele;
    }
  }
  return { gain, loss };
}

/** GPX → course with profile, distance and elevation. */
export function parseCourse(xml: string, options: ParseCourseOptions = {}): Course {
  const { name, points } = parseGpxPoints(xml);
  const profile = smoothElevation(buildProfile(points), options.smoothingWindowM ?? 100);

  const { gain, loss } = accumulateElevation(profile, options.elevationThresholdM ?? 1);

  return {
    name,
    totalDistanceM: profile[profile.length - 1]!.distanceM,
    elevationGainM: gain,
    elevationLossM: loss,
    profile,
  };
}
