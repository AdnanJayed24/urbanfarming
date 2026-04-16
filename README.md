# Urban Farming Backend

Express + Prisma + PostgreSQL backend for an interactive urban farming platform with:

- JWT authentication and role-based access control
- Vendor approval and sustainability certification workflows
- Garden space rental and booking APIs
- Marketplace for organic produce, seeds, tools, and compost
- Real-time plant tracking updates via Server-Sent Events
- Community forum APIs
- Standardized JSON responses, pagination, and error handling
- Rate limiting for registration and login
- OpenAPI JSON docs and a benchmark metrics endpoint

## Quick Start

```bash
npm install
copy .env.example .env
npm run db:up
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

## PostgreSQL Setup

The default `.env` expects this connection string:

```bash
postgresql://postgres:postgres@localhost:5433/urbanfarming?schema=public
```

You have two supported ways to make that work:

### Option 1: Recommended, use Docker

```bash
npm run db:up
npm run prisma:migrate
npm run db:seed
```

This starts a PostgreSQL container with:

- username: `postgres`
- password: `postgres`
- database: `urbanfarming`
- host port: `5433`

To stop it later:

```bash
npm run db:down
```

### Option 2: Use your existing local PostgreSQL install

If you already have PostgreSQL running on port `5432`, update `.env` so `DATABASE_URL` uses your real local password and port `5432` instead of the Docker-friendly default above.

Example:

```bash
DATABASE_URL="postgresql://postgres:YOUR_REAL_PASSWORD@localhost:5432/urbanfarming?schema=public"
```

If the `urbanfarming` database does not exist yet, create it with:

```bash
createdb -U postgres urbanfarming
```

## Default URLs

- API base: `http://localhost:4000/api/v1`
- Health check: `http://localhost:4000/health`
- Docs index: `http://localhost:4000/api/docs`
- OpenAPI JSON: `http://localhost:4000/api/docs/openapi.json`
- Benchmark report: `http://localhost:4000/api/v1/metrics/benchmark`

## Benchmarking

```bash
npm run benchmark:run
```

The script times a small set of read endpoints, and the app also keeps a live per-route timing summary at `/api/v1/metrics/benchmark`.

## Seed Accounts

- Admin: `admin@urbanfarming.local` / `Password123!`
- Vendor: `vendor@urbanfarming.local` / `Password123!`
- Customer: `customer@urbanfarming.local` / `Password123!`
