import { Module } from '@nestjs/common';
import { PlanSegmentResolver, RacePlansResolver } from './race-plans.resolver';
import { RacePlansService } from './race-plans.service';

@Module({
  providers: [RacePlansService, RacePlansResolver, PlanSegmentResolver],
})
export class RacePlansModule {}
