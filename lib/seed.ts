import type { Client, Company, Entry, Material, PricePoint } from "./types";

// Mock data — replaced by Turso later.

export const seedCompanies: Company[] = [
  { id: "co1", name: "Fero-Beton Sh.p.k.", phone: "038 500 100", address: "Prishtinë", createdAt: "2024-01-10" },
  { id: "co2", name: "Tulltorja Kosova", phone: "029 222 333", address: "Ferizaj", createdAt: "2024-01-15" },
  { id: "co3", name: "Termo-Izol", phone: "044 300 400", address: "Gjilan", createdAt: "2024-02-01" },
];

/** [date, price] pairs, oldest first; the last one is the current catalog price. */
const h = (...points: [string, number][]): PricePoint[] => points.map(([d, price]) => ({ at: `${d}T09:00:00`, price }));

const mat = (id: string, name: string, unit: string, companyId: string, priceHistory: PricePoint[]): Material => ({
  id,
  name,
  unit,
  companyId,
  priceHistory,
  price: priceHistory[priceHistory.length - 1].price,
});

export const seedMaterials: Material[] = [
  // Prices in Macedonian denar (Den)
  mat("m1", "Çimento 25kg", "thes", "co1", h(["2024-01-12", 355], ["2024-09-02", 380], ["2025-03-15", 425], ["2025-11-20", 400])),
  mat("m2", "Rërë", "m³", "co1", h(["2024-01-12", 1540], ["2025-02-10", 1660], ["2026-04-01", 1720])),
  mat("m3", "Tulla 25×12", "copë", "co2", h(["2024-01-20", 23], ["2024-06-15", 25], ["2025-05-05", 28], ["2026-01-08", 26])),
  mat("m4", "Hekur armature Ø12", "shufër", "co1", h(["2024-01-12", 530], ["2024-08-01", 500], ["2025-06-12", 460], ["2026-02-03", 485])),
  mat("m5", "Gips 25kg", "thes", "co3", h(["2024-02-05", 565], ["2025-04-18", 600])),
  mat("m6", "Rrjetë fasade", "m²", "co3", h(["2024-02-05", 860], ["2025-09-01", 940])),
  mat("m7", "Ngjitës pllakash 25kg", "thes", "co3", h(["2024-02-05", 485], ["2024-12-01", 505], ["2026-03-10", 525])),
  mat("m8", "Stiropor 5cm", "m²", "co3", h(["2024-02-05", 285], ["2025-01-15", 270], ["2025-10-10", 260])),
  mat("m9", "Çimento e bardhë 25kg", "thes", "co1", h(["2024-03-01", 515], ["2025-07-07", 555])),
];

export const seedClients: Client[] = [
  { id: "c1", name: "Arben Krasniqi", phone: "044 123 456", address: "Prishtinë", createdAt: "2024-03-12" },
  { id: "c2", name: "Ndërtimi Sh.p.k.", phone: "038 220 330", address: "Ferizaj", createdAt: "2024-05-20" },
  { id: "c3", name: "Drita Berisha", phone: "045 987 654", address: "Gjilan", createdAt: "2025-02-01" },
  { id: "c4", name: "Besnik Gashi", phone: "049 111 222", address: "Pejë", createdAt: "2025-06-05" },
  { id: "c5", name: "Fatmir Hoxha", phone: "044 765 432", createdAt: "2026-09-09" },
];

/** Catalog price that was valid on a given day. */
const priceOn = (m: Material, date: string) =>
  [...m.priceHistory].reverse().find((p) => p.at.slice(0, 10) <= date)?.price ?? m.priceHistory[0].price;

let n = 0;
const e = (clientId: string, materialId: string, qty: number, date: string): Entry => {
  const m = seedMaterials.find((x) => x.id === materialId)!;
  const co = seedCompanies.find((c) => c.id === m.companyId);
  return {
    id: `e${++n}`,
    clientId,
    materialId,
    name: m.name,
    unit: m.unit,
    price: priceOn(m, date),
    companyId: co?.id,
    companyName: co?.name,
    qty,
    date,
  };
};

export const seedEntries: Entry[] = [
  // 2026
  e("c1", "m1", 40, "2026-10-02"),
  e("c1", "m2", 6, "2026-10-03"),
  e("c1", "m3", 500, "2026-10-05"),
  e("c1", "m4", 80, "2026-09-12"),
  e("c1", "m5", 30, "2026-09-18"),
  e("c1", "m6", 12, "2026-09-25"),

  e("c2", "m1", 120, "2026-10-04"),
  e("c2", "m2", 18, "2026-10-01"),
  e("c2", "m3", 2000, "2026-09-28"),
  e("c2", "m4", 60, "2026-09-20"),
  e("c2", "m7", 40, "2026-09-15"),
  e("c2", "m8", 90, "2026-09-10"),
  e("c2", "m6", 20, "2026-09-03"),
  e("c2", "m5", 15, "2026-08-29"),

  e("c3", "m7", 30, "2026-09-28"),
  e("c3", "m5", 25, "2026-09-22"),
  e("c3", "m8", 60, "2026-09-14"),
  e("c3", "m9", 10, "2026-09-02"),

  e("c4", "m1", 50, "2026-09-21"),
  e("c4", "m2", 5, "2026-09-18"),
  e("c4", "m3", 300, "2026-09-11"),

  e("c5", "m1", 20, "2026-09-10"),
  e("c5", "m8", 45, "2026-09-08"),

  // 2025
  e("c1", "m1", 60, "2025-04-10"),
  e("c1", "m3", 1200, "2025-05-22"),
  e("c1", "m4", 40, "2025-07-03"),
  e("c2", "m1", 200, "2025-03-28"),
  e("c2", "m2", 25, "2025-06-14"),
  e("c2", "m3", 3000, "2025-08-19"),
  e("c2", "m7", 60, "2025-10-02"),
  e("c3", "m5", 40, "2025-02-20"),
  e("c3", "m8", 120, "2025-11-11"),
  e("c4", "m1", 30, "2025-06-25"),
  e("c4", "m6", 35, "2025-09-30"),

  // 2024
  e("c1", "m1", 80, "2024-03-15"),
  e("c1", "m2", 10, "2024-04-02"),
  e("c1", "m3", 1500, "2024-05-18"),
  e("c2", "m4", 120, "2024-06-07"),
  e("c2", "m1", 150, "2024-07-21"),
  e("c2", "m6", 40, "2024-10-09"),
  e("c2", "m9", 15, "2024-11-30"),
];
