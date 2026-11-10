import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { PrismaService } from '../prisma/prisma.service';

@ObjectType()
class HealthStatus {
  @Field()
  ok: boolean;

  @Field()
  database: boolean;

  @Field()
  timestamp: Date;
}

@Resolver(() => HealthStatus)
export class HealthResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => HealthStatus, { description: 'Checks that the API and the database respond' })
  async health(): Promise<HealthStatus> {
    let database = true;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      database = false;
    }
    return { ok: true, database, timestamp: new Date() };
  }
}
