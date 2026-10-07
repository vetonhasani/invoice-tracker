"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Client, Entry, Material, User } from "./types";
import { seedClients, seedEntries, seedMaterials } from "./seed";
import { uid } from "./format";

/**
 * UI-only data layer. Everything lives in React state and is mirrored to
 * localStorage so a refresh keeps your changes. Swap these functions for
 * server actions / Turso queries later — the pages won't need to change.
 */

type State = { user: User | null; clients: Client[]; materials: Material[]; entries: Entry[] };

type Store = State & {
  ready: boolean;
  // auth (fake)
  login: (email: string, name?: string) => void;
  logout: () => void;
  // clients
  addClient: (c: Omit<Client, "id" | "createdAt">) => Client;
  updateClient: (id: string, c: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  // catalog
  addMaterial: (m: Omit<Material, "id">) => Material;
  updateMaterial: (id: string, m: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  // entries
  addEntry: (e: Omit<Entry, "id">) => void;
  updateEntry: (id: string, e: Partial<Entry>) => void;
  deleteEntry: (id: string) => void;
  resetDemo: () => void;
};

const KEY = "invoice-tracker:v1";
const initial: State = { user: null, clients: seedClients, materials: seedMaterials, entries: seedEntries };

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
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
        const client: Client = { ...c, id: uid(), createdAt: new Date().toISOString().slice(0, 10) };
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

      addMaterial: (m) => {
        const mat: Material = { ...m, id: uid() };
        set((s) => ({ ...s, materials: [...s.materials, mat] }));
        return mat;
      },
      updateMaterial: (id, m) =>
        set((s) => ({ ...s, materials: s.materials.map((x) => (x.id === id ? { ...x, ...m } : x)) })),
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
