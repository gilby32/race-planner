import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRacePlanInput } from './dto/create-race-plan.input';

@Injectable()
export class RacePlansService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.racePlan.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const plan = await this.prisma.racePlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }

  findSegments(racePlanId: string) {
    return this.prisma.planSegment.findMany({
      where: { racePlanId },
      orderBy: { order: 'asc' },
    });
  }

  create({ segments, ...plan }: CreateRacePlanInput) {
    return this.prisma.racePlan.create({
      data: { ...plan, segments: { create: segments } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.racePlan.delete({ where: { id } });
    return true;
  }
}
