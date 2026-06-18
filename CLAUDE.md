# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LifeMate AI** — a full-stack life assistant app with three sub-projects:

- `server/` — NestJS + Prisma + PostgreSQL backend (port 3001)
- `web/` — Next.js 16 frontend (port 3000)
- `app/` — React Native (Expo) mobile app

## Commands

### Backend (`server/`)

```bash
cd server
npm run start:dev       # dev server with watch
npm run build           # compile TypeScript
npm run lint            # ESLint with auto-fix
npm run test            # unit tests (Jest)
npm run test:e2e        # e2e tests
npm run test:cov        # coverage report

# Database
npm run db:push         # push schema without migration file
npm run db:migrate      # create and run a migration
npm run db:generate     # regenerate Prisma client after schema changes
npm run db:reset        # reset DB and re-apply all migrations (destructive)
npm run db:up           # start PostgreSQL via Docker Compose
npm run db:down         # stop Docker Compose DB
```

### Web (`web/`)

```bash
cd web
npm run dev             # dev server (0.0.0.0:3000, webpack)
npm run dev:turbo       # dev with Turbopack (experimental)
npm run build           # production build
npm run lint            # ESLint
```

### Mobile (`app/`)

```bash
cd app
npx expo start          # start Expo dev server
npx expo start --ios    # iOS simulator
npx expo start --android # Android emulator (use 10.0.2.2 for API URL)
```

## Architecture

### Backend structure

Every feature lives in `server/src/modules/<name>/` with the standard NestJS pattern: `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, and `dto/`. All routes are JWT-protected by default via a global `APP_GUARD` (`JwtAuthGuard`). To make a route public, use the `@Public()` decorator from `src/common/decorators/public.decorator.ts`.

The `@CurrentUser()` decorator (from `src/common/decorators/current-user.decorator.ts`) extracts the authenticated user from the JWT payload inside controllers.

Active modules: Auth, Family, Medicine, Prescriptions, Documents, Dashboard, AI, Files, Health, Finance, Tasks, Cycles, Pregnancy, Immunizations, Career, Bills, Goals, Learning, Travel, ImportantDates, Memory, Notifications, Users.

**PrismaService** (`src/prisma/`) extends `PrismaClient` directly and is available for injection throughout all modules.

**AI module** (`src/modules/ai/`) uses the OpenAI SDK with `baseURL` configurable via `OPENAI_BASE_URL`, so any OpenAI-compatible LLM works. If `OPENAI_API_KEY` is absent it falls back to placeholder responses.

**Files module** (`src/modules/files/`) handles document upload/download with PDF↔DOCX conversion. It uses LibreOffice (auto-detected at `LIBREOFFICE_PATH`) for exact conversion and falls back to `mammoth`/`pdfkit` for basic conversion.

### Configuration

Server config is in `src/config/configuration.ts`. Validated at startup via `src/config/env.validation.ts`. Key env vars (see `server/.env.example`):

- `DATABASE_URL` — PostgreSQL connection string (default DB: `lifemate`)
- `JWT_SECRET` / `JWT_EXPIRES_IN`
- `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL`
- `PORT` (default `3001`), `UPLOAD_DIR` (default `./uploads`)
- `LIBREOFFICE_PATH` (optional, for exact PDF↔DOCX conversion)

### Web frontend

`web/src/lib/api.ts` is the central Axios instance. In the browser it routes through Next.js rewrites (`/api/*` → `http://127.0.0.1:3001/api/*`, `/uploads/*` → backend). Auth token stored in `localStorage` as `lm_token`. Override backend with `NEXT_PUBLIC_API_URL` or `BACKEND_URL` env vars.

Layout: `web/src/components/AppSidebar.tsx` + `AppTopBar.tsx` wrap `AppLayout.tsx`. Pages live in `web/src/app/` (Next.js App Router).

### Mobile app

`app/src/api/client.ts` is the Axios instance. Token stored via `expo-secure-store` as `accessToken`. Default API URL is `http://localhost:3001/api` — change to `http://10.0.2.2:3001/api` for Android emulator. Navigation uses React Navigation (bottom tabs + native stack).

### Database

Prisma schema at `server/prisma/schema.prisma`. After editing the schema, run `npm run db:generate` to regenerate the client, then `npm run db:push` (dev) or `npm run db:migrate` (production migration).

If the database doesn't exist yet:
```bash
createdb -U pino -O pino lifemate
cd server && npm run db:push
```

## API Documentation

Swagger UI available at `http://localhost:3001/api/docs` when the server is running.
