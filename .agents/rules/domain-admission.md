---
name: domain-admission
description: >
  Business rules for school seat holds and confirmations.
  Use when changing hold/confirm/cancel/list flows or seat counting.
---

# Admission Domain Rules

These rules are product requirements. Do not weaken them without an explicit product decision.

## Seat Safety

- Invariant: `confirmedSeats + heldSeats ≤ totalSeats` for every class.
- Enforce under concurrency (transaction + row lock on the class row).
- `availableSeats = totalSeats - confirmedSeats - heldSeats` (never negative).

## Holds

- Default hold duration: 600 seconds (`HOLD_DURATION_SECONDS`).
- A student may not create another hold for a class they already hold or confirmed.
- Expired holds must not count toward seat occupancy (cleaner + live status on read).
- Cancel only allowed for the owning student and non-terminal holds.

## Confirm

- Confirm requires the owning student ID.
- Confirm is idempotent: repeating confirm on the same hold returns success without double-booking.
- Confirming an expired/cancelled hold must fail clearly.

## Student Identity

- Student ID: exactly 17 digits on all student-facing endpoints (`create hold`, `confirm`, `cancel`, `me/holds`).
- Do not invent a different auth scheme unless requested.

## API Surface (current)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/classes` | Create class |
| GET | `/classes` | List with seat counts |
| GET | `/classes/{classId}` | One class |
| POST | `/classes/{classId}/holds` | Hold seat (`X-Student-Id`) |
| GET | `/holds/{holdId}` | Hold status |
| POST | `/holds/{holdId}/confirm` | Confirm (`X-Student-Id`) |
| DELETE | `/holds/{holdId}` | Cancel (`X-Student-Id`) |
| GET | `/me/holds` | My holds (`X-Student-Id`) |
