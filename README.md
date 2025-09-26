# Train Scheduler

A full‑stack demo app for managing and viewing train schedules.

* **Mobile**: React Native (Expo, Expo Router, TypeScript), Zustand, React Query, React Hook Form + Zod
* **Backend**: NestJS, PostgreSQL, Prisma, JWT auth, Swagger, Socket.io for realtime

This README follows the task requirements from the "Test task for Full‑Stack React Native" brief and documents setup, features, API, and deployment.

---

## Monorepo layout

```
TrainScheduler/
├─ backend/                # NestJS API (Prisma + Postgres, Swagger, sockets)
│  ├─ src/
│  ├─ prisma/              # schema.prisma, seed.ts, migrations/*
│  └─ package.json
└─ mobile/                 # React Native app (Expo)
   ├─ app/                 # expo-router routes
   ├─ src/
   └─ package.json
```

---

## Features

### Authentication & Authorization

* JWT‑based login/registration
* RBAC (USER, ADMIN) via guards & decorators
* Refresh token rotation with server‑side storage and revocation

### Admin (schedule management)

* **Routes** CRUD + ordered **route stops**
* **Schedules** CRUD (train type, depart/arrive, status, delay)
* **Stops** CRUD
* DTO validation (class‑validator) and global ValidationPipe
* Swagger docs for all endpoints at **`/docs`**

### User features (mobile)

* Browse & filter schedules by **date**, **route**, **train type**
* View route details with ordered stops
* **Favorites**: save/unsave routes
* Auth flows (login, register, logout) with persistent tokens
* Robust error/loading states

### Realtime

* Socket.io gateway emits `schedule.changed`, `route.changed`, `stop.changed`
* Mobile subscribes and updates lists in place

---

## Tech stack

* **Frontend**: React Native (Expo SDK 52), Expo Router, TypeScript, Zustand, @tanstack/react-query v5, React Hook Form + Zod, @react-native-community/datetimepicker
* **Backend**: NestJS v11, Prisma v6, PostgreSQL, JWT, class‑validator, Swagger, Socket.io

---

## Quick start (local)

### Prereqs

* Node.js 18+ (tested on Node 22)
* PostgreSQL (local) or a cloud Postgres URL
* Yarn or npm

### 1) Backend

```bash
cd backend
cp .env.example .env   # if you have one; otherwise create .env as below
npm ci
npm run prisma:generate || npx prisma generate
# Create DB schema & seed (one‑off)
DATABASE_URL="postgresql://user:pass@localhost:5432/trains?schema=public" \
  npx prisma migrate dev --name init
npx prisma db seed
# Run API (dev)
npm run start:dev
```

