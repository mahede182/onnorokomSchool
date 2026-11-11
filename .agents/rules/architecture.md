# Onnorokom School — Architecture Rules

> Core structural rules. Engineering principles live in `AGENTS.md`.

## New Feature Implementation Guideline

**Read**: `rules/new-feature-guide.md`

## Architecture Rules

### Backend (feature folders)

- One **use case** per folder under `Features/{Area}/{UseCase}/`.
- Slice contains Request/Response + Handler + thin Endpoint (controller).
- Shared entities/DbContext live in `Common/`, not duplicated per feature.
- Background expiry stays in `Infrastructure/Background`.

### Frontend

- Thin API layer: `frontend/src/api/`.
- Pages as route containers under `pages/`.
- Browser routing with shareable URLs, titles, and route focus management.
- Poll seat/application data; persist student ID in `localStorage`.

### Cross-cutting

- Docker Compose is the default integration path.
- Do not introduce Redux, Firebase, React Native, or MediatR unless requested.

## Testing Rules

- Prefer testing domain rules and **concurrency** in the test project.
- Frontend keeps fetch in `api/` for mockability.

## Quick References

- `rules/backend-dotnet.md`
- `rules/frontend-react.md`
- `rules/domain-admission.md`
