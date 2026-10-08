"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Ellipsis, History, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Fab, PageHeader } from "@/components/page-header";
import { PriceHistoryModal, TrendBadge, lastChange } from "@/components/price-history";
import { Button, Card, Confirm, Empty, Field, Input, Menu, Modal, SearchBox, cn, inputCls } from "@/components/ui";
import { useToast } from "@/components/toast";
import { UNITS, euro } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Material } from "@/lib/types";

// useSearchParams needs a Suspense boundary for the static build
export default function MaterialsRoute() {
  return (
    <Suspense>
      <MaterialsPage />
    </Suspense>
  );
}

function MaterialsPage() {
  const { materials, companies, entries, addMaterial, updateMaterial, deleteMaterial } = useStore();
  const { t, unit } = useT();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const company = useSearchParams().get("company") ?? "all";
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name;
  const history = materials.find((m) => m.id === historyId) ?? null;

  const setCompany = (id: string) => router.replace(id === "all" ? pathname : `${pathname}?company=${id}`);

  const rows = useMemo(
    () =>
      materials
        .map((m) => ({ ...m, used: entries.filter((e) => e.materialId === m.id).length, change: lastChange(m) }))
        .filter(
          (m) =>
            m.name.toLowerCase().includes(q.toLowerCase()) &&
            (company === "all" || (company === "none" ? !m.companyId : m.companyId === company))
        )
        .sort((a, b) => b.used - a.used || a.name.localeCompare(b.name)),
    [materials, entries, q, company]
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (m: Material) => {
    setHistoryId(null);
    setEditing(m);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title={t.materials.title}
        subtitle={t.materials.subtitle}
        actions={
          <Button onClick={openNew}>
            <Plus size={17} /> {t.materials.add}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder={t.common.searchMaterial} className="min-w-48 flex-1" />
          <div className="relative w-full sm:w-auto">
            <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-label={t.companies.label}
              className={cn(inputCls, "h-10 cursor-pointer appearance-none pl-9 pr-8 text-sm font-semibold shadow-none sm:w-auto")}
            >
              <option value="all">{t.companies.all}</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="none">{t.companies.none}</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>
          </div>
          <span className="hidden pr-2 text-sm text-muted lg:block">{t.common.materialsCount(rows.length)}</span>
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Package size={24} />}
            title={q || company !== "all" ? t.materials.notFound : t.materials.empty}
            text={q || company !== "all" ? t.common.tryAnotherName : t.materials.emptyText}
            action={!q && company === "all" && <Button onClick={openNew}><Plus size={17} /> {t.materials.add}</Button>}
          />
        ) : (
          <>
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t.cols.material}</th>
                  <th className="px-5 py-3">{t.cols.unit}</th>
                  <th className="px-5 py-3 text-right">{t.cols.price}</th>
                  <th className="px-5 py-3">{t.materials.colChange}</th>
                  <th className="px-5 py-3 text-right">{t.materials.colUsed}</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0 hover:bg-slate-50/80">
                    <td className="px-5 py-3">
                      <button onClick={() => setHistoryId(m.id)} className="flex items-center gap-3 text-left">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                          <Package size={17} />
                        </span>
                        <span>
                          <span className="block font-semibold">{m.name}</span>
                          <span className="block text-xs text-muted">{companyName(m.companyId) ?? t.companies.none}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{unit(m.unit)}</span>
                    </td>
                    <td className="tabular px-5 py-3 text-right font-semibold">{euro(m.price)}</td>
                    <td className="px-5 py-3">
                      {m.change ? (
                        <button onClick={() => setHistoryId(m.id)} title={t.materials.priceHistory}>
                          <TrendBadge from={m.change.from} to={m.change.to} />
                        </button>
                      ) : (
                        <span className="text-xs text-muted">{t.materials.noChanges}</span>
                      )}
                    </td>
                    <td className="tabular px-5 py-3 text-right text-muted">{m.used}×</td>
                    <td className="px-3 py-3 text-right">
                      <RowMenu onHistory={() => setHistoryId(m.id)} onEdit={() => openEdit(m)} onDelete={() => setDeleting(m)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line sm:hidden">
              {rows.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
                  <button onClick={() => setHistoryId(m.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <Package size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{m.name}</span>
                      <span className="block truncate text-[13px] text-muted">
                        {companyName(m.companyId) ?? t.companies.none} · {t.materials.perUnit(unit(m.unit), m.used)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="tabular font-semibold">{euro(m.price)}</span>
                      {m.change && <TrendBadge from={m.change.from} to={m.change.to} className="px-1.5 text-[11px]" />}
                    </span>
                  </button>
                  <RowMenu onHistory={() => setHistoryId(m.id)} onEdit={() => openEdit(m)} onDelete={() => setDeleting(m)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="mt-4 px-1 text-xs text-muted">{t.materials.priceNote}</p>

      <Fab onClick={openNew}>
        <Plus size={20} /> {t.materials.fab}
      </Fab>

      <PriceHistoryModal
        material={history}
        companyName={companyName(history?.companyId)}
        onClose={() => setHistoryId(null)}
        onEdit={openEdit}
      />
      <MaterialForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        defaultCompanyId={company !== "all" && company !== "none" ? company : undefined}
        onSave={(v) => {
          if (editing) {
            updateMaterial(editing.id, v);
            toast(t.materials.updated);
          } else {
            addMaterial(v);
            toast(t.materials.added);
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMaterial(deleting.id);
          toast(t.materials.deleted);
        }}
        title={t.materials.deleteTitle}
        text={t.materials.deleteText(deleting?.name ?? "")}
      />
    </>
  );
}

function MaterialForm({
  open,
  onClose,
  initial,
  defaultCompanyId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Material | null;
  defaultCompanyId?: string;
  onSave: (v: Omit<Material, "id" | "priceHistory">) => void;
}) {
  const { companies } = useStore();
  const { t, unit: unitLabel } = useT();
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("copë");
  const [price, setPrice] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setUnit(initial?.unit ?? "copë");
    setPrice(initial ? initial.price.toFixed(2) : "");
    setCompanyId(initial ? initial.companyId ?? "" : defaultCompanyId ?? "");
    setErr({});
  }, [open, initial, defaultCompanyId]);

  const save = () => {
    const p = parseFloat(price.replace(",", "."));
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = t.materials.nameRequired;
    if (!(p >= 0) || price === "") e.price = t.entryForm.enterPrice;
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ name: name.trim(), unit, price: p, companyId: companyId || undefined });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t.materials.editTitle : t.materials.add}
      description={t.materials.formDescription}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>{t.common.cancel}</Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={save}>{initial ? t.common.saveChanges : t.materials.save}</Button>
        </>
      }
    >
      <form
        className="space-y-4 pb-3"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label={t.materials.name} error={err.name}>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder={t.materials.namePh} />
        </Field>
        <Field label={t.companies.label}>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputCls}>
            <option value="">{t.companies.none}</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.cols.unit}>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              {UNITS.map((u) => <option key={u} value={u}>{unitLabel(u)}</option>)}
            </select>
          </Field>
          <Field label={t.materials.price} error={err.price} hint={initial ? t.materials.priceChangeHint : undefined}>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </Field>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

function RowMenu({ onHistory, onEdit, onDelete }: { onHistory: () => void; onEdit: () => void; onDelete: () => void }) {
  const { t } = useT();
  return (
    <Menu
      trigger={() => (
        <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
          <Ellipsis size={18} />
        </button>
      )}
      items={[
        { label: t.materials.priceHistory, icon: <History size={15} />, onClick: onHistory },
        { label: t.common.edit, icon: <Pencil size={15} />, onClick: onEdit },
        { label: t.common.delete, icon: <Trash2 size={15} />, onClick: onDelete, danger: true },
      ]}
    />
  );
}
