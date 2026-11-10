import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { formatPace } from '@race-planner/shared';
import { CreateRacePlanInput } from './dto/create-race-plan.input';
import { PlanSegment, RacePlan } from './models/race-plan.model';
import { RacePlansService } from './race-plans.service';

@Resolver(() => RacePlan)
export class RacePlansResolver {
  constructor(private readonly service: RacePlansService) {}

  @Query(() => [RacePlan], { description: 'Lists all race plans' })
  racePlans() {
    return this.service.findAll();
  }

  @Query(() => RacePlan)
  racePlan(@Args('id', { type: () => ID }) id: string) {
    return this.service.findOne(id);
  }

  @Mutation(() => RacePlan)
  createRacePlan(@Args('input') input: CreateRacePlanInput) {
    return this.service.create(input);
  }

  @Mutation(() => Boolean)
  deleteRacePlan(@Args('id', { type: () => ID }) id: string) {
    return this.service.remove(id);
  }

  @ResolveField(() => [PlanSegment])
  segments(@Parent() plan: RacePlan) {
    return this.service.findSegments(plan.id);
  }
}

@Resolver(() => PlanSegment)
export class PlanSegmentResolver {
  @ResolveField(() => String, {
    nullable: true,
    description: 'Formatted target pace, e.g. "4:45 /km"',
  })
  targetPaceLabel(@Parent() segment: PlanSegment) {
    return segment.targetPaceSPerKm ? formatPace(segment.targetPaceSPerKm) : null;
  }
}
