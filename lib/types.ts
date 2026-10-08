export type Client = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  note?: string;
  createdAt: string; // ISO date
};

/** Supplier the materials are bought from. */
export type Company = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  note?: string;
  createdAt: string; // ISO date
};

/** One catalog price, recorded every time the price is set or changed. */
export type PricePoint = {
  at: string; // ISO date-time
  price: number;
};

export type Material = {
  id: string;
  name: string;
  unit: string;
  price: number; // Vlera — always equals the last priceHistory point
  companyId?: string;
  /** Oldest first. */
  priceHistory: PricePoint[];
};

/** One row of the client's sheet (Materiali, Data, Sasia, Vlera, Çmimi). */
export type Entry = {
  id: string;
  clientId: string;
  materialId: string;
  /** Snapshot of the catalog name/unit/price/company at the time it was added. */
  name: string;
  unit: string;
  price: number;
  companyId?: string;
  companyName?: string;
  qty: number;
  date: string; // YYYY-MM-DD
  /** Taken from my stock — counts against the material's stock level. */
  fromStock?: boolean;
};

/** A stock purchase: bought `qty` of a material at `price` per unit (purchase cost, not the catalog price). */
export type StockIn = {
  id: string;
  materialId: string;
  companyId?: string;
  qty: number;
  price: number;
  date: string; // YYYY-MM-DD
  note?: string;
};

export type User = { name: string; email: string };
