"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { initials } from "@/lib/format";
import { LANGS, useT } from "@/lib/i18n";

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------- Button ---------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", className, ...p },
  ref
) {
  return (
    <button
      ref={ref}
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap transition-all",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 disabled:opacity-50 disabled:pointer-events-none active:scale-[.98]",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-12 px-5 text-[15px]",
        variant === "primary" &&
          "bg-brand-600 text-white shadow-[0_1px_0_rgb(255_255_255/.15)_inset,0_1px_2px_rgb(37_87_235/.4)] hover:bg-brand-700",
        variant === "secondary" && "bg-white text-ink border border-line shadow-card hover:bg-slate-50",
        variant === "ghost" && "text-muted hover:bg-slate-100 hover:text-ink",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
    />
  );
});

/* ---------- Inputs ---------- */
export const inputCls =
  "w-full h-11 rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-slate-400 shadow-card transition focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...p },
  ref
) {
  return <input ref={ref} {...p} className={cn(inputCls, className)} />;
});

export function Field({
  label,
  hint,
  error,
  children,
  className,
  right,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center justify-between text-[13px] font-semibold text-ink">
        {label}
        {right}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

/* ---------- Avatar ---------- */
const AV = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-800",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];
export function Avatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length;
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold", AV[i], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

/* ---------- Card / Stat ---------- */
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("rounded-2xl border border-line bg-white shadow-card", className)} />;
}

export function Stat({
  label,
  value,
  icon,
  accent,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 sm:p-5",
        accent
          ? "border-brand-700 bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-[0_8px_24px_-8px_rgb(37_87_235/.6)]"
          : "border-line bg-white shadow-card",
        className
      )}
    >
      <div className={cn("flex items-center gap-2 text-[13px] font-medium", accent ? "text-brand-100" : "text-muted")}>
        {icon}
        {label}
      </div>
      <div className="tabular mt-2 text-2xl font-bold tracking-tight sm:text-[28px]">{value}</div>
      {accent && <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />}
    </div>
  );
}

/* ---------- Modal (centered on desktop, bottom sheet on mobile) ---------- */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const { t } = useT();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-3xl bg-white shadow-pop sm:max-w-[460px] sm:animate-pop-in sm:rounded-2xl"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start justify-between gap-4 px-5 pb-1 pt-4 sm:px-6 sm:pt-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="-mr-1.5 -mt-1 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-slate-100 hover:text-ink"
            aria-label={t.common.close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-2 pt-3 sm:px-6">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text: string;
  confirmLabel?: string;
}) {
  const { t } = useT();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="sm:h-10 sm:text-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t.common.delete}
          </Button>
        </>
      }
    >
      <p className="pb-3 text-[15px] text-muted">{text}</p>
    </Modal>
  );
}

/* ---------- Dropdown menu ---------- */
export function Menu({
  trigger,
  items,
  align = "right",
}: {
  trigger: (open: boolean) => React.ReactNode;
  items: { label: string; icon?: React.ReactNode; right?: React.ReactNode; onClick: () => void; danger?: boolean }[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block">
      <span
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger(open)}
      </span>
      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1.5 min-w-44 animate-pop-in rounded-xl border border-line bg-white p-1.5 shadow-pop",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((it) => (
            <button
              key={it.label}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                it.onClick();
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium",
                it.danger ? "text-red-600 hover:bg-red-50" : "text-ink hover:bg-slate-100"
              )}
            >
              {it.icon}
              {it.label}
              {it.right && <span className="ml-auto pl-3">{it.right}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Search input ---------- */
export function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(inputCls, "h-10 pl-10 shadow-none")}
      />
    </div>
  );
}

/* ---------- Language switch (AL / EN) ---------- */
export function LangSwitch({ className }: { className?: string }) {
  const { lang, setLang, t } = useT();
  return (
    <div role="radiogroup" aria-label={t.lang.label} className={cn("inline-flex rounded-xl border border-line bg-slate-100 p-1", className)}>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          role="radio"
          aria-checked={lang === l.id}
          title={l.name}
          onClick={() => setLang(l.id)}
          className={cn(
            "h-8 rounded-lg px-3 text-sm font-semibold transition",
            lang === l.id ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
