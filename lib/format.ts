/** Macedonian denar: 1,250 Den / 26.50 Den (decimals only when needed) */
export const den = (v: number) =>
  v.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }) + " Den";

/** 2026-10-07 -> 07.10.2026 */
export const dateSq = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

/** ISO date-time -> 07.10.2026 14:32 (local time) */
export const dateTimeSq = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** ISO date-time -> local calendar day YYYY-MM-DD */
export const localDay = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const todayIso = () => localDay(new Date().toISOString());

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const uid = () => Math.random().toString(36).slice(2, 10);

export const UNITS = ["copë", "thes", "kg", "m", "m²", "m³", "litër", "pako", "shufër", "palë"];
