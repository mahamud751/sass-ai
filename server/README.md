# LifeMate AI — Server (NestJS)

## Prerequisites
- PostgreSQL must be running
- The database `lifemate` must exist

## Quick Start (with your local Postgres)

```bash
# 1. Install dependencies
npm install

# 2. Create the database using your user (if it doesn't exist)
createdb -U pino -O pino lifemate

# 3. Push the Prisma schema (recommended for development)
npm run db:push

# 4. Start the server
npm run start:dev
```

API will be available at: http://localhost:3001/api

Swagger docs: http://localhost:3001/api/docs

**If you still get "Database does not exist":**

```bash
# Best command for your setup
createdb -U pino -O pino lifemate

# Alternative using psql
psql -U pino -c "CREATE DATABASE lifemate OWNER pino;"

# Or as superuser
psql -U postgres -c "CREATE DATABASE lifemate OWNER pino;"

npm run db:push
npm run start:dev
```

## Useful Commands

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm run db:up`    | Start Postgres container             |
| `npm run db:down`  | Stop Postgres container              |
| `npm run db:migrate` | Run migrations + generate client   |
| `npm run db:push`  | Push schema directly (dev only)      |
| `npm run db:reset` | Reset database + run migrations      |
| `npm run db:generate` | Just regenerate Prisma Client     |

## Important
- All routes except `/auth/*` are JWT protected
- User ID is always taken from the JWT (never trust client)
- File uploads are stored in `./uploads`
- **AI / LLM features** (CV builder, career roadmaps, interview practice, skill analysis, smart chat) require `OPENAI_API_KEY` in `.env`.
- Supports any OpenAI-compatible API (OpenAI, Grok/xAI via compatible proxy, Anthropic via proxy, or local like Ollama with baseURL http://localhost:11434/v1).
- Set `OPENAI_BASE_URL` and `OPENAI_MODEL` to customize (defaults to gpt-4o-mini).
- Without key: graceful placeholder mode (basic responses only).
