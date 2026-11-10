/**
 * Types and constants shared between the backend and the mobile app.
 * The main data contract is the GraphQL schema; this package only holds
 * what both sides need to know at compile time.
 */

export enum Discipline {
  SWIM = 'SWIM',
  BIKE = 'BIKE',
  RUN = 'RUN',
}

export enum RaceType {
  MARATHON = 'MARATHON',
  HALF_MARATHON = 'HALF_MARATHON',
  TRIATHLON_SPRINT = 'TRIATHLON_SPRINT',
  TRIATHLON_OLYMPIC = 'TRIATHLON_OLYMPIC',
  TRIATHLON_70_3 = 'TRIATHLON_70_3',
  TRIATHLON_FULL = 'TRIATHLON_FULL',
}

export const RACE_TYPE_LABELS: Record<RaceType, string> = {
  [RaceType.MARATHON]: 'Marathon',
  [RaceType.HALF_MARATHON]: 'Half marathon',
  [RaceType.TRIATHLON_SPRINT]: 'Sprint triathlon',
  [RaceType.TRIATHLON_OLYMPIC]: 'Olympic triathlon',
  [RaceType.TRIATHLON_70_3]: 'Half Ironman (70.3)',
  [RaceType.TRIATHLON_FULL]: 'Ironman',
};

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  [Discipline.SWIM]: 'Swim',
  [Discipline.BIKE]: 'Bike',
  [Discipline.RUN]: 'Run',
};

/** Formats seconds per km as "m:ss /km". */
export function formatPace(secondsPerKm: number): string {
  // Round before splitting to avoid producing "4:60"
  const total = Math.round(secondsPerKm);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}
