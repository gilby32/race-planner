export * from './types';
export { haversineM } from './geo';
export {
  GpxParseError,
  accumulateElevation,
  buildProfile,
  parseCourse,
  parseGpxPoints,
  smoothElevation,
  type ParseCourseOptions,
} from './gpx';
export { elevationAt, segmentCourse, type SegmentOptions } from './segments';
export {
  MINETTI_GRADE_LIMIT,
  gradePaceFactor,
  minettiCostOfRunning,
  planForTargetTime,
  planFromFlatPace,
  type PacePlan,
  type PacedSegment,
} from './pacing';
export {
  planFueling,
  recommendedCarbsGPerH,
  type FuelingInput,
  type FuelingPlan,
  type FuelingStep,
} from './fueling';
