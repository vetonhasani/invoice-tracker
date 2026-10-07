"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Modal, inputCls, cn } from "./ui";
import type { Client } from "@/lib/types";

type Values = { name: string; phone: string; address: string; note: string };

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
  const [v, setV] = useState<Values>({ name: "", phone: "", address: "", note: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setV({ name: initial?.name ?? "", phone: initial?.phone ?? "", address: initial?.address ?? "", note: initial?.note ?? "" });
      setError("");
    }
  }, [open, initial]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!v.name.trim()) return setError("Emri është i detyrueshëm.");
    onSave({ ...v, name: v.name.trim() });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Ndrysho klientin" : "Shto klient"}
      description="Vetëm emri është i detyrueshëm"
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            Anulo
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={() => submit()}>
            {initial ? "Ruaj ndryshimet" : "Ruaj klientin"}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4 pb-3">
        <Field label="Emri *" error={error}>
          <Input autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="p.sh. Arben Krasniqi" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefoni">
            <Input inputMode="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} placeholder="044 000 000" />
          </Field>
          <Field label="Adresa">
            <Input value={v.address} onChange={(e) => setV({ ...v, address: e.target.value })} placeholder="p.sh. Prishtinë" />
          </Field>
        </div>
        <Field label="Shënim">
          <textarea
            rows={3}
            value={v.note}
            onChange={(e) => setV({ ...v, note: e.target.value })}
            placeholder="Opsionale"
            className={cn(inputCls, "h-auto resize-none py-2.5")}
          />
        </Field>
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
}
