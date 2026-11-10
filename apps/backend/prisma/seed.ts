import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/** Creates a sample plan to test the app end to end. */
async function main() {
  await prisma.racePlan.deleteMany({ where: { name: 'Madrid Marathon (sample)' } });

  const paces = [295, 290, 288, 288, 290, 295, 300, 290, 285];
  await prisma.racePlan.create({
    data: {
      name: 'Madrid Marathon (sample)',
      raceType: 'MARATHON',
      raceDate: new Date('2027-04-25T09:00:00+02:00'),
      expectedTempC: 16,
      targetFinishTimeS: 3 * 3600 + 28 * 60,
      segments: {
        create: paces.map((pace, i) => ({
          order: i,
          discipline: 'RUN' as const,
          startKm: i * 5,
          endKm: Math.min((i + 1) * 5, 42.195),
          targetPaceSPerKm: pace,
          carbsG: i === 0 ? 0 : 30,
          fluidMl: i === 0 ? 150 : 200,
          notes: i === 0 ? 'Hold back at the start, don’t get carried away' : null,
        })),
      },
    },
  });
  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
