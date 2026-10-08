"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Boxes, Building2, ChevronRight, Ellipsis, Package, Pencil, Plus, Trash2, TriangleAlert, Wallet } from "lucide-react";
import { Fab, PageHeader } from "@/components/page-header";
import { StepChart, TrendBadge } from "@/components/price-history";
import { Button, Card, Confirm, Empty, Field, Input, Menu, Modal, SearchBox, Stat, cn, inputCls } from "@/components/ui";
import { useToast } from "@/components/toast";
import { dateSq, den, todayIso } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { stockOf, useStore } from "@/lib/store";
import type { StockIn } from "@/lib/types";

type Level = "ok" | "low" | "out";
const levelOf = (left: number, bought: number): Level => (left <= 0 ? "out" : left < bought * 0.2 ? "low" : "ok");
const qtyFmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });

export default function StockPage() {
  const { materials, companies, entries, stock, addStock, updateStock, deleteStock } = useStore();
  const { t, unit } = useT();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [company, setCompany] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StockIn | null>(null);
  const [formMaterial, setFormMaterial] = useState<string | undefined>();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<StockIn | null>(null);

  const companyName = (id?: string) => companies.find((c) => c.id === id)?.name;

  const rows = useMemo(
    () =>
      materials
        .map((m) => ({ ...m, s: stockOf(m.id, stock, entries) }))
        .filter((m) => m.s.tracked)
        .map((m) => ({ ...m, level: levelOf(m.s.left, m.s.bought) }))
        .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) && (company === "all" || m.companyId === company))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [materials, stock, entries, q, company]
  );

  const all = materials.map((m) => ({ m, s: stockOf(m.id, stock, entries) })).filter((x) => x.s.tracked);
  const totalValue = all.reduce((t, x) => t + x.s.value, 0);
  const inStock = all.filter((x) => x.s.left > 0).length;
  const lowOrOut = all.filter((x) => levelOf(x.s.left, x.s.bought) !== "ok").length;

  const openNew = (materialId?: string) => {
    setEditing(null);
    setFormMaterial(materialId);
    setFormOpen(true);
  };
  const openEdit = (x: StockIn) => {
    setEditing(x);
    setFormMaterial(x.materialId);
    setFormOpen(true);
  };

  const detail = rows.find((r) => r.id === detailId) ?? null;

  return (
    <>
      <PageHeader
        title={t.stock.title}
        subtitle={t.stock.subtitle}
        actions={
          <Button onClick={() => openNew()}>
            <Plus size={17} /> {t.stock.add}
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat accent className="col-span-2 sm:col-span-1" label={t.stock.statValue} value={den(Math.round(totalValue))} icon={<Wallet size={15} />} />
        <Stat label={t.stock.statItems} value={inStock} icon={<Boxes size={15} />} />
        <Stat label={t.stock.statLow} value={lowOrOut} icon={<TriangleAlert size={15} />} />
      </div>

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
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Boxes size={24} />}
            title={q || company !== "all" ? t.materials.notFound : t.stock.empty}
            text={q || company !== "all" ? t.common.tryAnotherName : t.stock.emptyText}
            action={!q && company === "all" && <Button onClick={() => openNew()}><Plus size={17} /> {t.stock.add}</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t.cols.material}</th>
                  <th className="px-5 py-3">{t.stock.colInStock}</th>
                  <th className="px-4 py-3 text-right">{t.stock.colBought}</th>
                  <th className="px-4 py-3 text-right">{t.stock.colUsed}</th>
                  <th className="px-4 py-3 text-right">{t.stock.colAvg}</th>
                  <th className="px-4 py-3">{t.stock.colLast}</th>
                  <th className="px-4 py-3 text-right">{t.stock.colValue}</th>
                  <th className="w-20 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const last = m.s.buys[m.s.buys.length - 1];
                  const prev = m.s.buys[m.s.buys.length - 2];
                  return (
                    <tr key={m.id} onClick={() => setDetailId(m.id)} className="group cursor-pointer border-b border-line last:border-0 hover:bg-slate-50/80">
                      <td className="px-5 py-3">
                        <div className="font-semibold">{m.name}</div>
                        <div className="text-xs text-muted">{companyName(m.companyId) ?? t.companies.none}</div>
                      </td>
                      <td className="px-5 py-3">
                        <LevelCell left={m.s.left} bought={m.s.bought} unit={unit(m.unit)} level={m.level} />
                      </td>
                      <td className="tabular px-4 py-3 text-right text-muted">{qtyFmt(m.s.bought)}</td>
                      <td className="tabular px-4 py-3 text-right text-muted">{qtyFmt(m.s.used)}</td>
                      <td className="tabular px-4 py-3 text-right">{den(Math.round(m.s.avgCost * 100) / 100)}</td>
                      <td className="px-4 py-3">
                        <div className="tabular font-medium">{den(last.price)}</div>
                        {prev && <TrendBadge from={prev.price} to={last.price} className="mt-0.5" />}
                      </td>
                      <td className="tabular px-4 py-3 text-right font-semibold">{den(Math.round(m.s.value))}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <RowMenu onAdd={() => openNew(m.id)} onOpen={() => setDetailId(m.id)} />
                          <ChevronRight size={18} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile / tablet list */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((m) => (
                <li key={m.id} className="flex items-center gap-2 py-3 pl-4 pr-2">
                  <button onClick={() => setDetailId(m.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <Package size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{m.name}</span>
                      <span className="block truncate text-[13px] text-muted">{companyName(m.companyId) ?? t.companies.none}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="tabular font-semibold">
                        {qtyFmt(m.s.left)} <span className="text-xs font-normal text-muted">{unit(m.unit)}</span>
                      </span>
                      {m.level !== "ok" ? <LevelBadge level={m.level} /> : <span className="tabular text-xs text-muted">{den(Math.round(m.s.value))}</span>}
                    </span>
                  </button>
                  <RowMenu onAdd={() => openNew(m.id)} onOpen={() => setDetailId(m.id)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="mt-4 px-1 text-xs text-muted">{t.stock.catalogNote}</p>

      <Fab onClick={() => openNew()}>
        <Plus size={20} /> {t.stock.fab}
      </Fab>

      {detail && (
        <StockDetail
          materialId={detail.id}
          onClose={() => setDetailId(null)}
          onAdd={() => openNew(detail.id)}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      )}

      <StockForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        materialId={formMaterial}
        onSave={(v) => {
          if (editing) {
            updateStock(editing.id, v);
            toast(t.stock.updated);
          } else {
            addStock(v);
            toast(t.stock.added);
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteStock(deleting.id);
          toast(t.stock.deleted);
        }}
        title={t.stock.deleteTitle}
        text={t.stock.deleteText(
          deleting ? `${qtyFmt(deleting.qty)} ${unit(materials.find((m) => m.id === deleting.materialId)?.unit ?? "")}` : ""
        )}
      />
    </>
  );
}

/* ---------- pieces ---------- */

function LevelBadge({ level }: { level: Level }) {
  const { t } = useT();
  if (level === "ok") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        level === "out" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"
      )}
    >
      <TriangleAlert size={11} /> {level === "out" ? t.stock.out : t.stock.low}
    </span>
  );
}

function LevelCell({ left, bought, unit, level }: { left: number; bought: number; unit: string; level: Level }) {
  const pct = bought ? Math.max(0, Math.min(1, left / bought)) : 0;
  return (
    <div className="min-w-36">
      <div className="flex items-center gap-2">
        <span className="tabular font-semibold">
          {qtyFmt(left)} <span className="text-xs font-normal text-muted">{unit}</span>
        </span>
        <LevelBadge level={level} />
      </div>
      <div className="mt-1.5 h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", level === "out" ? "bg-rose-500" : level === "low" ? "bg-amber-500" : "bg-brand-600")}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

function RowMenu({ onAdd, onOpen }: { onAdd: () => void; onOpen: () => void }) {
  const { t } = useT();
  return (
    <Menu
      trigger={() => (
        <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
          <Ellipsis size={18} />
        </button>
      )}
      items={[
        { label: t.stock.addPurchase, icon: <Plus size={15} />, onClick: onAdd },
        { label: t.stock.purchases, icon: <Boxes size={15} />, onClick: onOpen },
      ]}
    />
  );
}

/* ---------- Detail: purchases, price chart, usage ---------- */

function StockDetail({
  materialId,
  onClose,
  onAdd,
  onEdit,
  onDelete,
}: {
  materialId: string;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (x: StockIn) => void;
  onDelete: (x: StockIn) => void;
}) {
  const { materials, companies, clients, entries, stock } = useStore();
  const { t, unit } = useT();
  const m = materials.find((x) => x.id === materialId);
  if (!m) return null;
  const s = stockOf(m.id, stock, entries);
  const u = unit(m.unit);
  const level = levelOf(s.left, s.bought);
  const used = entries.filter((e) => e.fromStock && e.materialId === m.id).sort((a, b) => b.date.localeCompare(a.date));
  const buysNewest = [...s.buys].reverse();

  return (
    <Modal
      open
      onClose={onClose}
      title={m.name}
      description={companies.find((c) => c.id === m.companyId)?.name ?? t.companies.none}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            {t.common.close}
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={onAdd}>
            <Plus size={16} /> {t.stock.addPurchase}
          </Button>
        </>
      }
    >
      <div className="space-y-5 pb-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Mini label={t.stock.colInStock} value={`${qtyFmt(s.left)} ${u}`} strong badge={<LevelBadge level={level} />} />
          <Mini label={t.stock.colBought} value={`${qtyFmt(s.bought)} ${u}`} />
          <Mini label={t.stock.colAvg} value={den(Math.round(s.avgCost * 100) / 100)} />
          <Mini label={t.stock.colValue} value={den(Math.round(s.value))} />
        </div>

        {s.buys.length > 1 && (
          <div>
            <div className="mb-2 text-sm font-semibold">{t.stock.priceOverTime}</div>
            <StepChart points={s.buys.map((b) => ({ at: `${b.date}T12:00:00`, price: b.price }))} />
          </div>
        )}

        <section>
          <div className="mb-2 text-sm font-semibold">{t.stock.purchases}</div>
          <ol className="divide-y divide-line rounded-xl border border-line">
            {buysNewest.map((b) => {
              const i = s.buys.indexOf(b);
              const prev = i > 0 ? s.buys[i - 1] : null;
              return (
                <li key={b.id} className="flex items-center gap-3 py-2.5 pl-3 pr-1.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="tabular font-semibold">
                      {qtyFmt(b.qty)} {u} × {den(b.price)}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {dateSq(b.date)} · {companies.find((c) => c.id === b.companyId)?.name ?? t.companies.none}
                      {b.note && ` · ${b.note}`}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="tabular font-semibold">{den(Math.round(b.qty * b.price * 100) / 100)}</span>
                    {prev ? <TrendBadge from={prev.price} to={b.price} /> : <span className="text-[11px] text-muted">{t.materials.initialPrice}</span>}
                  </div>
                  <Menu
                    trigger={() => (
                      <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
                        <Ellipsis size={16} />
                      </button>
                    )}
                    items={[
                      { label: t.common.edit, icon: <Pencil size={15} />, onClick: () => onEdit(b) },
                      { label: t.common.delete, icon: <Trash2 size={15} />, onClick: () => onDelete(b), danger: true },
                    ]}
                  />
                </li>
              );
            })}
          </ol>
        </section>

        <section>
          <div className="mb-2 text-sm font-semibold">{t.stock.usage}</div>
          {used.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-muted">{t.stock.noUsage}</p>
          ) : (
            <ol className="divide-y divide-line rounded-xl border border-line">
              {used.map((e) => (
                <li key={e.id}>
                  <Link href={`/clients/${e.clientId}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{clients.find((c) => c.id === e.clientId)?.name ?? "—"}</span>
                      <span className="tabular block text-xs text-muted">{dateSq(e.date)}</span>
                    </span>
                    <span className="tabular shrink-0 font-semibold">
                      −{qtyFmt(e.qty)} <span className="text-xs font-normal text-muted">{u}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </Modal>
  );
}

function Mini({ label, value, strong, badge }: { label: string; value: string; strong?: boolean; badge?: React.ReactNode }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2.5", strong ? "border-brand-200 bg-brand-50" : "border-line")}>
      <div className="flex items-center justify-between gap-1 text-[11px] font-medium text-muted">
        {label}
        {badge}
      </div>
      <div className={cn("tabular mt-0.5 font-bold", strong && "text-brand-700")}>{value}</div>
    </div>
  );
}

/* ---------- Add / edit a purchase ---------- */

function StockForm({
  open,
  onClose,
  initial,
  materialId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: StockIn | null;
  materialId?: string;
  onSave: (v: Omit<StockIn, "id">) => void;
}) {
  const { materials, companies, stock, entries } = useStore();
  const { t, unit } = useT();
  const [mat, setMat] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  const sorted = useMemo(() => [...materials].sort((a, b) => a.name.localeCompare(b.name)), [materials]);

  // Last purchase price of a material, else its catalog price — a sensible starting point
  const suggestPrice = (id: string) => {
    const s = stockOf(id, stock, entries);
    const last = s.buys[s.buys.length - 1];
    return last?.price ?? materials.find((m) => m.id === id)?.price;
  };

  useEffect(() => {
    if (!open) return;
    const id = initial?.materialId ?? materialId ?? "";
    setMat(id);
    setCompanyId(initial ? initial.companyId ?? "" : materials.find((m) => m.id === id)?.companyId ?? "");
    setQty(initial ? String(initial.qty) : "");
    const p = initial?.price ?? (id ? suggestPrice(id) : undefined);
    setPrice(p !== undefined ? String(p) : "");
    setDate(initial?.date ?? todayIso());
    setNote(initial?.note ?? "");
    setErr({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, materialId]);

  const pickMaterial = (id: string) => {
    setMat(id);
    setCompanyId(materials.find((m) => m.id === id)?.companyId ?? "");
    const p = suggestPrice(id);
    if (p !== undefined) setPrice(String(p));
  };

  const m = materials.find((x) => x.id === mat);
  const qtyN = parseFloat(qty.replace(",", "."));
  const priceN = parseFloat(price.replace(",", "."));
  const total = (isFinite(qtyN) ? qtyN : 0) * (isFinite(priceN) ? priceN : 0);
  const current = m ? stockOf(m.id, stock, entries) : null;

  const save = () => {
    const e: Record<string, string> = {};
    if (!mat) e.material = t.entryForm.pickMaterial;
    if (!(qtyN > 0)) e.qty = t.entryForm.enterQty;
    if (!(priceN >= 0) || price === "") e.price = t.entryForm.enterPrice;
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ materialId: mat, companyId: companyId || undefined, qty: qtyN, price: priceN, date: date || todayIso(), note: note.trim() || undefined });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t.stock.editTitle : t.stock.addTitle}
      description={t.stock.description}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>{t.common.cancel}</Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={save}>{initial ? t.common.saveChanges : t.stock.save}</Button>
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
        <Field
          label={t.cols.material}
          error={err.material}
          hint={current?.tracked ? `${t.stock.colInStock}: ${qtyFmt(current.left)} ${unit(m!.unit)}` : undefined}
        >
          <select value={mat} onChange={(e) => pickMaterial(e.target.value)} className={inputCls} disabled={!!initial}>
            <option value="" disabled>{t.stock.selectMaterial}</option>
            {sorted.map((x) => (
              <option key={x.id} value={x.id}>{x.name}</option>
            ))}
          </select>
        </Field>
        <Field label={t.companies.label}>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputCls}>
            <option value="">{t.companies.none}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t.cols.qty}${m ? ` (${unit(m.unit)})` : ""} *`} error={err.qty}>
            <Input inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" className="h-12 text-lg font-semibold" />
          </Field>
          <Field label={t.stock.buyPrice} error={err.price}>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" className="h-12 text-lg" />
          </Field>
        </div>
        <Field label={t.cols.date}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label={t.clientForm.note}>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.common.optional} />
        </Field>
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 px-4 py-3.5">
          <div className="text-[13px] font-semibold text-brand-900">{t.stock.totalCost}</div>
          <div className="tabular text-2xl font-bold tracking-tight text-brand-700">{den(Math.round(total * 100) / 100)}</div>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}
