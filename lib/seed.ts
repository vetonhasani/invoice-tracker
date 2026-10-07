import type { Client, Entry, Material } from "./types";

// Mock data — replaced by Turso later.

export const seedMaterials: Material[] = [
  { id: "m1", name: "Çimento 25kg", unit: "thes", price: 6.5 },
  { id: "m2", name: "Rërë", unit: "m³", price: 28 },
  { id: "m3", name: "Tulla 25×12", unit: "copë", price: 0.42 },
  { id: "m4", name: "Hekur armature Ø12", unit: "shufër", price: 7.9 },
  { id: "m5", name: "Gips 25kg", unit: "thes", price: 9.8 },
  { id: "m6", name: "Rrjetë fasade", unit: "m²", price: 15.25 },
  { id: "m7", name: "Ngjitës pllakash 25kg", unit: "thes", price: 8.5 },
  { id: "m8", name: "Stiropor 5cm", unit: "m²", price: 4.2 },
  { id: "m9", name: "Çimento e bardhë 25kg", unit: "thes", price: 9 },
];

export const seedClients: Client[] = [
  { id: "c1", name: "Arben Krasniqi", phone: "044 123 456", address: "Prishtinë", createdAt: "2026-08-12" },
  { id: "c2", name: "Ndërtimi Sh.p.k.", phone: "038 220 330", address: "Ferizaj", createdAt: "2026-08-20" },
  { id: "c3", name: "Drita Berisha", phone: "045 987 654", address: "Gjilan", createdAt: "2026-09-01" },
  { id: "c4", name: "Besnik Gashi", phone: "049 111 222", address: "Pejë", createdAt: "2026-09-05" },
  { id: "c5", name: "Fatmir Hoxha", phone: "044 765 432", createdAt: "2026-09-09" },
];

const m = (id: string) => seedMaterials.find((x) => x.id === id)!;
let n = 0;
const e = (clientId: string, materialId: string, qty: number, date: string): Entry => {
  const mat = m(materialId);
  return { id: `e${++n}`, clientId, materialId, name: mat.name, unit: mat.unit, price: mat.price, qty, date };
};

export const seedEntries: Entry[] = [
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
];
