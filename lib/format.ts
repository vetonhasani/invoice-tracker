export const euro = (v: number) =>
  "€" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 2026-10-07 -> 07.10.2026 */
export const dateSq = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

export const todayIso = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const MONTHS_SQ = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];

/** "2026-10" -> "Tetor 2026" */
export const monthLabel = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MONTHS_SQ[Number(m) - 1]} ${y}`;
};

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