Backend runs on **[http://localhost:3000](http://localhost:3000)** and Swagger is at **[http://localhost:3000/docs](http://localhost:3000/docs)**.

**.env (backend) example**

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trains?schema=public

# JWT / tokens
JWT_SECRET=super_secret_dev
JWT_REFRESH_SECRET=super_refresh_dev
JWT_ISSUER=trains-api
JWT_AUDIENCE=trains-mobile

# CORS (comma‑separated, includes Expo dev)
CORS_ORIGINS=http://localhost:3000,http://localhost:19006,http://localhost:8081,exp://

# Port (optional)
PORT=3000
```

### 2) Mobile

```bash
cd mobile
npm ci
# Point app to your API URL (no trailing slash)
EXPO_PUBLIC_API_URL=http://localhost:3000 npm start
# then press i / a to open iOS/Android, or use Expo Go
```

> The mobile client reads the API base from `process.env.EXPO_PUBLIC_API_URL` (defaults to `http://localhost:3000` if not set). Socket.io uses the same base.

---

## Database & Prisma

* Schema is in `backend/prisma/schema.prisma`
* Migrations live in `backend/prisma/migrations/`
* **Seed** is in `backend/prisma/seed.ts` and creates:

    * Admin: `admin@example.com` / `Admin123!`
    * User:  `user@example.com` / `User123!`
    * Demo stops, one route (Kyiv → Lviv), two schedules (today & tomorrow), and a favorite for the user

Run seed manually:

```bash
cd backend
npx prisma db seed
```

> Migrations **create/alter tables only**. To get demo data, run the seed.

---

## API overview

All endpoints are documented in Swagger at **`/docs`**. Selected endpoints:

### Auth

```
POST /auth/register   { email, password }
POST /auth/login      { email, password }
POST /auth/refresh    { refreshToken }
POST /auth/logout     { refreshToken }
```

* Access token in `Authorization: Bearer <token>`
* Refresh token is rotated and stored server‑side (revokable)

### Routes & Stops (ADMIN)

```
GET    /routes
GET    /routes/:id            # includes ordered stops (and schedules for a date)
POST   /routes                # { name, code }
PATCH  /routes/:id
DELETE /routes/:id

POST   /routes/:id/stops      # set ordered stops [{ stopId, order, minutesFromStart }]

GET    /stops
POST   /stops                 # { name, city, lat, lng }
PATCH  /stops/:id
DELETE /stops/:id
```

### Schedules

```
GET  /schedules?date=YYYY-MM-DD&routeId=&trainType=&page=1&pageSize=20
POST /schedules               # ADMIN
PATCH /schedules/:id          # ADMIN
DELETE /schedules/:id         # ADMIN
```

### Favorites (USER)

```
GET    /favorites
POST   /favorites             # { routeId }
DELETE /favorites/:routeId
```

### Realtime (Socket.io)

* Events emitted by server:

    * `schedule.changed` { type: CREATED|UPDATED|DELETED, scheduleId }
    * `route.changed`    { type, routeId }
    * `stop.changed`     { type, stopId?, routeId? }
* Mobile subscribes and updates lists in place

---

## Mobile app — notable screens

* **Auth**: Login, Register
* **Tabs**: Home (schedules), Favorites, Profile, Admin (for admins)
* **Schedule filters**: date picker, route dropdown, train type chips
* **Schedule details**: route info, depart/arrive, status/delay
* **Admin screens**: manage routes, stops, schedules

State & data fetching:

* Zustand store for filters/auth
* React Query for caching, pagination, retry, and mutation flows
* React Hook Form + Zod for form validation

---

## Deployment (Railway example)

**Backend**

1. Create a Postgres plugin, copy **POSTGRES_PRISMA_URL** (or POSTGRES_URL + POSTGRES_URL_NON_POOLING)
2. In the **backend** service Variables:

    * `DATABASE_URL` = your Postgres URL (prefer the Prisma one)
    * `CORS_ORIGINS` = `exp://,http://localhost:19006,https://your-app-domain`
    * `JWT_*` as in `.env`
3. **Start Command**: `npm start` (we use a `prestart` script to run `prisma migrate deploy` and optional seed)
4. (Optional) Add `SEED_ON_START=true` once to run seed automatically, then remove it

**Mobile**

* Set `EXPO_PUBLIC_API_URL` to the backend public URL (e.g., `https://your-api.up.railway.app`)
* Build with EAS or run via Expo Go

---

## Demo credentials

* **Admin**: `admin@example.com` / `Admin123!`
* **User**:  `user@example.com` / `User123!`

---

## Known limitations / scope notes

* Only a subset of real‑world validations are implemented (e.g., timetable overlaps)
* Single demo route & minimal seed data by default
* Push notifications are not included; realtime updates are via Socket.io

---

## Scripts reference

**backend/package.json** (key scripts)

* `start` — Nest dev server
* `prestart` — `prisma migrate deploy` (+ optional seed via `SEED_ON_START=true`)
* `start:dev` — watch mode
* `postinstall` — `prisma generate`
* `seed` — `prisma db seed`

**mobile/package.json**

* `start` — Expo dev server
* `android` / `ios` / `web` — platform helpers

---

## License

UNLICENSED (for the purposes of the test task)
