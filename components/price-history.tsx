"use client";

import { ArrowDownRight, ArrowUpRight, Building2, Minus, Pencil } from "lucide-react";
import { Button, Modal, cn } from "./ui";
import { dateTimeSq, den } from "@/lib/format";
import { useT } from "@/lib/i18n";
import type { Material, PricePoint } from "@/lib/types";

/** Latest change of a material's price, or null if it was never changed. */
export function lastChange(m: Material) {
  const h = m.priceHistory;
  if (h.length < 2) return null;
  return { from: h[h.length - 2].price, to: h[h.length - 1].price, at: h[h.length - 1].at };
}

/** ▲ +25 Den (+6.2%) / ▼ −20 Den (−4.1%). Direction is always shown by icon + sign, not color alone. */
export function TrendBadge({ from, to, className }: { from: number; to: number; className?: string }) {
  const diff = to - from;
  const pct = from ? (diff / from) * 100 : 0;
  const up = diff > 0;
  const flat = diff === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold",
        flat ? "bg-slate-100 text-slate-600" : up ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700",
        className
      )}
    >
      <Icon size={13} strokeWidth={2.5} />
      {flat ? "0%" : `${up ? "+" : "−"}${den(Math.abs(diff))} (${up ? "+" : "−"}${Math.abs(pct).toFixed(1)}%)`}
    </span>
  );
}

export function PriceHistoryModal({
  material,
  companyName,
  onClose,
  onEdit,
}: {
  material: Material | null;
  companyName?: string;
  onClose: () => void;
  onEdit: (m: Material) => void;
}) {
  const { t, unit } = useT();
  if (!material) return null;

  const h = material.priceHistory;
  const first = h[0];
  const prices = h.map((p) => p.price);
  const changes = h.length - 1;
  const rows = h.map((p, i) => ({ ...p, prev: i > 0 ? h[i - 1].price : null })).reverse();

  return (
    <Modal
      open
      onClose={onClose}
      title={material.name}
      description={`${t.materials.priceHistory} · ${t.materials.priceHistoryText(changes)}`}
      footer={
        <>
          <Button variant="secondary" size="lg" className="sm:h-10 sm:text-sm" onClick={onClose}>
            {t.common.close}
          </Button>
          <Button size="lg" className="sm:h-10 sm:text-sm" onClick={() => onEdit(material)}>
            <Pencil size={15} /> {t.common.edit}
          </Button>
        </>
      }
    >
      <div className="space-y-4 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Building2 size={14} /> {companyName ?? t.companies.none}
          </span>
          <span>·</span>
          <span>/ {unit(material.unit)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Mini label={t.materials.current} value={den(material.price)} strong />
          <Mini label={t.materials.initialPrice} value={den(first.price)} />
          <Mini label={t.materials.lowest} value={den(Math.min(...prices))} />
          <Mini label={t.materials.highest} value={den(Math.max(...prices))} />
        </div>

        {changes > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-2.5 text-sm">
            <span className="text-muted">{t.materials.sinceStart} ({day(first.at)})</span>
            <TrendBadge from={first.price} to={material.price} />
          </div>
        )}

        {changes > 0 && <StepChart points={h} />}

        <div>
          <div className="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>{t.materials.dateTime}</span>
            <span className="text-right">{t.cols.price}</span>
            <span className="w-32 text-right">{t.materials.change}</span>
          </div>
          <ol className="divide-y divide-line rounded-xl border border-line">
            {rows.map((p, i) => (
              <li key={p.at + i} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 text-sm">
                <span className="tabular text-muted">{dateTimeSq(p.at)}</span>
                <span className="tabular text-right font-semibold">{den(p.price)}</span>
                <span className="w-32 text-right">
                  {p.prev === null ? (
                    <span className="text-xs font-medium text-muted">{t.materials.initialPrice}</span>
                  ) : (
                    <TrendBadge from={p.prev} to={p.price} />
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>
  );
}

function Mini({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn("rounded-xl border px-3 py-2.5", strong ? "border-brand-200 bg-brand-50" : "border-line")}>
      <div className="text-[11px] font-medium text-muted">{label}</div>
      <div className={cn("tabular mt-0.5 font-bold", strong && "text-brand-700")}>{value}</div>
    </div>
  );
}

/**
 * Step line: a price holds until the next change, and the last one runs to today.
 * Each change has a hover target with a native tooltip; the list below is the table view.
 */
function StepChart({ points }: { points: PricePoint[] }) {
  const W = 400;
  const H = 120;
  const pad = { l: 44, r: 8, t: 10, b: 20 };
  const times = points.map((p) => new Date(p.at).getTime());
  const now = Math.max(Date.now(), times[times.length - 1]);
  const t0 = times[0];
  const prices = points.map((p) => p.price);
  let lo = Math.min(...prices);
  let hi = Math.max(...prices);
  const span = hi - lo || hi * 0.1 || 1;
  lo -= span * 0.15;
  hi += span * 0.15;

  const x = (t: number) => pad.l + ((t - t0) / (now - t0 || 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);

  let d = `M ${x(times[0])} ${y(prices[0])}`;
  for (let i = 1; i < points.length; i++) d += ` H ${x(times[i])} V ${y(prices[i])}`;
  d += ` H ${x(now)}`;

  const yTicks = [Math.max(...prices), Math.min(...prices)];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Price over time">
      {yTicks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeDasharray="3 3" />
          <text x={pad.l - 6} y={y(v) + 3.5} textAnchor="end" className="tabular fill-muted text-[10px]">
            {den(v)}
          </text>
        </g>
      ))}
      <path d={d} fill="none" stroke="var(--color-brand-600)" strokeWidth={2} strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.at + i}>
          <circle cx={x(times[i])} cy={y(p.price)} r={4} fill="var(--color-brand-600)" stroke="white" strokeWidth={2} />
          {/* larger invisible hit target */}
          <circle cx={x(times[i])} cy={y(p.price)} r={12} fill="transparent">
            <title>{`${day(p.at)} · ${den(p.price)}`}</title>
          </circle>
        </g>
      ))}
      <text x={pad.l} y={H - 4} className="tabular fill-muted text-[10px]">{day(points[0].at)}</text>
      <text x={W - pad.r} y={H - 4} textAnchor="end" className="tabular fill-muted text-[10px]">{day(new Date(now).toISOString())}</text>
    </svg>
  );
}

/** Local calendar day of an ISO date-time: 07.10.2026 */
const day = (iso: string) => dateTimeSq(iso).slice(0, 10);
