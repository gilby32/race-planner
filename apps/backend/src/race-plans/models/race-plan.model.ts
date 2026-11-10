import { Field, Float, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Discipline, RaceType } from '../../generated/prisma/enums';

registerEnumType(RaceType, { name: 'RaceType', description: 'Race type' });
registerEnumType(Discipline, { name: 'Discipline', description: 'Segment discipline' });

@ObjectType({ description: 'Course segment with a pace/power target and fueling' })
export class PlanSegment {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number;

  @Field(() => Discipline)
  discipline: Discipline;

  @Field(() => Float)
  startKm: number;

  @Field(() => Float)
  endKm: number;

  @Field(() => Int, { nullable: true, description: 'Target pace in seconds per km' })
  targetPaceSPerKm: number | null;

  @Field(() => Int, { nullable: true, description: 'Target power in watts (cycling)' })
  targetPowerW: number | null;

  @Field(() => Int, { nullable: true, description: 'Carbs to take in this segment (g)' })
  carbsG: number | null;

  @Field(() => Int, { nullable: true, description: 'Fluid to take in this segment (ml)' })
  fluidMl: number | null;

  @Field(() => String, { nullable: true })
  notes: string | null;
}

@ObjectType({ description: 'Strategy plan for a race' })
export class RacePlan {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => RaceType)
  raceType: RaceType;

  @Field(() => Date, { nullable: true })
  raceDate: Date | null;

  @Field(() => Float, { nullable: true, description: 'Expected temperature (°C)' })
  expectedTempC: number | null;

  @Field(() => Int, { nullable: true, description: 'Target finish time in seconds' })
  targetFinishTimeS: number | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // `segments` is resolved with a @ResolveField in RacePlansResolver
}
