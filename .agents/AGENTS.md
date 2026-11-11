# Onnorokom School — Universal Rules

These principles are the single source of truth for the School Admission System. Every feature and change must follow them.

## Engineering Principles

| Principle | What It Means Here |
| --- | --- |
| **KISS** | Simple solutions first. No abstractions until needed twice. |
| **SOLID** | Feature handlers own one use case; endpoints stay thin. |
| **DRY** | Share seat queries / validators in `Common/` or feature `Shared/`. |
| **Separation of Concerns** | Feature slice = HTTP + handler. Persistence in `Common/Persistence`. |
| **Fail Fast** | Validate student ID, seats, and ownership early; return clear status codes. |
| **Never break seat safety** | `confirmed + held ≤ totalSeats` must always hold under concurrency. |
| **File Size** | Prefer files under ~300 lines. Split a slice when it becomes hard to scroll. |

## Tech Stack

```
Backend:   ASP.NET Core 8 + EF Core 8 + Npgsql + PostgreSQL 16 (feature folders)
Frontend:  React 18 + Vite (JSX) + React Router + plain CSS
Infra:     Docker + Docker Compose
Auth:      X-Student-Id header (17-digit student ID)
Docs:      Swagger at /swagger
```

## Project Structure

```
onnorokomSchool/
├── backend/
│   ├── AdmissionSystem.Api/
│   │   ├── Features/
│   │   │   ├── Classes/          # CreateClass, GetClasses, GetClassById
│   │   │   └── Holds/            # CreateHold, GetHold, ConfirmHold, CancelHold, GetMyHolds
│   │   ├── Common/               # Domain, Persistence, Validation, Contracts
│   │   ├── Infrastructure/       # Background cleaner
│   │   ├── Migrations/
│   │   ├── DependencyInjection.cs
│   │   └── Program.cs
│   └── AdmissionSystem.Api.Tests/  # Concurrency tests
├── frontend/src/                   # pages/, api/, hooks/, …
├── docker-compose.yml
├── ASSUMPTIONS.md
└── AI_USAGE.md
```

### Backend feature folders

Organize by **use case**, not by Controllers/Services/DTOs layers ([Milan Jovanović](https://milanjovanovic.tech/blog/feature-folders-dotnet)):

```
Features/{Area}/{UseCase}/{UseCase}.cs   # Request/Response + Handler + Endpoint
Common/Domain|Persistence|Validation
Infrastructure/Background
```

## Naming Conventions

| Convention | Usage | Example |
| --- | --- | --- |
| PascalCase | C# types; React pages | `CreateHold.Handler`, `ClassesPage` |
| camelCase | JS functions, hooks | `studentId`, `useClasses` |
| kebab-case | CSS / page folders | `my-applications` |
| UPPER_CASE | Env / route constants | `HOLD_DURATION_SECONDS`, `ROUTES.CLASSES` |

## Quick Reference

| I need to... | Put it in... |
| --- | --- |
| Add an API use case | `Features/{Area}/{UseCase}/` + register handler in `DependencyInjection.cs` |
| Change seat/hold rules | The relevant Holds/Classes handler |
| Shared student-ID validation | `Common/Validation/StudentIdValidator.cs` |
| Schema change | `Common/Domain` + EF migration |
| Call API from UI | `frontend/src/api/` then page/hook |
| Concurrency proof | `AdmissionSystem.Api.Tests` |

## Domain Non-Negotiables

1. Seat invariant: `confirmed + held ≤ totalSeats` (transaction + `FOR UPDATE`).
2. One active hold or confirmation per student per class.
3. Hold expiry default 10 minutes; cleaner + live status on read.
4. Confirm is idempotent for the same hold.
5. Student ID must be exactly 17 digits on student-facing endpoints.

## Guides

- `rules/architecture.md`
- `rules/new-feature-guide.md`
- `rules/backend-dotnet.md`
- `rules/frontend-react.md`
- `rules/domain-admission.md`
