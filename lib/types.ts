export type Client = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  note?: string;
  createdAt: string; // ISO date
};

export type Material = {
  id: string;
  name: string;
  unit: string;
  price: number; // Vlera
};

/** One row of the client's sheet (Materiali, Data, Sasia, Vlera, Çmimi). */
export type Entry = {
  id: string;
  clientId: string;
  materialId: string;
  /** Snapshot of the catalog name/unit/price at the time it was added. */
  name: string;
  unit: string;
  price: number;
  qty: number;
  date: string; // YYYY-MM-DD
};

export type User = { name: string; email: string };
