"use client";

import { useId } from "react";

/* ── Mini line chart with a soft area fill (bespoke inline SVG, no chart lib) ─ */
export function MiniLineChart({
  data,
  color = "var(--color-primary)",
  height = 56,
  className,
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const w = 200;
  const h = height;
  const pad = 4;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = (w - pad * 2) / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${h - pad} L${pts[0][0].toFixed(1)} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" style={{ width: "100%", height }}>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#fill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

/* ── Larger area chart (stock value over time) ─────────────────────────────── */
export function AreaChart({
  data,
  labels,
  color = "var(--color-primary)",
  height = 150,
}: {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
}) {
  const id = useId().replace(/:/g, "");
  const w = 520;
  const h = height;
  const padX = 6;
  const padTop = 10;
  const padBottom = labels ? 22 : 8;
  const max = Math.max(...data);
  const min = Math.min(...data) * 0.92;
  const span = max - min || 1;
  const step = (w - padX * 2) / (data.length - 1 || 1);
  const pts = data.map((v, i) => {
    const x = padX + i * step;
    const y = padTop + (1 - (v - min) / span) * (h - padTop - padBottom);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const baseY = h - padBottom;
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${baseY} L${pts[0][0].toFixed(1)} ${baseY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`afill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={padX} x2={w - padX} y1={padTop + g * (h - padTop - padBottom)} y2={padTop + g * (h - padTop - padBottom)} stroke="var(--color-border)" strokeWidth="1" />
      ))}
      <path d={area} fill={`url(#afill-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.2 : 2.2} fill="var(--color-card)" stroke={color} strokeWidth="1.6" />
      ))}
      {labels &&
        labels.map((lab, i) => (
          <text key={lab + i} x={padX + i * step} y={h - 6} textAnchor="middle" fontSize="9" fill="var(--color-muted-foreground)" fontFamily="var(--font-mono)">
            {lab}
          </text>
        ))}
    </svg>
  );
}

/* ── Multi-color segmented breakdown bar (category / location mix) ─────────── */
export function SegmentedBar({
  segments,
  className,
}: {
  segments: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((s, i) => (
          <span
            key={s.label}
            title={`${s.label} · ${Math.round((s.value / total) * 100)}%`}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, marginLeft: i === 0 ? 0 : 1.5 }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="tnum text-foreground/70">{Math.round((s.value / total) * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Horizontal stock-level bar (on-hand vs reorder point) ─────────────────── */
export function StockLevelBar({
  onHand,
  reorderPoint,
  state,
  className,
}: {
  onHand: number;
  reorderPoint: number;
  state: "in" | "low" | "out";
  className?: string;
}) {
  // scale: a comfortable full bar = 2× reorder point (min 8)
  const full = Math.max(reorderPoint * 2, 8, onHand);
  const pct = Math.min(100, Math.round((onHand / full) * 100));
  const reorderPct = Math.min(100, Math.round((reorderPoint / full) * 100));
  const color =
    state === "out" ? "var(--color-stock-out)" : state === "low" ? "var(--color-stock-low)" : "var(--color-stock-in)";
  return (
    <div className={className}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        {/* reorder-point tick */}
        <span
          className="absolute top-[-2px] h-[12px] w-[2px] rounded-full bg-foreground/30"
          style={{ left: `calc(${reorderPct}% - 1px)` }}
          title="reorder point"
        />
      </div>
    </div>
  );
}
