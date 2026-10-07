"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Package, Plus, RotateCcw, Sparkles } from "lucide-react";
import { Avatar, Button, Field, Input, Modal, cn, inputCls } from "./ui";
import { UNITS, euro, todayIso } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Client, Entry, Material } from "@/lib/types";

/**
 * "Shto material" for a client:
 * pick from the catalog → Vlera autofills → type only Sasia.
 */
export function EntryForm({
  open,
  onClose,
  client,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  client: Client;
  initial?: Entry | null;
  onSaved: (msg: string) => void;
}) {
  const { materials, addMaterial, addEntry, updateEntry } = useStore();

  const [material, setMaterial] = useState<Material | null>(null);
  const [newMat, setNewMat] = useState<{ name: string; unit: string } | null>(null);
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(todayIso());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qtyRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setNewMat(null);
    if (initial) {
      const m = materials.find((x) => x.id === initial.materialId) ?? {
        id: initial.materialId,
        name: initial.name,
        unit: initial.unit,
        price: initial.price,
      };
      setMaterial(m);
      setQty(String(initial.qty));
      setPrice(initial.price.toFixed(2));
      setDate(initial.date);
    } else {
      setMaterial(null);
      setQty("");
      setPrice("");
      setDate(todayIso());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const pick = (m: Material) => {
    setMaterial(m);
    setNewMat(null);
    setPrice(m.price.toFixed(2));
    setErrors({});
    setTimeout(() => qtyRef.current?.focus(), 30);
  };

  const qtyN = parseFloat(qty.replace(",", "."));
  const priceN = parseFloat(price.replace(",", "."));
  const total = (isFinite(qtyN) ? qtyN : 0) * (isFinite(priceN) ? priceN : 0);
  const catalogPrice = material && !newMat ? materials.find((m) => m.id === material.id)?.price : undefined;
  const isAuto = catalogPrice !== undefined && priceN === catalogPrice;
  const unit = newMat?.unit ?? material?.unit;

  const save = () => {
    const err: Record<string, string> = {};
    if (!material && !newMat?.name.trim()) err.material = "Zgjidh një material.";
    if (!(qtyN > 0)) err.qty = "Shkruaj sasinë.";
    if (!(priceN >= 0) || price === "") err.price = "Shkruaj vlerën.";
    setErrors(err);
    if (Object.keys(err).length) return;

    let m = material!;
    if (newMat) m = addMaterial({ name: newMat.name.trim(), unit: newMat.unit, price: priceN });

    const data = { clientId: client.id, materialId: m.id, name: m.name, unit: m.unit, price: priceN, qty: qtyN, date };
    if (initial) {
      updateEntry(initial.id, data);
      onSaved("Materiali u përditësua");
    } else {
      addEntry(data);
      onSaved(newMat ? "Materiali u shtua (edhe në katalog)" : "Materiali u shtua");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Ndrysho materialin" : "Shto material"}
      description="Zgjidh materialin, shkruaj vetëm sasinë"
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            Anulo
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={save}>
            {initial ? "Ruaj ndryshimet" : "Ruaj"}
          </Button>
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
        <Field label="Klienti">
          <div className={cn(inputCls, "flex items-center gap-2.5 bg-slate-50 text-muted shadow-none")}>
            <Avatar name={client.name} size={24} />
            <span className="font-medium text-ink">{client.name}</span>
          </div>
        </Field>

        <Field label="Materiali" error={errors.material}>
          <MaterialPicker
            materials={materials}
            value={newMat ? null : material}
            newName={newMat?.name}
            onPick={pick}
            onCreate={(name) => {
              setMaterial(null);
              setNewMat({ name, unit: "copë" });
              setPrice("");
            }}
          />
        </Field>

        {newMat && (
          <div className="animate-pop-in rounded-xl border border-dashed border-brand-200 bg-brand-50/50 p-3.5">
            <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-brand-700">
              <Sparkles size={15} /> Material i ri: do të ruhet edhe në katalog
            </div>
            <Field label="Njësia">
              <select value={newMat.unit} onChange={(e) => setNewMat({ ...newMat, unit: e.target.value })} className={inputCls}>
                {UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Sasia${unit ? ` (${unit})` : ""} *`} error={errors.qty}>
            <Input
              ref={qtyRef}
              inputMode="decimal"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              className="h-12 text-lg font-semibold"
            />
          </Field>
          <Field
            label="Vlera (€)"
            error={errors.price}
            right={
              catalogPrice !== undefined &&
              (isAuto ? (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">auto</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrice(catalogPrice.toFixed(2))}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-600"
                >
                  <RotateCcw size={11} /> {euro(catalogPrice)}
                </button>
              ))
            }
          >
            <Input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className={cn("h-12 text-lg", isAuto && "bg-slate-50 text-slate-600")}
            />
          </Field>
        </div>

        <Field label="Data">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 px-4 py-3.5">
          <div>
            <div className="text-[13px] font-semibold text-brand-900">Çmimi</div>
            <div className="tabular text-xs text-brand-700/70">
              {isFinite(qtyN) && qtyN > 0 && isFinite(priceN) ? `${qtyN} × ${euro(priceN)}` : "Sasia × Vlera"}
            </div>
          </div>
          <div className="tabular text-2xl font-bold tracking-tight text-brand-700">{euro(total)}</div>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

/* ---------- Searchable material picker ---------- */
function MaterialPicker({
  materials,
  value,
  newName,
  onPick,
  onCreate,
}: {
  materials: Material[];
  value: Material | null;
  newName?: string;
  onPick: (m: Material) => void;
  onCreate: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hi, setHi] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return materials.filter((m) => m.name.toLowerCase().includes(s));
  }, [materials, q]);
  const exact = materials.some((m) => m.name.toLowerCase() === q.trim().toLowerCase());
  const showCreate = q.trim().length > 0 && !exact;
  const count = list.length + (showCreate ? 1 : 0);

  const choose = (i: number) => {
    if (i < list.length) onPick(list[i]);
    else if (showCreate) onCreate(q.trim());
    setOpen(false);
    setQ("");
  };

  const openList = () => {
    setOpen(true);
    setHi(0);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  return (
    <div ref={ref} className="relative">
      {!open ? (
        <button
          type="button"
          onClick={openList}
          className={cn(inputCls, "flex items-center justify-between text-left", !value && !newName && "text-slate-400")}
        >
          {value ? (
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate font-semibold text-ink">{value.name}</span>
            </span>
          ) : newName ? (
            <span className="font-semibold text-ink">{newName}</span>
          ) : (
            <span>Zgjidh nga katalogu…</span>
          )}
          <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
            {value && `${euro(value.price)} / ${value.unit}`}
            {newName && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">i ri</span>}
            <ChevronDown size={16} />
          </span>
        </button>
      ) : (
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setHi(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, count - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
            if (e.key === "Enter") { e.preventDefault(); if (count) choose(hi); }
            if (e.key === "Escape") { e.stopPropagation(); setOpen(false); }
          }}
          placeholder="Shkruaj për të kërkuar…"
          className={cn(inputCls, "border-brand-500 ring-4 ring-brand-100")}
        />
      )}

      {open && (
        <div className="absolute inset-x-0 z-10 mt-1.5 max-h-64 animate-pop-in overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-pop">
          {list.length === 0 && !showCreate && <div className="px-3 py-6 text-center text-sm text-muted">Katalogu është bosh</div>}
          {list.map((m, i) => (
            <button
              type="button"
              key={m.id}
              onMouseEnter={() => setHi(i)}
              onClick={() => choose(i)}
              className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left", hi === i && "bg-brand-50")}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <Package size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{m.name}</span>
              <span className="tabular shrink-0 text-sm text-muted">
                {euro(m.price)} <span className="text-xs">/ {m.unit}</span>
              </span>
              {value?.id === m.id && <Check size={16} className="text-brand-600" />}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onMouseEnter={() => setHi(list.length)}
              onClick={() => choose(list.length)}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg border-t border-line px-2.5 py-2.5 text-left text-sm font-semibold text-brand-600",
                hi === list.length && "bg-brand-50"
              )}
            >
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100">
                <Plus size={16} />
              </span>
              Shto “{q.trim()}” në katalog
            </button>
          )}
        </div>
      )}
    </div>
  );
}
