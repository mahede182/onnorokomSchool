---
name: frontend-react
description: >
  React 18 + Vite frontend rules for Onnorokom School Admission SPA.
  Use when editing pages, api/, components, theme, routing, or frontend Docker/nginx.
---

# Frontend Rules (React + Vite)

## Stack Constraints

- React 18 + Vite + JSX + React Router (BrowserRouter).
- Local state + React Context by default — no Redux/XState/Firebase unless requested.
- Styling in `src/theme/index.css` with CSS variables and semantic class names.

## Folder Placement

| Concern | Location |
| --- | --- |
| HTTP | `src/api/` |
| Reusable UI | `src/components/` |
| Page UI | `src/pages/<page>/` + `components/` |
| Shared student ID | `src/contexts/StudentContext.jsx` |
| Data / focus / title hooks | `src/hooks/` |
| Navigation chrome | `src/navigation/` (real `NavLink`s) |
| Routes | `src/constants/routes.js` |
| Types (JSDoc) | `src/@types/` |

## Browser SPA Best Practices

- **Real URLs**: every view has a route (`/`, `/applications`); support back/forward and deep links.
- **Real links**: use `NavLink`/`Link` (`<a href>`), not button-only fake navigation.
- **Document title**: update via `useDocumentTitle` on each page.
- **Focus on route change**: focus `#main-content` (`useRouteFocus`) after navigation.
- **Skip link**: provide “Skip to main content”.
- **Landmarks**: `header`, `nav aria-label="Main"`, `main`.
- **Forms**: associate labels with `htmlFor`/`id`; set `aria-invalid` + live alerts on errors.
- **Announcements**: alerts use `role="alert"` / `role="status"` + `aria-live`.
- **Motion**: respect `prefers-reduced-motion`.
- **Focus styles**: use `:focus-visible` (never remove focus without replacement).

## API Access (§1.4 contract)

- All network calls go through `src/api/` (never raw `fetch` in pages).
- Paths live in `src/api/paths.js` — must match assignment endpoints exactly.
- Base URL: `config/env.js` → `VITE_API_BASE_URL` (default `http://localhost:8080`).
- Student actions send `X-Student-Id` (17-digit birth registration).
- JSON only; callers may read extra fields but must not rename/drop contract fields.

## UX Rules

- Require a 17-digit Student ID before hold/confirm/cancel.
- Show hold expiry in readable local time (`<time dateTime>` when possible).
- Disable hold when `availableSeats === 0` or request in flight.
- Refresh lists after successful mutations.
