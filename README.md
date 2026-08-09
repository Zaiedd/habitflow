# HabitFlow

AI-first personal growth platform — habit tracking, goals, productivity, wellness,
journaling, analytics, gamification, community, and a proactive AI coach.

## Monorepo layout

```
apps/
  web/          Next.js PWA (frontend)
  api/          NestJS (backend, /api/v1)
packages/
  db/           Prisma schema + shared client (@habitflow/db)
  config/       Shared TypeScript config
docs/           Architecture deliverables (pre-code)
```

## Getting started

1. Install dependencies (npm workspaces):
   ```
   npm install
   ```
2. Copy `apps/api/.env` from `.env.example`:
   ```
   Copy-Item .env.example apps/api/.env
   ```
3. Start local PostgreSQL + Redis (requires Docker):
   ```
   docker compose up -d
   ```
4. Generate the Prisma client + push schema:
   ```
   npm run db:generate
   cd packages/db && npx prisma migrate dev --name init
   ```
5. Run the API:
   ```
   npm run start:dev -w @habitflow/api
   ```
   Swagger docs: http://localhost:4000/docs

6. Run the web app:
   ```
   npm run dev -w @habitflow/web
   ```
   Web: http://localhost:3000

## Scripts (root)

- `npm run db:generate` / `db:validate` — Prisma client + schema checks
- `npm run typecheck` — TypeScript across workspaces
- `npm run lint` — ESLint across workspaces

## Deployment

The web app is statically exported (`output: "export"`) and deployed to GitHub
Pages via GitHub Actions. Push to `main` (or run the `Deploy to GitHub Pages`
workflow manually) to publish at:

https://zaiedd.github.io/habitflow/

> Note: GitHub Pages hosts only the static frontend. Auth/API features fall back
> to a local demo session when the backend API isn't reachable.

## Stack

Next.js · React · TypeScript · Tailwind CSS · NestJS · PostgreSQL · Prisma ·
Redis · Docker · GitHub Actions. See `docs/` for the full architecture.
