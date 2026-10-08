"use client";

import { Card, cn } from "./ui";
import { den } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { sumEntries } from "@/lib/store";
import type { Entry } from "@/lib/types";

export type Period = "all" | string; // "all" or a year like "2026"

/** The last three years are always listed (e.g. 2026, 2025, 2024), plus any older year that has data. */
export function historyYears(entries: Entry[]) {
  const now = new Date().getFullYear();
  const ys = new Set([now, now - 1, now - 2].map(String));
  entries.forEach((e) => ys.add(e.date.slice(0, 4)));
  return [...ys].sort().reverse();
}

export function PeriodTabs({ years, value, onChange }: { years: string[]; value: Period; onChange: (p: Period) => void }) {
  const { t } = useT();
  const opts = [{ id: "all", label: t.history.allTime }, ...years.map((y) => ({ id: y, label: y }))];
  return (
    <div role="tablist" className="inline-flex max-w-full overflow-x-auto rounded-xl border border-line bg-slate-100 p-1">
      {opts.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "tabular h-8 shrink-0 rounded-lg px-3 text-sm font-semibold transition",
            value === o.id ? "bg-white text-ink shadow-card" : "text-muted hover:text-ink"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function TotalHistory({
  entries,
  years,
  period,
  onPeriod,
}: {
  entries: Entry[];
  years: string[];
  period: Period;
  onPeriod: (p: Period) => void;
}) {
  const { t } = useT();
  const perYear = years.map((y) => {
    const list = entries.filter((e) => e.date.startsWith(y));
    return { year: y, total: sumEntries(list), count: list.length };
  });
  const max = Math.max(...perYear.map((y) => y.total), 1);
  const allTotal = sumEntries(entries);

  return (
    <Card className="mb-6 p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-semibold">{t.history.title}</h2>
        <p className="text-sm text-muted">{t.history.subtitle}</p>
      </div>

      <div className={cn("grid gap-6", period !== "all" && "lg:grid-cols-2")}>
        {/* One bar per year; the row is the hit target */}
        <div className="space-y-1">
          {perYear.map((y) => (
            <button
              key={y.year}
              onClick={() => onPeriod(period === y.year ? "all" : y.year)}
              aria-pressed={period === y.year}
              className={cn(
                "grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-lg px-2 py-2 text-left transition",
                period === y.year ? "bg-brand-50" : "hover:bg-slate-50"
              )}
            >
              <span className="tabular text-sm font-semibold">{y.year}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <span
                  className={cn("block h-full rounded-full", period === "all" || period === y.year ? "bg-brand-600" : "bg-brand-200")}
                  style={{ width: `${(y.total / max) * 100}%` }}
                />
              </span>
              <span className="tabular text-right">
                <span className="block text-sm font-semibold">{den(y.total)}</span>
                <span className="block text-[11px] text-muted">{t.history.entriesIn(y.count)}</span>
              </span>
            </button>
          ))}
          <button
            onClick={() => onPeriod("all")}
            aria-pressed={period === "all"}
            className={cn(
              "mt-1 flex w-full items-center justify-between rounded-lg border-t border-line px-2 pb-2 pt-3 text-left transition",
              period === "all" ? "bg-brand-50" : "hover:bg-slate-50"
            )}
          >
            <span className="text-sm font-bold">{t.history.allTime}</span>
            <span className="tabular text-right">
              <span className="block font-bold">{den(allTotal)}</span>
              <span className="block text-[11px] text-muted">{t.history.entriesIn(entries.length)}</span>
            </span>
          </button>
        </div>

        {period !== "all" && <MonthBars entries={entries.filter((e) => e.date.startsWith(period))} year={period} />}
      </div>
    </Card>
  );
}

function MonthBars({ entries, year }: { entries: Entry[]; year: string }) {
  const { t } = useT();
  const months = t.months.map((name, i) => {
    const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
    return { name, short: name.slice(0, 3), total: sumEntries(entries.filter((e) => e.date.startsWith(ym))) };
  });
  const max = Math.max(...months.map((m) => m.total), 1);
  const best = months.reduce((a, b) => (b.total > a.total ? b : a));

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{t.history.byMonth(year)}</span>
        {best.total > 0 && (
          <span className="tabular text-xs text-muted">
            {best.name}: <b className="text-ink">{den(best.total)}</b>
          </span>
        )}
      </div>
      <div className="flex h-36 items-end gap-[2px] border-b border-line">
        {months.map((m) => (
          <div key={m.name} className="group relative flex h-full flex-1 items-end" title={`${m.name} ${year}: ${den(m.total)}`}>
            <div
              className="w-full rounded-t bg-brand-600 transition group-hover:bg-brand-700"
              style={{ height: m.total ? `max(${(m.total / max) * 100}%, 3px)` : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-[2px]">
        {months.map((m) => (
          <span key={m.name} className="flex-1 text-center text-[10px] text-muted">
            {m.short}
          </span>
        ))}
      </div>
    </div>
  );
}
