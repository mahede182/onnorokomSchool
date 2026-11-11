# New Feature Implementation Guideline

### Step 1: Plan

```
Capability?     → One use case (e.g. waitlist join)
API contract?   → Method + path + headers
DB change?      → Migration?
UI surface?     → Which page?
Seat impact?    → Locking / idempotency?
```

### Step 2: Backend slice

```
Features/{Area}/{UseCase}/{UseCase}.cs
  - Request / Response records
  - Handler (business rules)
  - Endpoint (HTTP mapping)
```

Register the handler in `DependencyInjection.cs`.

### Step 3: Persistence

Update `Common/Domain` + migration when schema changes.

### Step 4: Frontend

1. Add `api/` method
2. Hook and/or page under `pages/`
3. Route in `constants/routes.js` + `App.jsx` when needed

### Step 5: Verify

- [ ] Seat invariant under concurrency
- [ ] Student ID validation
- [ ] Status codes match assignment
- [ ] UI shows errors (no blank page)
- [ ] Files stay under ~300 lines where practical
