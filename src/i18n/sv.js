// Swedish locale helpers for the /sv/ pilot. Kept small and self-contained so
// the Finnish site is never touched. ISO week math is shared (dateUtils) — only
// the language-specific names and formatting live here.

// getDay() is Sunday-indexed (0 = Sunday).
export const SV_WEEKDAYS = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];

export const SV_MONTHS = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

export function svWeekday(date) {
  return SV_WEEKDAYS[date.getDay()];
}

// "26 juli 2026"
export function svDate(date) {
  return `${date.getDate()} ${SV_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "20 juli" (no year) — for compact ranges
export function svDateShort(date) {
  return `${date.getDate()} ${SV_MONTHS[date.getMonth()]}`;
}
