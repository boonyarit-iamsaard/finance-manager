# Finance Manager

A personal finance manager built as a TypeScript monorepo. The app currently includes a React web client, a Hono API server, Better Auth authentication, shared UI primitives, and a PostgreSQL database managed with Drizzle.

## Stack

- Bun for package management and runtime
- Turborepo for workspace task orchestration
- React, Vite, and TanStack Router for `apps/web`
- Hono for `apps/server`
- Better Auth for authentication
- PostgreSQL and Drizzle for persistence
- Tailwind CSS and shared shadcn-style primitives in `packages/ui`
- Biome for formatting and linting
- Vitest, Testing Library, and Playwright for web testing

## Repository Layout

```text
finance-manager/
├── apps/
│   ├── server/      # Hono API server
│   └── web/         # React frontend
├── packages/
│   ├── auth/        # Better Auth setup
│   ├── config/      # Shared TypeScript config
│   ├── db/          # Drizzle schema and database scripts
│   ├── env/         # Environment validation
│   └── ui/          # Shared UI components and styles
```

## Prerequisites

- Bun `1.3.13`
- Docker, for the local PostgreSQL container
- Playwright browser dependencies, if you want to run browser smoke tests locally

## First Run

Install dependencies:

```bash
bun install
```

Create local environment files:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

Start PostgreSQL:

```bash
bun run db:start
```

Apply the current schema:

```bash
bun run db:push
```

Start the web and server apps:

```bash
bun run dev
```

Default local URLs:

- Web: <http://localhost:3000>
- Server: <http://localhost:4000>
- Database: `postgresql://postgres:postgres@localhost:5432/finance_manager`

## Development Commands

Run everything in development mode:

```bash
bun run dev
```

Run one app:

```bash
bun run dev:web
bun run dev:server
```

Build all workspaces:

```bash
bun run build
```

Format and lint:

```bash
bun run check
```

Type-check all workspaces:

```bash
bun run types:check
```

Run the full project CI-style check:

```bash
bun run ci:check
```

## Database Commands

```bash
bun run db:start      # start local PostgreSQL
bun run db:stop       # stop local PostgreSQL
bun run db:down       # remove local PostgreSQL container/network
bun run db:push       # push schema changes
bun run db:generate   # generate Drizzle migrations
bun run db:migrate    # run Drizzle migrations
bun run db:studio     # open Drizzle Studio
```

Database configuration is read from `apps/server/.env`.

## Testing

Run the web unit/component suite:

```bash
bun run test:web
```

The current Vitest coverage focuses on the behavior that exists today:

- auth schema validation
- login and signup form rendering
- pending session state
- invalid submit blocking
- successful auth callbacks, navigation, and toast side effects

Run Playwright smoke tests:

```bash
bun run test:e2e:web
```

The smoke suite covers:

- public home page call to action
- login/signup route navigation
- unauthenticated dashboard redirect to login

If Playwright cannot launch Chromium, install the browser and OS dependencies:

```bash
bunx playwright install chromium
bunx playwright install-deps chromium
```

`install-deps` may require sudo on Linux.

On Ubuntu, if you prefer to fix missing Chromium libraries one at a time, these packages resolved the local setup used for this repo:

```bash
sudo apt install libnspr4 libnss3 libasound2t64 libasound2-data
```

If Chromium fails with an ALSA symbol error like `snd_device_name_get_hint`, make sure `libasound.so.2` is provided by Ubuntu's ALSA package:

```bash
dpkg -S /usr/lib/x86_64-linux-gnu/libasound.so.2
```

Expected output should reference `libasound2t64`, not `liboss4-salsa-asound2`.

## UI Package

Shared components live in `packages/ui` and are imported by apps through the workspace alias:

```tsx
import { Button } from "@finance-manager/ui/components/button";
```

Use shared primitives for reusable UI. Keep app-specific page and feature components inside the app that owns them.

## Notes

- `apps/web` runs on port `3000`.
- `apps/server` runs on port `4000`.
- The generated TanStack Router tree is excluded from Biome checks.
- Playwright tests intentionally mock the auth session endpoint so browser smoke tests do not require the API or database to be running.
