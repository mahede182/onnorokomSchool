# School Admission System

Full-stack school seat booking (hold → pay/confirm) for the Onnorokom take-home assignment.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | ASP.NET Core 8 (feature folders / vertical slices) |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 8 + Npgsql |
| Frontend | React 18 + Vite + React Router |
| Infrastructure | Docker + Docker Compose |

## Project Structure

```
onnorokomSchool/
├── backend/
│   ├── AdmissionSystem.Api/
│   │   ├── Features/           # Classes + Holds use-case slices
│   │   ├── Common/             # Domain, Persistence, Validation
│   │   ├── Infrastructure/     # Expired hold cleaner
│   │   ├── Migrations/
│   │   └── Program.cs
│   ├── AdmissionSystem.Api.Tests/  # Concurrency tests
│   ├── AdmissionSystem.sln
│   └── Dockerfile
├── frontend/                   # React SPA (pages/, api/, hooks/)
├── docker-compose.yml
├── ASSUMPTIONS.md
├── AI_USAGE.md
└── .env.example
```

## Running with Docker Compose (Recommended)

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| PostgreSQL | localhost:5432 |

## Running Locally (Dev)

**Backend** (.NET 8 SDK + Postgres):
```bash
cd backend/AdmissionSystem.Api
dotnet run
```

**Frontend** (Node 18+):
```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173
```

## Tests

Requires Docker (Testcontainers spins up Postgres):

```bash
cd backend
dotnet test AdmissionSystem.sln
```

Concurrency test: many parallel holds against a small class must not exceed `totalSeats`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/classes` | Create a class |
| `GET` | `/classes` | List all classes with seat counts |
| `GET` | `/classes/{classId}` | Get one class |
| `POST` | `/classes/{classId}/holds` | Place a seat hold (`X-Student-Id`) |
| `GET` | `/holds/{holdId}` | Get hold status |
| `POST` | `/holds/{holdId}/confirm` | Pay / confirm (`X-Student-Id`) |
| `DELETE` | `/holds/{holdId}` | Cancel (`X-Student-Id`) |
| `GET` | `/me/holds` | List my holds (`X-Student-Id`) |

## Business Rules

1. **Seat safety**: `confirmed + held ≤ totalSeats` with `SELECT FOR UPDATE`
2. **Hold expiry**: `HOLD_DURATION_SECONDS` (default 600); background cleaner + live status
3. **One hold per class per student**
4. **Idempotent confirm**
5. **17-digit student ID** on student-facing endpoints

## Environment Variables

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_*` | see `.env.example` | Postgres credentials |
| `ConnectionStrings__DefaultConnection` | localhost Postgres | Local API connection |
| `HOLD_DURATION_SECONDS` | `600` | Hold lifetime |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Frontend API base URL |

See also `ASSUMPTIONS.md` and `AI_USAGE.md`.
