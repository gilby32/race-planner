import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { Discipline, RaceType } from '../../generated/prisma/enums';

@InputType()
export class CreatePlanSegmentInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  order: number;

  @Field(() => Discipline)
  @IsEnum(Discipline)
  discipline: Discipline;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  startKm: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  endKm: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetPaceSPerKm?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetPowerW?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  carbsG?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  fluidMl?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class CreateRacePlanInput {
  @Field()
  @IsString()
  @Length(1, 120)
  name: string;

  @Field(() => RaceType)
  @IsEnum(RaceType)
  raceType: RaceType;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  raceDate?: Date;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  expectedTempC?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  targetFinishTimeS?: number;

  @Field(() => [CreatePlanSegmentInput], { defaultValue: [] })
  @ValidateNested({ each: true })
  @Type(() => CreatePlanSegmentInput)
  segments: CreatePlanSegmentInput[];
}
