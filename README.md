# LifeMate AI

**One AI assistant + many useful life solution cards.**

Production-ready full-stack all-in-one life assistant for health, documents, finance, family, career, reminders, and more.

## Structure

- `server/` — NestJS + Prisma + PostgreSQL + JWT + Swagger
- `app/` — React Native (Expo) mobile app
- `web/` — Next.js web frontend

## Tech Stack
- Backend: NestJS, Prisma, PostgreSQL, JWT, Swagger, Multer
- Mobile: React Native + Expo + TypeScript + React Navigation
- Web: Next.js + TypeScript + Tailwind
- AI: OpenAI-compatible placeholder (ready for GPT-4o / Claude etc.)

## Features Implemented
- Full Prisma schema (20+ models + enums)
- Complete modular NestJS backend
- JWT auth + protected routes
- Dashboard API
- AI chat with action types (placeholder)
- Major modules: Auth, Family, Medicine, Documents, Health, Finance, Tasks, Career, AI, Files, Bills, Goals
- Modern card grid home dashboard (15 cards)
- Mobile + Web frontends

## Quick Start

### 1. Backend (server) — Most Important First Step

```bash
cd server
cp .env.example .env
npm install

# Start database (recommended)
npm run db:up

# Create tables
npm run db:migrate     # or npm run db:push

npm run start:dev
```

- API: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

**If you see "Database `lifemate` does not exist"**:

```bash
cd server
createdb -U pino -O pino lifemate
npm run db:push
npm run start:dev
```

### 2. Mobile App
```bash
cd app
npm install
npx expo start
```

Update base URL in `app/src/api/client.ts` if needed.

### 3. Web
```bash
cd web
npm run dev
```

Open http://localhost:3000

See `server/README.md` for full database commands.

## Production Notes
- Use strong JWT secret
- Use real PostgreSQL
- Enable HTTPS
- Store AI keys only on server
- Add encryption for secure document notes in production

Built as a serious scalable app.
