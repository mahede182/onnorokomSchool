# Assumptions

Assumptions made where the take-home assignment left room for interpretation.

## Identity & roles

- There is **no login**. Guardians and school admins share one UI.
- Student identity is the **17-digit birth registration number**, sent as `X-Student-Id`.
- Creating a class is treated as an **admin** action (no separate admin auth). Applying / paying / cancelling requires a student ID.

## Holds & payment

- **“Pay Admission Fee”** calls `POST /holds/{holdId}/confirm` and always simulates success (no payment gateway).
- Hold duration defaults to **600 seconds** via `HOLD_DURATION_SECONDS` (backend); UI reads it from `GET /config`.
- A student may have at most **one active** (`HELD` non-expired or `CONFIRMED`) application **per class**.
- Expired holds are reflected **on read** immediately and also marked `EXPIRED` by a background cleaner (~10s).

## Concurrency (seat safety)

- Seat invariant: `held + confirmed ≤ totalSeats` for every class.
- Enforced with a PostgreSQL transaction and **`SELECT … FOR UPDATE`** on the class row before inserting a hold.
- This remains safe if **two API processes** share the same database, because locking is in Postgres, not in-process memory.
- Confirmed by automated concurrency test: `AdmissionSystem.Api.Tests` → `SeatHoldConcurrencyTests`.

## Persistence

- PostgreSQL volume in Docker Compose retains data across `docker compose down` / `up` (unless volumes are removed).
- Frontend stores the student ID in **`localStorage`** so applications remain usable after refresh/reopen.

## UI behaviour

- Class seat counts **poll every 5 seconds**.
- My Applications polls every **3 seconds** and updates countdown / `EXPIRED` every **1 second** without reload.
- API base URL comes from `VITE_API_BASE_URL` (see `.env.example`).

## Architecture

- Backend uses **feature folders** (vertical slices) inspired by [Milan Jovanović – Feature Folders in .NET](https://milanjovanovic.tech/blog/feature-folders-dotnet).
- Shared persistence/domain live under `Common/`; each use case under `Features/{Area}/{UseCase}/`.
- Frontend visual language inspired by [Admission Page Design (Dribbble)](https://dribbble.com/shots/23312568-Admission-Page-Design-of-School-Portfolio-Website).
