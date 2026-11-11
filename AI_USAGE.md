# AI Usage

## Tools used

- **Cursor** (Composer / agent) for scaffolding, refactoring, and documentation drafts.

## Where AI helped

- Initial full-stack scaffold (ASP.NET Core API, React/Vite UI, Docker Compose).
- Refactor of backend into **feature folders** (Classes / Holds slices) aligned with Milan Jovanović’s feature-folder article.
- Frontend structure (`pages/`, hooks, polling, accessibility/browser SPA patterns).
- Drafts of `README.md`, `ASSUMPTIONS.md`, concurrency test outline, and agent rules under `.agents/`.

## Where AI was wrong / incomplete (and corrections)

- Early agent rules / structure mirrored an unrelated **React Native** project; rewritten for this admission stack.
- Suggested mobile-only folders (Firebase, XState, Restyle); removed — kept Vite SPA conventions.
- Duplicate / empty EF migrations and layer folders after the feature refactor; cleaned to a single `InitialCreate` + updated model snapshot namespaces.
- Docker `ConnectionStrings` briefly reused `Host=localhost` from `.env`; fixed so Compose always uses hostname `postgres`.
- Frontend “Confirm” wording updated to **Pay Admission Fee**; added polling, countdown, `localStorage` persistence, and friendlier network errors as required by the assignment UI rules.

## Human responsibility

- Final review of business rules (seat locking, idempotent confirm, student-ID validation).
- Verification of API contract paths/status codes against the assignment.
- Decision to keep Controllers-per-slice (feature-local) rather than introducing MediatR/Scrutor for this assignment size.
