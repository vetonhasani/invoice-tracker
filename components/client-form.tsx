"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Modal, inputCls, cn } from "./ui";
import { dateSq, todayIso } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Client } from "@/lib/types";

type Values = { name: string; phone: string; address: string; note: string; createdAt: string };

export function ClientForm({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Client | null;
  onSave: (v: Values) => void;
}) {
  const { t } = useT();
  const [v, setV] = useState<Values>({ name: "", phone: "", address: "", note: "", createdAt: todayIso() });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setV({
        name: initial?.name ?? "",
        phone: initial?.phone ?? "",
        address: initial?.address ?? "",
        note: initial?.note ?? "",
        createdAt: initial?.createdAt ?? todayIso(), // new client → today, can be changed
      });
      setError("");
    }
  }, [open, initial]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!v.name.trim()) return setError(t.clientForm.nameRequired);
    // The date is when the client was first added — set once, never changed by editing
    onSave({ ...v, name: v.name.trim(), createdAt: initial?.createdAt ?? (v.createdAt || todayIso()) });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? t.clientForm.editTitle : t.clientForm.addTitle}
      description={t.clientForm.description}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={() => submit()}>
            {initial ? t.common.saveChanges : t.clientForm.save}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4 pb-3">
        <Field label={t.clientForm.name} error={error}>
          <Input autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder={t.clientForm.namePh} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.clientForm.phone}>
            <Input inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="044 000 000" />
          </Field>
          <Field label={t.clientForm.address}>
            <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder={t.clientForm.addressPh} />
          </Field>
        </div>
        {initial ? (
          <Field label={t.clients.colAdded}>
            <div className={cn(inputCls, "tabular flex items-center bg-slate-50 text-muted shadow-none")}>{dateSq(initial.createdAt)}</div>
          </Field>
        ) : (
          <Field label={t.clients.colAdded}>
            <Input type="date" value={v.createdAt} onChange={(e) => setV({ ...v, createdAt: e.target.value })} />
          </Field>
        )}
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
