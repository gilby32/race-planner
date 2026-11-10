/** Course point as it comes from the GPX. */
export interface TrackPoint {
  lat: number;
  lon: number;
  /** Elevation in meters (may be missing in some GPX files). */
  ele?: number;
}

/** Point with cumulative distance from the start. */
export interface ProfilePoint {
  /** Cumulative distance in meters. */
  distanceM: number;
  /** Elevation in meters. */
  ele: number;
}

/** Course segment with a roughly constant average gradient. */
export interface CourseSegment {
  startM: number;
  endM: number;
  /** Net elevation change over the segment in meters. */
  elevationDeltaM: number;
  /** Average gradient as a fraction (0.05 = 5%). */
  grade: number;
}

export interface Course {
  name?: string;
  totalDistanceM: number;
  elevationGainM: number;
  elevationLossM: number;
  profile: ProfilePoint[];
}
