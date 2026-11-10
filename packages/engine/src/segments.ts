import type { CourseSegment, ProfilePoint } from './types';

export interface SegmentOptions {
  /** Minimum segment length in meters. Defaults to 500. */
  minLengthM?: number;
  /** Maximum segment length in meters. Defaults to 5000. */
  maxLengthM?: number;
  /** Gradient change (fraction) that forces a new segment. Defaults to 0.02 (2%). */
  gradeChangeThreshold?: number;
}

/** Interpolates the elevation at a given distance. */
export function elevationAt(profile: ProfilePoint[], distanceM: number): number {
  if (distanceM <= profile[0]!.distanceM) return profile[0]!.ele;
  const last = profile[profile.length - 1]!;
  if (distanceM >= last.distanceM) return last.ele;

  let lo = 0;
  let hi = profile.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (profile[mid]!.distanceM <= distanceM) lo = mid;
    else hi = mid;
  }
  const a = profile[lo]!;
  const b = profile[hi]!;
  const t =
    b.distanceM === a.distanceM ? 0 : (distanceM - a.distanceM) / (b.distanceM - a.distanceM);
  return a.ele + t * (b.ele - a.ele);
}

function makeSegment(profile: ProfilePoint[], startM: number, endM: number): CourseSegment {
  const delta = elevationAt(profile, endM) - elevationAt(profile, startM);
  const length = endM - startM;
  return { startM, endM, elevationDeltaM: delta, grade: length > 0 ? delta / length : 0 };
}

/**
 * Splits the course into segments of consistent gradient.
 *
 * Walks the profile in blocks of `minLengthM` and starts a new segment when a
 * block's gradient differs from the current segment's by more than the threshold,
 * or when the segment reaches `maxLengthM`. A final block shorter than half the
 * minimum is merged into the previous one.
 */
export function segmentCourse(
  profile: ProfilePoint[],
  options: SegmentOptions = {},
): CourseSegment[] {
  const minLen = options.minLengthM ?? 500;
  const maxLen = options.maxLengthM ?? 5000;
  const threshold = options.gradeChangeThreshold ?? 0.02;
  if (minLen <= 0 || maxLen < minLen) throw new RangeError('Invalid length options');

  const total = profile[profile.length - 1]!.distanceM;
  if (total <= 0) return [];

  const blocks: CourseSegment[] = [];
  for (let start = 0; start < total; start += minLen) {
    blocks.push(makeSegment(profile, start, Math.min(start + minLen, total)));
  }
  // A final block that is too short is merged into the previous one
  if (
    blocks.length > 1 &&
    blocks[blocks.length - 1]!.endM - blocks[blocks.length - 1]!.startM < minLen / 2
  ) {
    const tail = blocks.pop()!;
    const prev = blocks.pop()!;
    blocks.push(makeSegment(profile, prev.startM, tail.endM));
  }

  const segments: CourseSegment[] = [];
  let current = blocks[0]!;
  for (const block of blocks.slice(1)) {
    const merged = makeSegment(profile, current.startM, block.endM);
    const tooLong = merged.endM - merged.startM > maxLen;
    const gradeJump = Math.abs(block.grade - current.grade) > threshold;
    if (tooLong || gradeJump) {
      segments.push(current);
      current = block;
    } else {
      current = merged;
    }
  }
  segments.push(current);
  return segments;
}
