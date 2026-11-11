/*
Purpose:
Format remaining hold time until expiresAt (set by API using HOLD_DURATION_SECONDS).

Response:
"m:ss" string, or "—" when invalid.

Business Rules:
- expiresAt from the API is authoritative
- Optional maxSeconds (from GET /config) caps display so UI never exceeds server window
*/
export function formatCountdown(expiresAtIso, nowMs = Date.now(), maxSeconds) {
  const end = new Date(expiresAtIso).getTime();
  if (Number.isNaN(end)) return '—';

  let remaining = Math.max(0, Math.floor((end - nowMs) / 1000));
  if (Number.isFinite(maxSeconds) && maxSeconds > 0) {
    remaining = Math.min(remaining, maxSeconds);
  }

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function isExpired(expiresAtIso, nowMs = Date.now()) {
  const end = new Date(expiresAtIso).getTime();
  return Number.isNaN(end) ? true : end <= nowMs;
}

export function formatHoldWindow(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m} min` : `${m}m ${s}s`;
}
