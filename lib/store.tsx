"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Client, Company, Entry, Material, User } from "./types";
import { seedClients, seedCompanies, seedEntries, seedMaterials } from "./seed";
import { todayIso, uid } from "./format";

/**
 * UI-only data layer. Everything lives in React state and is mirrored to
 * localStorage so a refresh keeps your changes. Swap these functions for
 * server actions / Turso queries later — the pages won't need to change.
 */

type State = { user: User | null; clients: Client[]; companies: Company[]; materials: Material[]; entries: Entry[] };

type Store = State & {
  ready: boolean;
  // auth (fake)
  login: (email: string, name?: string) => void;
  logout: () => void;
  // clients
  addClient: (c: Omit<Client, "id" | "createdAt"> & { createdAt?: string }) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // companies (suppliers)
  addCompany: (c: Omit<Company, "id" | "createdAt">) => Company;
  updateCompany: (id: string, c: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  // catalog — a price change appends to the material's priceHistory
  // `date` (YYYY-MM-DD) is when the price applies; defaults to now
  addMaterial: (m: Omit<Material, "id" | "priceHistory">, date?: string) => Material;
  updateMaterial: (id: string, m: Partial<Omit<Material, "id" | "priceHistory">>, date?: string) => void;
  deleteMaterial: (id: string) => void;
  // entries
  addEntry: (e: Omit<Entry, "id">) => void;
  updateEntry: (id: string, e: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  resetDemo: () => void;
};

const KEY = "invoice-tracker:v1";
const initial: State = {
  user: null,
  clients: seedClients,
  companies: seedCompanies,
  materials: seedMaterials,
  entries: seedEntries,
};

const nowIso = () => new Date().toISOString();

/** Price-point timestamp for a picked day: today → now; another day → that day at the current local time. */
const atDate = (date?: string) => {
  if (!date || date === todayIso()) return nowIso();
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};
const today = todayIso;

/** Older saved data has no price history — start it at the current price. */
function migrate(s: State): State {
  return {
    ...s,
    materials: s.materials.map((m) => (m.priceHistory?.length ? m : { ...m, priceHistory: [{ at: nowIso(), price: m.price }] })),
  };
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(migrate({ ...initial, ...JSON.parse(raw) }));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const set = useCallback((fn: (s: State) => State) => setState(fn), []);

  const api = useMemo<Store>(
    () => ({
      ...state,
      ready,
      login: (email, name) =>
        set((s) => ({ ...s, user: { email, name: name || nameFromEmail(email) } })),
      logout: () => set((s) => ({ ...s, user: null })),

      addClient: (c) => {
        const client: Client = { ...c, id: uid(), createdAt: c.createdAt || today() };
        set((s) => ({ ...s, clients: [client, ...s.clients] }));
        return client;
      },
      updateClient: (id, c) =>
        set((s) => ({ ...s, clients: s.clients.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteClient: (id) =>
        set((s) => ({
          ...s,
          clients: s.clients.filter((x) => x.id !== id),
          entries: s.entries.filter((x) => x.clientId !== id),
        })),

      addCompany: (c) => {
        const company: Company = { ...c, id: uid(), createdAt: today() };
        set((s) => ({ ...s, companies: [...s.companies, company] }));
        return company;
      },
      updateCompany: (id, c) =>
        set((s) => ({ ...s, companies: s.companies.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      // Materials stay in the catalog without a company; entries keep their company snapshot.
      deleteCompany: (id) =>
        set((s) => ({
          ...s,
          companies: s.companies.filter((x) => x.id !== id),
          materials: s.materials.map((m) => (m.companyId === id ? { ...m, companyId: undefined } : m)),
        })),

      addMaterial: (m, date) => {
        const mat: Material = { ...m, id: uid(), priceHistory: [{ at: atDate(date), price: m.price }] };
        set((s) => ({ ...s, materials: [...s.materials, mat] }));
        return mat;
      },
      updateMaterial: (id, m, date) =>
        set((s) => ({
          ...s,
          materials: s.materials.map((x) => {
            if (x.id !== id) return x;
            const changed = m.price !== undefined && m.price !== x.price;
            return {
              ...x,
              ...m,
              priceHistory: changed ? [...x.priceHistory, { at: atDate(date), price: m.price! }] : x.priceHistory,
            };
          }),
        })),
      deleteMaterial: (id) => set((s) => ({ ...s, materials: s.materials.filter((x) => x.id !== id) })),

      addEntry: (e) => set((s) => ({ ...s, entries: [{ ...e, id: uid() }, ...s.entries] })),
      updateEntry: (id, e) =>
        set((s) => ({ ...s, entries: s.entries.map((x) => (x.id === id ? { ...x, ...e } : x)) })),
      deleteEntry: (id) => set((s) => ({ ...s, entries: s.entries.filter((x) => x.id !== id) })),

      resetDemo: () => set((s) => ({ ...initial, user: s.user })),
    }),
    [state, ready, set]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

function nameFromEmail(email: string) {
  const base = email.split("@")[0].replace(/[._-]+/g, " ");
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Helpers shared by pages */
export const entryTotal = (e: Entry) => e.qty * e.price;
export const sumEntries = (list: Entry[]) => list.reduce((t, e) => t + entryTotal(e), 0);
