"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Ellipsis, Package, Pencil, Plus, Trash2, Users, Wallet } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { Fab, PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, Confirm, Empty, Menu, SearchBox, Stat } from "@/components/ui";
import { useToast } from "@/components/toast";
import { dateSq, euro } from "@/lib/format";
import { sumEntries, useStore } from "@/lib/store";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const { clients, entries, addClient, updateClient, deleteClient } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState<Client | null>(null);

  const rows = useMemo(() => {
    return clients
      .map((c) => {
        const list = entries.filter((e) => e.clientId === c.id);
        const last = list.reduce((d, e) => (e.date > d ? e.date : d), "");
        return { ...c, count: list.length, total: sumEntries(list), last };
      })
      .filter((c) => (c.name + " " + (c.phone ?? "") + " " + (c.address ?? "")).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (b.last || b.createdAt).localeCompare(a.last || a.createdAt));
  }, [clients, entries, q]);

  const grand = sumEntries(entries);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Klientët"
        subtitle="Zgjidh një klient për të parë materialet"
        actions={
          <Button onClick={openNew}>
            <Plus size={17} /> Shto klient
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat accent className="col-span-2 sm:col-span-1" label="Totali i të gjithë klientëve" value={euro(grand)} icon={<Wallet size={15} />} />
        <Stat label="Klientë" value={clients.length} icon={<Users size={15} />} />
        <Stat label="Materiale të shtuara" value={entries.length} icon={<Package size={15} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Kërko klient, telefon ose qytet…" />
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Users size={24} />}
            title={q ? "Asnjë klient nuk u gjet" : "Ende nuk ke klientë"}
            text={q ? "Provo një emër tjetër." : "Shto klientin e parë për të filluar."}
            action={!q && <Button onClick={openNew}><Plus size={17} /> Shto klient</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Klienti</th>
                  <th className="px-5 py-3">Telefoni</th>
                  <th className="px-5 py-3 text-right">Materiale</th>
                  <th className="px-5 py-3">E fundit</th>
                  <th className="px-5 py-3 text-right">Totali</th>
                  <th className="w-24 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/clients/${c.id}`)}
                    className="group cursor-pointer border-b border-line last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <div className="font-semibold">{c.name}</div>
                          {c.address && <div className="text-xs text-muted">{c.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{c.phone || "—"}</td>
                    <td className="tabular px-5 py-3.5 text-right">{c.count}</td>
                    <td className="tabular px-5 py-3.5 text-muted">{c.last ? dateSq(c.last) : "—"}</td>
                    <td className="tabular px-5 py-3.5 text-right font-semibold">{euro(c.total)}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <RowMenu onEdit={() => { setEditing(c); setFormOpen(true); }} onDelete={() => setDeleting(c)} />
                        <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="divide-y divide-line sm:hidden">
              {rows.map((c) => (
                <li key={c.id}>
                  <Link href={`/clients/${c.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50">
                    <Avatar name={c.name} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{c.name}</div>
                      <div className="truncate text-[13px] text-muted">
                        {c.count} materiale{c.last && ` · ${dateSq(c.last)}`}
                      </div>
                    </div>
                    <div className="tabular text-right font-semibold">{euro(c.total)}</div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Fab onClick={openNew}>
        <Plus size={20} /> Klient
      </Fab>

      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={(v) => {
          if (editing) {
            updateClient(editing.id, v);
            toast("Klienti u përditësua");
          } else {
            const c = addClient(v);
            toast("Klienti u shtua");
            router.push(`/clients/${c.id}`);
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteClient(deleting.id);
          toast("Klienti u fshi");
        }}
        title="Fshij klientin?"
        text={`"${deleting?.name}" dhe të gjitha materialet e tij do të fshihen. Ky veprim nuk kthehet mbrapsht.`}
      />
    </>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Menu
      trigger={() => (
        <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label="Veprime">
          <Ellipsis size={18} />
        </button>
      )}
      items={[
        { label: "Ndrysho", icon: <Pencil size={15} />, onClick: onEdit },
        { label: "Fshij", icon: <Trash2 size={15} />, onClick: onDelete, danger: true },
      ]}
    />
  );
}
