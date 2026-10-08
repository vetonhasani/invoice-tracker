"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Ellipsis, Package, Pencil, Plus, Trash2, Users, Wallet } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { Fab, PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, Confirm, Empty, Menu, SearchBox, Stat } from "@/components/ui";
import { useToast } from "@/components/toast";
import { PeriodTabs, TotalHistory, historyYears, type Period } from "@/components/total-history";
import { dateSq, euro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { sumEntries, useStore } from "@/lib/store";
import type { Client } from "@/lib/types";

export default function ClientsPage() {
  const { clients, entries, addClient, updateClient, deleteClient } = useStore();
  const { t } = useT();
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

  const [period, setPeriod] = useState<Period>("all");
  const years = useMemo(() => historyYears(entries), [entries]);
  const inPeriod = period === "all" ? entries : entries.filter((e) => e.date.startsWith(period));
  const grand = sumEntries(inPeriod);

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title={t.clients.title}
        subtitle={t.clients.subtitle}
        actions={
          <Button onClick={openNew}>
            <Plus size={17} /> {t.clients.add}
          </Button>
        }
      />

      <PeriodTabs years={years} value={period} onChange={setPeriod} />

      <div className="mb-6 mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          accent
          className="col-span-2 sm:col-span-1"
          label={period === "all" ? t.clients.statTotal : t.history.totalFor(period)}
          value={euro(grand)}
          icon={<Wallet size={15} />}
        />
        <Stat label={t.clients.statClients} value={clients.length} icon={<Users size={15} />} />
        <Stat label={t.clients.statEntries} value={inPeriod.length} icon={<Package size={15} />} />
      </div>

      <TotalHistory entries={entries} years={years} period={period} onPeriod={setPeriod} />

      <Card className="overflow-hidden">
        <div className="border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder={t.clients.search} />
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Users size={24} />}
            title={q ? t.clients.notFound : t.clients.empty}
            text={q ? t.common.tryAnotherName : t.clients.emptyText}
            action={!q && <Button onClick={openNew}><Plus size={17} /> {t.clients.add}</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t.clients.colClient}</th>
                  <th className="px-5 py-3">{t.clients.colPhone}</th>
                  <th className="px-5 py-3 text-right">{t.clients.colMaterials}</th>
                  <th className="px-5 py-3">{t.clients.colLast}</th>
                  <th className="px-5 py-3 text-right">{t.clients.colTotal}</th>
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
                        {t.common.materialsCount(c.count)}{c.last && ` · ${dateSq(c.last)}`}
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
        <Plus size={20} /> {t.clients.fab}
      </Fab>

      <ClientForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={(v) => {
          if (editing) {
            updateClient(editing.id, v);
            toast(t.clients.updated);
          } else {
            const c = addClient(v);
            toast(t.clients.added);
            router.push(`/clients/${c.id}`);
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteClient(deleting.id);
          toast(t.clients.deleted);
        }}
        title={t.clients.deleteTitle}
        text={t.clients.deleteText(deleting?.name ?? "")}
      />
    </>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const { t } = useT();
  return (
    <Menu
      trigger={() => (
        <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
          <Ellipsis size={18} />
        </button>
      )}
      items={[
        { label: t.common.edit, icon: <Pencil size={15} />, onClick: onEdit },
        { label: t.common.delete, icon: <Trash2 size={15} />, onClick: onDelete, danger: true },
      ]}
    />
  );
}
