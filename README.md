# School Admission System

A full-stack school seat-booking (hold & confirm) application.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | ASP.NET Core 8 (Minimal + Controllers) |
| Database | PostgreSQL 16 |
| ORM | Entity Framework Core 8 + Npgsql |
| Frontend | React 18 + Vite |
| Infrastructure | Docker + Docker Compose |

## Project Structure

```
onnorokomSchool/
├── backend/
│   ├── AdmissionSystem.Api/
│   │   ├── Controllers/      # ClassesController, HoldsController, MeController
│   │   ├── Data/             # AdmissionDbContext
│   │   ├── DTOs/             # Request/Response records
│   │   ├── Migrations/       # EF Core migrations
│   │   ├── Models/           # ClassEntity, HoldEntity
│   │   ├── Services/         # AdmissionService, ExpiredHoldCleanerService
│   │   ├── Program.cs
│   │   └── appsettings.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main SPA (ClassesPage + MyApplicationsPage)
│   │   ├── api.js            # Thin fetch wrapper
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── .gitignore
```

## Running with Docker Compose (Recommended)

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger |
| PostgreSQL | localhost:5432 |

## Running Locally (Dev)

**Backend** (requires .NET 8 SDK):
```bash
cd backend/AdmissionSystem.Api
dotnet run
```

**Frontend** (requires Node 18+):
```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/classes` | Create a class |
| `GET` | `/classes` | List all classes with seat counts |
| `GET` | `/classes/{classId}` | Get one class |
| `POST` | `/classes/{classId}/holds` | Place a seat hold (requires `X-Student-Id` header) |
| `GET` | `/holds/{holdId}` | Get hold status |
| `POST` | `/holds/{holdId}/confirm` | Confirm a hold (requires `X-Student-Id` header) |
| `DELETE` | `/holds/{holdId}` | Cancel a hold (requires `X-Student-Id` header) |
| `GET` | `/me/holds` | List my holds (requires `X-Student-Id` header) |

## Business Rules Implemented

1. **Seat safety**: `confirmed + held ≤ totalSeats` enforced with `SELECT FOR UPDATE` row locking
2. **Hold expiry**: Default 10 minutes; configurable via `HOLD_DURATION_SECONDS` env var
3. **One hold per class per student**: A student cannot hold/confirm the same class twice
4. **Expiry enforcement**: Background service marks expired holds every 10 s; API reads live status
5. **Idempotent confirm**: Re-confirming the same hold returns 200 without double-booking
6. **Student ID validation**: 17-digit number enforced on all student-facing endpoints

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | (see appsettings.json) | Postgres connection string |
| `HOLD_DURATION_SECONDS` | `600` | Seconds before a hold expires |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Frontend build-time API base URL |
