export const SHIFTS = [
  { value: 'Morning Shift', label: 'Morning Shift' },
  { value: 'Night Shift', label: 'Night Shift' },
];

export const SHIFT_VALUES = SHIFTS.map((s) => s.value);

// Each shift is a distinct class; name embeds "– Morning/Night Shift".
export function buildClassName(baseName, shift) {
  const base = String(baseName || '').trim();
  const s = String(shift || '').trim();
  if (!base || !s) return base;
  return `${base} – ${s}`;
}

export function parseShift(className) {
  const name = String(className || '');
  const hit = SHIFT_VALUES.find((s) => name.endsWith(s) || name.includes(`– ${s}`) || name.includes(`- ${s}`));
  return hit || '';
}

export function matchesShift(className, shiftFilter) {
  if (!shiftFilter) return true;
  return parseShift(className) === shiftFilter;
}
