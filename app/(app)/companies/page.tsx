"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, Ellipsis, MapPin, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Fab, PageHeader } from "@/components/page-header";
import { Button, Card, Confirm, Empty, Field, Input, Menu, Modal, SearchBox, cn, inputCls } from "@/components/ui";
import { useToast } from "@/components/toast";
import { den } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { sumEntries, useStore } from "@/lib/store";
import type { Company } from "@/lib/types";

export default function CompaniesPage() {
  const { companies, materials, entries, addCompany, updateCompany, deleteCompany } = useStore();
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);

  const rows = useMemo(
    () =>
      companies
        .map((c) => ({
          ...c,
          materialCount: materials.filter((m) => m.companyId === c.id).length,
          sold: sumEntries(entries.filter((e) => e.companyId === c.id)),
        }))
        .filter((c) => (c.name + " " + (c.phone ?? "") + " " + (c.address ?? "")).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [companies, materials, entries, q]
  );

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Company) => {
    setEditing(c);
    setFormOpen(true);
  };
  const open = (c: Company) => router.push(`/materials?company=${c.id}`);

  return (
    <>
      <PageHeader
        title={t.companies.title}
        subtitle={t.companies.subtitle}
        actions={
          <Button onClick={openNew}>
            <Plus size={17} /> {t.companies.add}
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-line p-3">
          <SearchBox value={q} onChange={setQ} placeholder={t.companies.search} />
        </div>

        {rows.length === 0 ? (
          <Empty
            icon={<Building2 size={24} />}
            title={q ? t.companies.notFound : t.companies.empty}
            text={q ? t.common.tryAnotherName : t.companies.emptyText}
            action={!q && <Button onClick={openNew}><Plus size={17} /> {t.companies.add}</Button>}
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="border-b border-line bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <th className="px-5 py-3">{t.companies.colCompany}</th>
                  <th className="px-5 py-3">{t.companies.colPhone}</th>
                  <th className="px-5 py-3 text-right">{t.companies.colMaterials}</th>
                  <th className="px-5 py-3 text-right">{t.companies.colSold}</th>
                  <th className="w-24 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => open(c)}
                    className="group cursor-pointer border-b border-line last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <CompanyIcon />
                        <div>
                          <div className="font-semibold">{c.name}</div>
                          {c.address && <div className="text-xs text-muted">{c.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{c.phone || "—"}</td>
                    <td className="tabular px-5 py-3.5 text-right">{c.materialCount}</td>
                    <td className="tabular px-5 py-3.5 text-right font-semibold">{den(c.sold)}</td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <RowMenu onView={() => open(c)} onEdit={() => openEdit(c)} onDelete={() => setDeleting(c)} />
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
                <li key={c.id} className="flex items-center gap-2 py-3 pl-4 pr-2">
                  <button onClick={() => open(c)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <CompanyIcon size={42} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{c.name}</span>
                      <span className="flex items-center gap-1 truncate text-[13px] text-muted">
                        <Package size={12} /> {c.materialCount}
                        {c.address && <><span className="mx-1">·</span><MapPin size={12} /> {c.address}</>}
                      </span>
                    </span>
                    <span className="tabular font-semibold">{den(c.sold)}</span>
                  </button>
                  <RowMenu onView={() => open(c)} onEdit={() => openEdit(c)} onDelete={() => setDeleting(c)} />
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Fab onClick={openNew}>
        <Plus size={20} /> {t.companies.fab}
      </Fab>

      <CompanyForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={(v) => {
          if (editing) {
            updateCompany(editing.id, v);
            toast(t.companies.updated);
          } else {
            addCompany(v);
            toast(t.companies.added);
          }
        }}
      />
      <Confirm
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteCompany(deleting.id);
          toast(t.companies.deleted);
        }}
        title={t.companies.deleteTitle}
        text={t.companies.deleteText(deleting?.name ?? "", materials.filter((m) => m.companyId === deleting?.id).length)}
      />
    </>
  );
}

function CompanyIcon({ size = 36 }: { size?: number }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600" style={{ width: size, height: size }}>
      <Building2 size={size * 0.46} />
    </span>
  );
}

type Values = { name: string; phone: string; address: string; note: string };

function CompanyForm({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Company | null;
  onSave: (v: Values) => void;
}) {
  const { t } = useT();
  const [v, setV] = useState<Values>({ name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setV({ name: initial?.name ?? "", phone: initial?.phone ?? "", address: initial?.address ?? "", note: initial?.note ?? "" });
    setError("");
  }, [open, initial]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!v.name.trim()) return setError(t.clientForm.nameRequired);
    onSave({ ...v, name: v.name.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t.companies.editTitle : t.companies.addTitle}
      description={t.companies.description}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={() => submit()}>
            {initial ? t.common.saveChanges : t.companies.save}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4 pb-3">
        <Field label={t.clientForm.name} error={error}>
          <Input autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder={t.companies.namePh} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.clientForm.phone}>
            <Input inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="038 000 000" />
          </Field>
          <Field label={t.clientForm.address}>
            <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder={t.clientForm.addressPh} />
          </Field>
        </div>
        <Field label={t.clientForm.note}>
          <textarea
            rows={3}
            value={v.note}
            onChange={(e) => setV({ ...v, note: e.target.value })}
            placeholder={t.common.optional}
            className={cn(inputCls, "h-auto resize-none py-2.5")}
          />
        </Field>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}

function RowMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const { t } = useT();
  return (
    <Menu
      trigger={() => (
        <button className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-ink" aria-label={t.common.actions}>
          <Ellipsis size={18} />
        </button>
      )}
      items={[
        { label: t.companies.viewMaterials, icon: <Package size={15} />, onClick: onView },
        { label: t.common.edit, icon: <Pencil size={15} />, onClick: onEdit },
        { label: t.common.delete, icon: <Trash2 size={15} />, onClick: onDelete, danger: true },
      ]}
    />
  );
}
