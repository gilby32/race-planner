import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Discipline, RaceType } from '@race-planner/shared';

// Hand-written types for now. Once the schema grows, generate them
// with GraphQL Code Generator from apps/backend/src/schema.gql.

export interface RacePlanSummary {
  id: string;
  name: string;
  raceType: RaceType;
  raceDate: string | null;
  targetFinishTimeS: number | null;
}

export interface PlanSegment {
  id: string;
  order: number;
  discipline: Discipline;
  startKm: number;
  endKm: number;
  targetPaceLabel: string | null;
  targetPowerW: number | null;
  carbsG: number | null;
  fluidMl: number | null;
  notes: string | null;
}

export interface RacePlanDetail extends RacePlanSummary {
  expectedTempC: number | null;
  segments: PlanSegment[];
}

export const HOME_QUERY: TypedDocumentNode<{
  health: { ok: boolean; database: boolean };
  racePlans: RacePlanSummary[];
}> = gql`
  query Home {
    health {
      ok
      database
    }
    racePlans {
      id
      name
      raceType
      raceDate
      targetFinishTimeS
    }
  }
`;

export const RACE_PLAN_QUERY: TypedDocumentNode<{ racePlan: RacePlanDetail }, { id: string }> = gql`
  query RacePlan($id: ID!) {
    racePlan(id: $id) {
      id
      name
      raceType
      raceDate
      expectedTempC
      targetFinishTimeS
      segments {
        id
        order
        discipline
        startKm
        endKm
        targetPaceLabel
        targetPowerW
        carbsG
        fluidMl
        notes
      }
    }
  }
`;
