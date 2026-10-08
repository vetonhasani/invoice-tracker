"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Ellipsis, MapPin, Package, Pencil, Phone, Plus, Printer, Trash2, TrendingUp, Wallet } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { EntryForm } from "@/components/entry-form";
import { Fab, PageHeader } from "@/components/page-header";
import { Avatar, Button, Card, Confirm, Empty, Menu, SearchBox, Stat, cn, inputCls } from "@/components/ui";
import { useToast } from "@/components/toast";
import { dateSq, euro, todayIso } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { entryTotal, sumEntries, useStore } from "@/lib/store";
import type { Entry } from "@/lib/types";

export default function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { clients, entries, updateClient, deleteClient, deleteEntry } = useStore();
  const { t, unit, monthLabel } = useT();
  const toast = useToast();
  const router = useRouter();

  const client = clients.find((c) => c.id === id);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("all");
  const [entryOpen, setEntryOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<Entry | null>(null);
  const [editClient, setEditClient] = useState(false);
  const [deleteClientOpen, setDeleteClientOpen] = useState(false);

  const mine = useMemo(() => entries.filter((e) => e.clientId === id).sort((a, b) => b.date.localeCompare(a.date)), [entries, id]);
  const months = useMemo(() => [...new Set(mine.map((e) => e.date.slice(0, 7)))].sort().reverse(), [mine]);
  const rows = mine.filter((e) => (month === "all" || e.date.startsWith(month)) && e.name.toLowerCase().includes(q.toLowerCase()));
  const thisMonth = sumEntries(mine.filter((e) => e.date.startsWith(todayIso().slice(0, 7))));

  if (!client)
    return (
      <Card>
        <Empty
          icon={<Package size={24} />}
          title={t.client.notFound}
          text={t.client.notFoundText}
          action={<Link href="/clients"><Button variant="secondary">{t.client.back}</Button></Link>}
        />
      </Card>
    );

  const openNew = () => {
    setEditingEntry(null);
    setEntryOpen(true);
  };

  return (
    <>
      <Link href="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} /> {t.nav.clients}
      </Link>

      <PageHeader
        leading={<Avatar name={client.name} size={52} />}
        title={client.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            {client.phone && <span className="flex items-center gap-1.5"><Phone size={14} />{client.phone}</span>}
            {client.address && <span className="flex items-center gap-1.5"><MapPin size={14} />{client.address}</span>}
            {!client.phone && !client.address && <span>{t.client.noContact}</span>}
          </span>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={16} /> {t.client.print}
            </Button>
            <Menu
              trigger={() => (
                <Button variant="secondary" className="w-10 px-0" aria-label={t.common.more}>
                  <Ellipsis size={18} />
                </Button>
              )}
              items={[
                { label: t.client.edit, icon: <Pencil size={15} />, onClick: () => setEditClient(true) },
                { label: t.client.delete, icon: <Trash2 size={15} />, onClick: () => setDeleteClientOpen(true), danger: true },
              ]}
            />
            <Button onClick={openNew}>
              <Plus size={17} /> {t.client.addMaterial}
            </Button>
          </>
        }
      />

      {/* mobile quick actions */}
      <div className="-mt-2 mb-5 flex gap-2 sm:hidden">
        <Button variant="secondary" size="sm" onClick={() => setEditClient(true)}><Pencil size={14} /> {t.common.edit}</Button>
        <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer size={14} /> {t.client.print}</Button>
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteClientOpen(true)}><Trash2 size={14} /> {t.common.delete}</Button>
      </div>

      {client.note && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{client.note}</div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat accent className="col-span-2 sm:col-span-1" label={t.client.statTotal} value={euro(sumEntries(mine))} icon={<Wallet size={15} />} />
        <Stat label={t.client.statItems} value={mine.length} icon={<Package size={15} />} />
        <Stat label={t.client.statMonth} value={euro(thisMonth)} icon={<TrendingUp size={15} />} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex gap-2 border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder={t.common.searchMaterial} className="flex-1" />
          <div className="relative">
            <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={cn(inputCls, "h-10 w-auto cursor-pointer appearance-none pl-9 pr-8 text-sm font-semibold shadow-none")}
            >
              <option value="all">{t.common.all}</option>
              {months.map((m) => (
                <option key={m} value={m}>{monthLabel(m)}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Package size={24} />}
            title={mine.length ? t.client.noResults : t.client.empty}
            text={mine.length ? t.client.noResultsText : t.client.emptyText}
            action={!mine.length && <Button onClick={openNew}><Plus size={17} /> {t.client.addMaterial}</Button>}
          />
        ) : (
          <>
            {/* Desktop table — same columns as the Excel */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t.cols.material}</th>
                  <th className="px-5 py-3">{t.cols.date}</th>
                  <th className="px-5 py-3 text-right">{t.cols.qty}</th>
                  <th className="px-5 py-3 text-right">{t.cols.price}</th>
                  <th className="px-5 py-3 text-right">{t.cols.amount}</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-line hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 font-medium">{e.name}</td>
                    <td className="tabular px-5 py-3.5 text-muted">{dateSq(e.date)}</td>
                    <td className="tabular px-5 py-3.5 text-right">
                      {e.qty} <span className="text-xs text-muted">{unit(e.unit)}</span>
                    </td>
                    <td className="tabular px-5 py-3.5 text-right text-muted">{euro(e.price)}</td>
                    <td className="tabular px-5 py-3.5 text-right font-semibold">{euro(entryTotal(e))}</td>
                    <td className="px-3 py-3.5 text-right">
                      <EntryMenu onEdit={() => { setEditingEntry(e); setEntryOpen(true); }} onDelete={() => setDeletingEntry(e)} />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/70">
                  <td className="px-5 py-4 font-bold" colSpan={4}>
                    {t.common.total} {month !== "all" && <span className="font-medium text-muted">· {monthLabel(month)}</span>}
                  </td>
                  <td className="tabular px-5 py-4 text-right text-base font-bold">{euro(sumEntries(rows))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-line sm:hidden">
              {rows.map((e) => (
                <li key={e.id} className="flex items-center gap-2 py-3.5 pl-4 pr-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <span className="truncate font-semibold">{e.name}</span>
                      <span className="tabular font-semibold">{euro(entryTotal(e))}</span>
                    </div>
                    <div className="tabular mt-0.5 flex justify-between gap-3 text-[13px] text-muted">
                      <span>{dateSq(e.date)}</span>
                      <span>{e.qty} {unit(e.unit)} × {euro(e.price)}</span>
                    </div>
                  </div>
                  <EntryMenu onEdit={() => { setEditingEntry(e); setEntryOpen(true); }} onDelete={() => setDeletingEntry(e)} />
                </li>
              ))}
              <li className="flex justify-between bg-slate-50/70 px-4 py-4 font-bold">
                <span>{t.common.total}</span>
                <span className="tabular">{euro(sumEntries(rows))}</span>
              </li>
            </ul>
          </>
        )}
      </Card>

      <Fab onClick={openNew}>
        <Plus size={20} /> {t.client.fab}
      </Fab>

      <EntryForm open={entryOpen} onClose={() => setEntryOpen(false)} client={client} initial={editingEntry} onSaved={toast} />
      <ClientForm
        open={editClient}
        onClose={() => setEditClient(false)}
        initial={client}
        onSave={(v) => {
          updateClient(client.id, v);
          toast(t.clients.updated);
        }}
      />
      <Confirm
        open={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        onConfirm={() => {
          if (deletingEntry) deleteEntry(deletingEntry.id);
          toast(t.client.entryDeleted);
        }}
        title={t.client.deleteEntryTitle}
        text={t.client.deleteEntryText(deletingEntry?.name ?? "", deletingEntry ? `${deletingEntry.qty} ${unit(deletingEntry.unit)}` : "")}
      />
      <Confirm
        open={deleteClientOpen}
        onClose={() => setDeleteClientOpen(false)}
        onConfirm={() => {
          deleteClient(client.id);
          toast(t.clients.deleted);
          router.replace("/clients");
        }}
        title={t.clients.deleteTitle}
        text={t.client.deleteText(client.name, mine.length)}
      />
    </>
  );
}

function EntryMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const { t } = useT();
  return (
    <Menu
      trigger={() => (
        <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
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
