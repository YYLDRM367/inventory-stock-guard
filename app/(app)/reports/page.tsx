"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  CircleDollarSign,
  TriangleAlert,
  PackageX,
  ArrowDownLeft,
  ArrowUpRight,
  Settings2,
  Loader2,
} from "lucide-react";
import { SegmentedBar } from "@/components/app/charts";
import { ItemThumb } from "@/components/app/item-thumb";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatUsdCompact, formatNumber } from "@/lib/utils";
import { categoryByKey, CATEGORIES } from "@/lib/categories";

/* ── Types ────────────────────────────────────────────────────────────────── */

type CategoryBreakdown = {
  category: string;
  items: number;
  units: number;
  value: number;
};

type TopItem = {
  id: string;
  name: string;
  sku: string;
  category: string | null;
  on_hand: number;
  price: number;
  cost: number;
  value: number;
};

type ReportData = {
  totalValue: number;
  totalItems: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryBreakdown: CategoryBreakdown[];
  topItems: TopItem[];
  movements: { in: number; out: number; adjust: number; total: number };
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ReportsPage() {
  const { lang } = useLang();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  const catSegments = data.categoryBreakdown.map((c) => {
    const def = categoryByKey(c.category);
    return {
      label: def?.label[lang] ?? c.category,
      value: c.value,
      color: def?.color ?? "var(--color-muted-foreground)",
    };
  });

  const maxCatValue = Math.max(...data.categoryBreakdown.map((c) => c.value), 1);

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          {lang === "tr" ? "Raporlar" : "Reports"}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {lang === "tr"
            ? "Stok değeri, kategori dağılımı ve hareket özeti."
            : "Stock value, category breakdown, and movement summary."}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<CircleDollarSign className="h-4 w-4" />}
          tone="primary"
          label={lang === "tr" ? "Toplam stok değeri" : "Total stock value"}
          value={formatUsdCompact(data.totalValue)}
          sub={`${formatNumber(data.totalUnits)} ${lang === "tr" ? "birim" : "units"}`}
        />
        <KpiCard
          icon={<Boxes className="h-4 w-4" />}
          tone="info"
          label={lang === "tr" ? "Toplam kalem" : "Total items"}
          value={formatNumber(data.totalItems)}
          sub={lang === "tr" ? "Farklı ürün" : "Unique products"}
        />
        <KpiCard
          icon={<TriangleAlert className="h-4 w-4" />}
          tone="warning"
          label={lang === "tr" ? "Düşük stok" : "Low stock"}
          value={formatNumber(data.lowStockCount)}
          sub={lang === "tr" ? "Sipariş noktasının altında" : "Below reorder point"}
        />
        <KpiCard
          icon={<PackageX className="h-4 w-4" />}
          tone="destructive"
          label={lang === "tr" ? "Tükendi" : "Out of stock"}
          value={formatNumber(data.outOfStockCount)}
          sub={lang === "tr" ? "Stok yok" : "Zero units"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Category breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            {lang === "tr" ? "Kategori dağılımı" : "Category breakdown"}
          </h2>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {lang === "tr" ? "Stok değerine göre" : "By stock value"}
          </p>

          {data.categoryBreakdown.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {lang === "tr" ? "Henüz veri yok." : "No data yet."}
            </p>
          ) : (
            <>
              <div className="mt-4">
                <SegmentedBar segments={catSegments} />
              </div>

              <div className="mt-5 space-y-2.5">
                {data.categoryBreakdown.map((c) => {
                  const def = categoryByKey(c.category);
                  const pct = Math.round((c.value / maxCatValue) * 100);
                  return (
                    <div key={c.category}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: def?.color ?? "var(--color-muted-foreground)" }}
                          />
                          {def?.label[lang] ?? c.category}
                        </span>
                        <span className="tnum text-[12.5px] text-muted-foreground">
                          {formatUsd(c.value)}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="bar-grow h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: def?.color ?? "var(--color-primary)",
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {c.items} {lang === "tr" ? "kalem" : "items"} ·{" "}
                        {formatNumber(c.units)} {lang === "tr" ? "birim" : "units"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Movement summary */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              {lang === "tr" ? "Son 30 gün hareketleri" : "Last 30 days movements"}
            </h2>
            <div className="mt-4 space-y-3">
              <MovementRow
                icon={<ArrowDownLeft className="h-4 w-4" />}
                tone="success"
                label={lang === "tr" ? "Giriş (alış)" : "Stock in"}
                value={formatNumber(data.movements.in)}
                unit={lang === "tr" ? "birim" : "units"}
              />
              <MovementRow
                icon={<ArrowUpRight className="h-4 w-4" />}
                tone="destructive"
                label={lang === "tr" ? "Çıkış (satış/kullanım)" : "Stock out"}
                value={formatNumber(data.movements.out)}
                unit={lang === "tr" ? "birim" : "units"}
              />
              <MovementRow
                icon={<Settings2 className="h-4 w-4" />}
                tone="info"
                label={lang === "tr" ? "Düzeltme" : "Adjustments"}
                value={formatNumber(data.movements.adjust)}
                unit={lang === "tr" ? "birim" : "units"}
              />
            </div>
            {data.movements.total === 0 && (
              <p className="mt-4 text-center text-[12px] text-muted-foreground">
                {lang === "tr"
                  ? "Henüz hareket kaydı yok."
                  : "No movement records yet."}
              </p>
            )}
          </div>

          {/* Top items by value */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "En değerli kalemler" : "Top items by value"}
              </h2>
            </div>
            {data.topItems.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-muted-foreground">
                {lang === "tr" ? "Kalem yok." : "No items yet."}
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {data.topItems.map((it, i) => {
                  const cat = categoryByKey(it.category);
                  return (
                    <div key={it.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="tnum w-5 shrink-0 text-[12px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <ItemThumb category={it.category ?? "tools"} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">{it.name}</p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">
                          {it.sku} · {cat?.label[lang] ?? "—"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[13px] font-semibold">{formatUsd(it.value)}</p>
                        <p className="tnum text-[11px] text-muted-foreground">
                          {it.on_hand} {lang === "tr" ? "adet" : "units"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All categories table */}
      {data.categoryBreakdown.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="border-b border-border px-4 py-3">
            <h2 className="font-display text-[15px] font-semibold tracking-tight">
              {lang === "tr" ? "Kategori özeti" : "Category summary"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Kategori" : "Category"}</th>
                  <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Kalem" : "Items"}</th>
                  <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Birim" : "Units"}</th>
                  <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Değer" : "Value"}</th>
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((catDef) => {
                  const row = data.categoryBreakdown.find((c) => c.category === catDef.key);
                  if (!row) return null;
                  return (
                    <tr key={catDef.key} className="border-b border-border/60 last:border-0">
                      <td className="py-2.5 pl-4">
                        <span className="inline-flex items-center gap-2 text-[13px] font-medium">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: catDef.color }} />
                          {catDef.label[lang]}
                        </span>
                      </td>
                      <td className="py-2.5 text-right tnum text-[13px]">{row.items}</td>
                      <td className="py-2.5 text-right tnum text-[13px]">{formatNumber(row.units)}</td>
                      <td className="py-2.5 pr-4 text-right tnum font-semibold">{formatUsd(row.value)}</td>
                    </tr>
                  );
                })}
                <tr className="border-t border-border bg-muted/30">
                  <td className="py-2.5 pl-4 text-[12.5px] font-semibold">{lang === "tr" ? "Toplam" : "Total"}</td>
                  <td className="py-2.5 text-right tnum font-semibold">{data.totalItems}</td>
                  <td className="py-2.5 text-right tnum font-semibold">{formatNumber(data.totalUnits)}</td>
                  <td className="py-2.5 pr-4 text-right tnum font-bold text-primary">{formatUsd(data.totalValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */

function KpiCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  tone: "primary" | "info" | "warning" | "destructive";
  label: string;
  value: string;
  sub: string;
}) {
  const toneCls = {
    primary:     "bg-primary/12 text-primary",
    info:        "bg-info/12 text-info",
    warning:     "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <p className="mt-3 tnum text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground/80">{sub}</p>
    </div>
  );
}

/* ── Movement row ─────────────────────────────────────────────────────────── */

function MovementRow({
  icon,
  tone,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode;
  tone: "success" | "destructive" | "info";
  label: string;
  value: string;
  unit: string;
}) {
  const toneCls = {
    success:     "bg-success/12 text-success",
    destructive: "bg-destructive/10 text-destructive",
    info:        "bg-info/12 text-info",
  }[tone];
  return (
    <div className="flex items-center gap-3">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <span className="flex-1 text-[13px] text-muted-foreground">{label}</span>
      <span className="tnum text-[13px] font-semibold">{value} <span className="text-muted-foreground font-normal">{unit}</span></span>
    </div>
  );
}
