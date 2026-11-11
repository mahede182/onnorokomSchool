---
name: backend-dotnet
description: >
  ASP.NET Core 8 feature-folder rules for Onnorokom School Admission API.
  Use when changing Features/, Common/, Infrastructure/, or Program.cs.
---

# Backend Rules (.NET — Feature Folders)

Inspired by [Feature Folders in .NET](https://milanjovanovic.tech/blog/feature-folders-dotnet).

## Structure

| Area | Responsibility | Location |
| --- | --- | --- |
| Feature slice | One use case: Request/Response, Handler, Endpoint | `Features/{Area}/{UseCase}/` |
| Shared domain | Entities, status constants | `Common/Domain/` |
| Persistence | `AdmissionDbContext` | `Common/Persistence/` |
| Cross-cutting | Student ID validation, errors | `Common/Validation/`, `Common/Contracts/` |
| Background | Hold expiry cleaner | `Infrastructure/Background/` |

- Register new handlers in `DependencyInjection.AddFeatureHandlers`.
- Prefer **one file per use case** (`CreateHold.cs`) until it exceeds ~300 lines.
- Keep MVC `*Endpoint` classes **top-level** (not nested inside the feature static class). Nested types are not controller-discovered (`Type.IsPublic == false`).
- Do **not** reintroduce layer folders (`Controllers/`, `Services/`, `DTOs/`) for new work.

## EF Core & PostgreSQL

- Connection string from config / `ConnectionStrings__DefaultConnection`.
- Schema changes require a migration.
- Seat writes: transaction + `SELECT … FOR UPDATE` on the class (or hold) row.

## HTTP & Auth

- Student identity: `X-Student-Id`, exactly 17 digits (`StudentIdValidator`).
- Keep assignment status codes (`201`, `204`, `400`, `403`, `404`, `409`).

## Testing

- Add/keep concurrency coverage under `AdmissionSystem.Api.Tests`.
- Run: `dotnet test backend/AdmissionSystem.sln` (requires Docker for Testcontainers).
