"use client";

import { useEffect, useMemo, useState } from "react";
import { Ellipsis, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Fab, PageHeader } from "@/components/page-header";
import { Button, Card, Confirm, Empty, Field, Input, Menu, Modal, SearchBox, inputCls } from "@/components/ui";
import { useToast } from "@/components/toast";
import { UNITS, euro } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Material } from "@/lib/types";

export default function MaterialsPage() {
  const { materials, entries, addMaterial, updateMaterial, deleteMaterial } = useStore();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const rows = useMemo(
    () =>
      materials
        .map((m) => ({ ...m, used: entries.filter((e) => e.materialId === m.id).length }))
        .filter((m) => m.name.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.used - a.used || a.name.localeCompare(b.name)),
    [materials, entries, q]
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (m: Material) => {
    setEditing(m);
    setFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Materialet"
        subtitle="Katalogu: shto materialin një herë me çmimin, pastaj vetëm zgjidhe te klienti"
        actions={
          <Button onClick={openNew}>
            <Plus size={17} /> Shto në katalog
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Kërko material…" className="flex-1" />
          <span className="hidden pr-2 text-sm text-muted sm:block">{materials.length} materiale</span>
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Package size={24} />}
            title={q ? "Asnjë material nuk u gjet" : "Katalogu është bosh"}
            text={q ? "Provo një emër tjetër." : "Shto materialet që përdor më shpesh me çmimet e tyre."}
            action={!q && <Button onClick={openNew}><Plus size={17} /> Shto në katalog</Button>}
          />
        ) : (
          <>
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">Materiali</th>
                  <th className="px-5 py-3">Njësia</th>
                  <th className="px-5 py-3 text-right">Vlera</th>
                  <th className="px-5 py-3 text-right">Përdorur</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-0 hover:bg-slate-50/80">
                    <td className="px-5 py-3">
                      <button onClick={() => openEdit(m)} className="flex items-center gap-3 text-left">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
                          <Package size={17} />
                        </span>
                        <span className="font-semibold">{m.name}</span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{m.unit}</span>
                    </td>
                    <td className="tabular px-5 py-3 text-right font-semibold">{euro(m.price)}</td>
                    <td className="tabular px-5 py-3 text-right text-muted">{m.used}×</td>
                    <td className="px-3 py-3 text-right">
                      <RowMenu onEdit={() => openEdit(m)} onDelete={() => setDeleting(m)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line sm:hidden">
              {rows.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3 pl-4 pr-2">
                  <button onClick={() => openEdit(m)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <Package size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{m.name}</span>
                      <span className="text-[13px] text-muted">për {m.unit} · {m.used}× përdorur</span>
                    </span>
                    <span className="tabular font-semibold">{euro(m.price)}</span>
                  </button>
                  <RowMenu onEdit={() => openEdit(m)} onDelete={() => setDeleting(m)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <p className="mt-4 px-1 text-xs text-muted">
        Ndryshimi i çmimit vlen vetëm për materialet që shtohen pas ndryshimit. Materialet e vjetra te klientët e mbajnë çmimin e tyre.
      </p>

      <Fab onClick={openNew}>
        <Plus size={20} /> Në katalog
      </Fab>

      <MaterialForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={(v) => {
          if (editing) {
            updateMaterial(editing.id, v);
            toast("Materiali u përditësua");
          } else {
            addMaterial(v);
            toast("Materiali u shtua në katalog");
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMaterial(deleting.id);
          toast("Materiali u fshi nga katalogu");
        }}
        title="Fshij nga katalogu?"
        text={`"${deleting?.name}" nuk do të shfaqet më për zgjedhje. Materialet e shtuara më parë te klientët mbeten.`}
      />
    </>
  );
}

function MaterialForm({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Material | null;
  onSave: (v: Omit<Material, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("copë");
  const [price, setPrice] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setUnit(initial?.unit ?? "copë");
    setPrice(initial ? initial.price.toFixed(2) : "");
    setErr({});
  }, [open, initial]);

  const save = () => {
    const p = parseFloat(price.replace(",", "."));
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Shkruaj emrin e materialit.";
    if (!(p >= 0) || price === "") e.price = "Shkruaj vlerën.";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ name: name.trim(), unit, price: p });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Ndrysho materialin" : "Shto në katalog"}
      description="Ky çmim plotësohet automatikisht te klientët"
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>Anulo</Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={save}>{initial ? "Ruaj ndryshimet" : "Ruaj materialin"}</Button>
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
        <Field label="Emri i materialit *" error={err.name}>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="p.sh. Çimento 25kg" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Njësia">
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={inputCls}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
          <Field label="Vlera (€) *" error={err.price}>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
          </Field>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <Menu
      trigger={() => (
        <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label="Veprime">
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
