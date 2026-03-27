# AI Daily Dashboard

A Next.js app for task planning, goal tracking, daily briefings, and scheduling.

## Prerequisites

- Node.js 18+ (or latest LTS)
- npm
- A PostgreSQL database (Neon or any Postgres host)
- An OpenAI API key

## 1) Install dependencies

```bash
npm install
```

## 2) Configure environment variables

Create a `.env` file in the project root with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
AUTH_SECRET="replace-with-a-long-random-secret"
AUTH_URL="http://localhost:3000"
OPENAI_API_KEY="replace-with-your-openai-api-key"
```

Notes:
- `AUTH_SECRET` should be a long random string.
- `AUTH_URL` should match your app URL (`http://localhost:3000` for local dev).

## 3) Set up the database

```bash
npm run db:generate
npm run db:push
```

Optional seed:

```bash
npm run db:seed
```

## 4) Run locally

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run production server
- `npm run lint` - run lint checks
- `npm run db:generate` - generate Prisma client
- `npm run db:push` - push Prisma schema to database
- `npm run db:studio` - open Prisma Studio
- `npm run db:seed` - seed database
