export function formatCountdown(expiresAtIso, nowMs = Date.now()) {
  const end = new Date(expiresAtIso).getTime();
  if (Number.isNaN(end)) return '—';
  const remaining = Math.max(0, Math.floor((end - nowMs) / 1000));
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function isExpired(expiresAtIso, nowMs = Date.now()) {
  const end = new Date(expiresAtIso).getTime();
  return Number.isNaN(end) ? true : end <= nowMs;
}
