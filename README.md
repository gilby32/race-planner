# Race Planner

Race strategy planner for triathlon and marathon: pace/power per segment plus a fueling and hydration plan.

This is the **project foundation**: structure, end-to-end wiring, a sample module and the open source calculation engine.

## Stack

| Part                 | Technology                                                                        |
| -------------------- | --------------------------------------------------------------------------------- |
| Backend              | NestJS 12 · GraphQL code-first (Apollo Server 5) · Prisma 7 · PostgreSQL 16       |
| Mobile               | React Native 0.88 · Expo SDK 58 · Expo Router · Apollo Client 4                   |
| Engine (open source) | `@race-planner/engine` package (MIT): GPX, segments, grade-adjusted pace, fueling |
| Shared               | `@race-planner/shared` package (enums, labels, utilities)                         |
| Monorepo             | npm workspaces · TypeScript · Prettier                                            |

## Structure

```
race-planner/
├── apps/
│   ├── backend/              # NestJS + GraphQL API
│   │   ├── prisma/           # schema.prisma and seed
│   │   └── src/
│   │       ├── config/       # Environment variable validation
│   │       ├── prisma/       # PrismaService (global module)
│   │       ├── health/       # `health` query
│   │       └── race-plans/   # Sample module: models, inputs, service, resolvers
│   └── mobile/               # Expo app
│       └── src/
│           ├── app/          # Screens (Expo Router): plan list and plan detail
│           ├── graphql/      # Queries and types
│           ├── lib/          # Apollo client, formatters
│           └── components/
├── packages/
│   ├── engine/               # Open source calculation engine (MIT) with tests
│   └── shared/               # Code shared between backend and mobile
└── docker-compose.yml        # Local PostgreSQL
```

## Getting started

Requirements: Node 20+, Docker and the **Expo Go** app on your phone.

```bash
# 1. Dependencies
npm install

# 2. Database
npm run db:up
cp apps/backend/.env.example apps/backend/.env

# 3. Create tables and sample data
npm run prisma:migrate -w @race-planner/backend -- --name init
npm run prisma:seed -w @race-planner/backend

# 4. Backend  →  http://localhost:4000/graphql
npm run dev:backend

# 5. Mobile app (in another terminal), then scan the QR code with Expo Go
npm run dev:mobile
```

Your phone and computer must be on the same Wi-Fi network. The app detects your computer's IP automatically; if it can't connect, set the URL in `apps/mobile/.env` (see `.env.example`).

## GraphQL API

```graphql
query {
  health {
    ok
    database
  }
  racePlans {
    name
    raceType
    segments {
      startKm
      endKm
      targetPaceLabel
      carbsG
      fluidMl
    }
  }
}

mutation {
  createRacePlan(
    input: {
      name: "Ironman Valencia"
      raceType: TRIATHLON_FULL
      segments: [{ order: 0, discipline: SWIM, startKm: 0, endKm: 3.8 }]
    }
  ) {
    id
  }
}
```

The schema is generated automatically at `apps/backend/src/schema.gql` when the backend starts.

## Useful scripts

| Command                     | What it does                   |
| --------------------------- | ------------------------------ |
| `npm run dev:backend`       | Backend in watch mode          |
| `npm run dev:mobile`        | Expo dev server                |
| `npm run build`             | Builds shared + backend        |
| `npm run typecheck`         | Type-checks the whole monorepo |
| `npm test`                  | Runs the engine tests          |
| `npm run db:up` / `db:down` | Starts / stops PostgreSQL      |
| `npm run format`            | Formats with Prettier          |

## Suggested next steps

1. Connect the engine (`packages/engine`) to the backend: upload a GPX and generate the plan.
2. Athlete profile (thresholds, zones, sweat rate), with the option to import it from Strava.
3. Heat and humidity adjustment, plus cycling and swimming for triathlon.
4. Generate the mobile types with GraphQL Code Generator from `schema.gql`.
5. Authentication.
