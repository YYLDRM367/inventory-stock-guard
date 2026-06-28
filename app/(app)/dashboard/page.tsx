"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Download,
  Plus,
  Minus,
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  TriangleAlert,
  PackageX,
  Boxes,
  CircleDollarSign,
  ArrowDownLeft,
  Settings2,
} from "lucide-react";
import { ItemThumb } from "@/components/app/item-thumb";
import { Barcode, QrCode } from "@/components/app/barcode";
import { AreaChart, StockLevelBar } from "@/components/app/charts";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatUsdCompact, formatNumber, formatRelative } from "@/lib/utils";
import {
  items,
  categories,
  categoryByKey,
  summary,
  stockValueTrend,
  stockValueMeta,
  locations,
  locationsMeta,
  movements,
  movementsMeta,
  purchaseOrders,
  purchaseOrdersMeta,
  stockStateOf,
  stockValueOf,
  STOCK_LABEL,
  PO_LABEL,
  type Item,
} from "@/lib/demo/data";

export default function DashboardPage() {
  const { lang } = useLang();
  const [selected, setSelected] = useState<string | null>("it1");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [lowOnly, setLowOnly] = useState(false);
  // local "adjust stock" state for the drawer — pure useState, demo only
  const [adjust, setAdjust] = useState<Record<string, number>>({});

  const tt = (v: { tr: string; en: string }) => v[lang];

  const rows = useMemo(
    () =>
      items.filter((it) => {
        if (category !== "all" && it.category !== category) return false;
        if (lowOnly && stockStateOf(it) === "in") return false;
        if (query) {
          const q = query.toLowerCase();
          if (!it.name.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [category, lowOnly, query],
  );

  const sel = items.find((i) => i.id === selected) ?? null;
  const selAdjusted = sel ? Math.max(0, sel.onHand + (adjust[sel.id] ?? 0)) : 0;

  const lowItems = items.filter((it) => stockStateOf(it) !== "in");
  const draftPOs = purchaseOrders.filter((p) => p.status !== "received");

  const maxLoc = Math.max(...locations.map((l) => l.value));

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      <div className={cn("grid gap-6", drawerOpen ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* ── Main column ──────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {/* Page header */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {lang === "tr" ? "Stok panosu" : "Inventory overview"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Neyin var, nerede ve ne zaman sipariş vereceğin."
                  : "What you have, where, and when to reorder."}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted">
                <Download className="h-4 w-4 text-muted-foreground" />
                {lang === "tr" ? "CSV dışa aktar" : "Export CSV"}
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                <Plus className="h-4 w-4" />
                {lang === "tr" ? "Kalem ekle" : "Add item"}
              </button>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Boxes className="h-4 w-4" />}
              label={tt(summary.totalItems.label)}
              value={formatNumber(summary.totalItems.value)}
              sub={`${formatNumber(summary.totalUnits)} ${lang === "tr" ? "birim" : "units"}`}
              tone="primary"
            />
            <StatCard
              icon={<CircleDollarSign className="h-4 w-4" />}
              label={tt(summary.totalValue.label)}
              value={formatUsdCompact(summary.totalValue.value)}
              sub={tt(summary.totalValue.sub)}
              delta={summary.totalValue.delta}
              tone="info"
            />
            <StatCard
              icon={<TriangleAlert className="h-4 w-4" />}
              label={tt(summary.lowStock.label)}
              value={formatNumber(summary.lowStock.value)}
              sub={tt(summary.lowStock.sub)}
              tone="warning"
            />
            <StatCard
              icon={<PackageX className="h-4 w-4" />}
              label={tt(summary.outOfStock.label)}
              value={formatNumber(summary.outOfStock.value)}
              sub={tt(summary.outOfStock.sub)}
              tone="destructive"
            />
          </div>

          {/* Low-stock alert panel */}
          {lowItems.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-warning/40 bg-warning/[0.06] shadow-soft">
              <div className="flex items-center gap-2.5 border-b border-warning/30 px-4 py-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-warning/20 text-warning-foreground">
                  <TriangleAlert className="h-4 w-4" />
                </span>
                <h2 className="font-display text-[15px] font-semibold tracking-tight">
                  {lang === "tr" ? "Düşük stok uyarıları" : "Low-stock alerts"}
                </h2>
                <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-semibold text-warning-foreground">
                  {lowItems.length}
                </span>
                <button className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "tr" ? "Sipariş oluştur" : "Create PO"}
                </button>
              </div>
              <div className="divide-y divide-warning/20">
                {lowItems.map((it) => {
                  const st = stockStateOf(it);
                  return (
                    <button
                      key={it.id}
                      onClick={() => {
                        setSelected(it.id);
                        setDrawerOpen(true);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-warning/[0.04]"
                    >
                      <ItemThumb category={it.category} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">{it.name}</p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">{it.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[13px] font-semibold">
                          {it.onHand} / {it.reorderPoint}
                        </p>
                        <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_LABEL[st].tone)}>
                          {lang === "tr" ? STOCK_LABEL[st].tr : STOCK_LABEL[st].en}
                        </span>
                      </div>
                      <span className="hidden text-[12px] font-medium text-primary sm:inline">
                        {lang === "tr" ? `+${it.reorderQty} sipariş` : `+${it.reorderQty} reorder`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Kalemler" : "Items"}
              </h2>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{rows.length}</span>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === "tr" ? "İsim ya da SKU…" : "Name or SKU…"}
                    className="w-28 bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none sm:w-40"
                  />
                </div>
                <button
                  onClick={() => setLowOnly((v) => !v)}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors",
                    lowOnly ? "border-warning/50 bg-warning/15 text-warning-foreground" : "border-border bg-card text-foreground hover:bg-muted",
                  )}
                >
                  <TriangleAlert className="h-3.5 w-3.5" />
                  {lang === "tr" ? "Sadece düşük" : "Low only"}
                </button>
              </div>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
              <CatPill active={category === "all"} onClick={() => setCategory("all")} label={lang === "tr" ? "Tümü" : "All"} />
              {categories.map((c) => (
                <CatPill
                  key={c.key}
                  active={category === c.key}
                  onClick={() => setCategory(c.key)}
                  label={tt(c.label)}
                  color={c.color}
                />
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Kalem" : "Item"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground md:table-cell">SKU</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground lg:table-cell">{lang === "tr" ? "Konum" : "Location"}</th>
                    <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Stok seviyesi" : "Stock level"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Değer" : "Value"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((it) => {
                    const isSel = it.id === selected;
                    const st = stockStateOf(it);
                    const cat = categoryByKey(it.category);
                    const primaryLoc = it.locations[0]?.loc ?? "—";
                    return (
                      <tr
                        key={it.id}
                        onClick={() => {
                          setSelected(it.id);
                          setDrawerOpen(true);
                        }}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.05]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <div className="flex items-center gap-2.5">
                            <ItemThumb category={it.category} size={34} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold leading-tight">{it.name}</p>
                              <p className="text-xs text-muted-foreground">{tt(cat.label)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden py-3 md:table-cell">
                          <span className="tnum text-[12.5px] text-muted-foreground">{it.sku}</span>
                        </td>
                        <td className="hidden py-3 lg:table-cell">
                          <span className="tnum whitespace-nowrap text-[12.5px] text-muted-foreground">{primaryLoc}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <StockLevelBar onHand={it.onHand} reorderPoint={it.reorderPoint} state={st} className="w-24 shrink-0" />
                            <span className="tnum whitespace-nowrap text-[12.5px] font-semibold">
                              {it.onHand}
                              <span className="text-muted-foreground"> {tt(it.unit)}</span>
                            </span>
                            <span className={cn("hidden shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:inline", STOCK_LABEL[st].tone)}>
                              {lang === "tr" ? STOCK_LABEL[st].tr : STOCK_LABEL[st].en}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <p className="tnum font-semibold">{formatUsd(stockValueOf(it))}</p>
                          <p className="tnum text-[11px] text-muted-foreground">{formatUsd(it.unitCost)} {lang === "tr" ? "/birim" : "/unit"}</p>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        {lang === "tr" ? "Eşleşen kalem yok." : "No items match."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock value chart + locations */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            {/* Stock value over time */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[15px] font-semibold tracking-tight">{tt(stockValueMeta.title)}</h3>
                  <p className="text-xs text-muted-foreground">{tt(stockValueMeta.subtitle)}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  {stockValueMeta.delta}
                </span>
              </div>
              <p className="mt-3 tnum text-2xl font-bold leading-none">{formatUsd(summary.totalValue.value)}</p>
              <div className="mt-4">
                <AreaChart data={stockValueTrend.map((v) => v.value)} labels={stockValueTrend.map((v) => v.label)} height={150} />
              </div>
            </div>

            {/* Locations breakdown */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">{tt(locationsMeta.title)}</h3>
              <div className="mt-4 space-y-3.5">
                {locations.map((l) => (
                  <div key={l.id}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <span className="tnum rounded-md bg-muted px-1.5 py-0.5 text-[10.5px] font-semibold text-muted-foreground">{l.code}</span>
                        {tt(l.name)}
                      </span>
                      <span className="tnum text-muted-foreground">{formatUsd(l.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="bar-grow h-full rounded-full" style={{ width: `${(l.value / maxLoc) * 100}%`, background: "var(--grad-brand)" }} />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatNumber(l.units)} {lang === "tr" ? "birim" : "units"} · {l.itemCount} {lang === "tr" ? "kalem" : "items"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Movement log + PO mini-panel */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* Stock-movement log */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-[15px] font-semibold tracking-tight">{tt(movementsMeta.title)}</h3>
                <Link href="/items" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
                  {lang === "tr" ? "Tümü" : "View all"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border/60">
                {movements.slice(0, 7).map((mv) => {
                  const inbound = mv.qty > 0;
                  return (
                    <div key={mv.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                          mv.type === "in" ? "bg-success/12 text-success" : mv.type === "out" ? "bg-destructive/10 text-destructive" : "bg-info/12 text-info",
                        )}
                      >
                        {mv.type === "in" ? <ArrowDownLeft className="h-4 w-4" /> : mv.type === "out" ? <ArrowUpRight className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium leading-tight">{mv.item}</p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">{mv.sku} · {mv.loc} · {tt(mv.note)}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn("tnum text-[13px] font-semibold", inbound ? "text-success" : mv.type === "out" ? "text-foreground" : "text-info")}>
                          {inbound ? "+" : ""}{mv.qty}
                        </p>
                        <p className="text-[10.5px] text-muted-foreground">{formatRelative(mv.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Purchase-order mini-panel */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="font-display text-[15px] font-semibold tracking-tight">{tt(purchaseOrdersMeta.title)}</h3>
                <Link href="/purchase-orders" className="inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline">
                  {lang === "tr" ? "Tümü" : "View all"}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-border/60">
                {draftPOs.slice(0, 5).map((po) => (
                  <div key={po.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="tnum truncate text-[13px] font-semibold leading-tight">{po.number}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {po.supplier} · {po.units} {lang === "tr" ? "birim" : "units"}
                      </p>
                    </div>
                    <span className="tnum text-[13px] font-semibold">{formatUsd(po.total)}</span>
                    <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", PO_LABEL[po.status].tone)}>
                      {lang === "tr" ? PO_LABEL[po.status].tr : PO_LABEL[po.status].en}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3">
                <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <Plus className="h-4 w-4" />
                  {lang === "tr" ? "Yeni sipariş" : "New purchase order"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right detail drawer ──────────────────────────────────── */}
        {drawerOpen && sel && (
          <ItemDrawer
            item={sel}
            adjusted={selAdjusted}
            onAdjust={(d) => setAdjust((a) => ({ ...a, [sel.id]: (a[sel.id] ?? 0) + d }))}
            onReset={() => setAdjust((a) => ({ ...a, [sel.id]: 0 }))}
            onClose={() => setDrawerOpen(false)}
            lang={lang}
            tt={tt}
          />
        )}
      </div>
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  sub,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  delta?: number;
  tone: "primary" | "info" | "warning" | "destructive";
}) {
  const toneCls = {
    primary: "bg-primary/12 text-primary",
    info: "bg-info/12 text-info",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneCls)}>{icon}</span>
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-success" : "text-destructive")}>
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-3 tnum text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground/80">{sub}</p>
    </div>
  );
}

function CatPill({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
      {label}
    </button>
  );
}

/* ── Item detail drawer ────────────────────────────────────────────────────── */
function ItemDrawer({
  item,
  adjusted,
  onAdjust,
  onReset,
  onClose,
  lang,
  tt,
}: {
  item: Item;
  adjusted: number;
  onAdjust: (d: number) => void;
  onReset: () => void;
  onClose: () => void;
  lang: "tr" | "en";
  tt: (v: { tr: string; en: string }) => string;
}) {
  const cat = categoryByKey(item.category);
  const stAdj = adjusted <= 0 ? "out" : adjusted <= item.reorderPoint ? "low" : "in";
  const dirty = adjusted !== item.onHand;
  const margin = item.unitPrice > 0 ? Math.round(((item.unitPrice - item.unitCost) / item.unitPrice) * 100) : 0;
  const diff = adjusted - item.onHand;

  return (
    <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            {lang === "tr" ? "Kalem detayı" : "Item details"}
          </h2>
          <button
            onClick={onClose}
            aria-label={lang === "tr" ? "Kapat" : "Close"}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item header */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <ItemThumb category={item.category} size={44} />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{item.name}</p>
            <p className="tnum truncate text-xs text-muted-foreground">{item.sku} · {tt(cat.label)}</p>
          </div>
        </div>

        {/* On-hand + adjust stock */}
        <div className="rounded-xl border border-border p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{lang === "tr" ? "Eldeki miktar" : "On hand"}</p>
            <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_LABEL[stAdj].tone)}>
              {lang === "tr" ? STOCK_LABEL[stAdj].tr : STOCK_LABEL[stAdj].en}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => onAdjust(-1)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
              aria-label={lang === "tr" ? "Azalt" : "Decrease"}
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center">
              <p className="tnum text-3xl font-bold leading-none">{adjusted}</p>
              <p className="text-[11px] text-muted-foreground">
                {lang === "tr" ? "yeniden sipariş" : "reorder at"} {item.reorderPoint} {tt(item.unit)}
              </p>
            </div>
            <button
              onClick={() => onAdjust(+1)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
              aria-label={lang === "tr" ? "Artır" : "Increase"}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <StockLevelBar onHand={adjusted} reorderPoint={item.reorderPoint} state={stAdj} />
          </div>
          {dirty && (
            <div className="mt-3 flex items-center gap-2">
              <button className="flex-1 rounded-lg bg-primary py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                {lang === "tr" ? `Düzeltmeyi kaydet (${diff > 0 ? "+" : ""}${diff})` : `Save adjustment (${diff > 0 ? "+" : ""}${diff})`}
              </button>
              <button onClick={onReset} className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted">
                {lang === "tr" ? "Geri al" : "Reset"}
              </button>
            </div>
          )}
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3">
          <Fact label={lang === "tr" ? "Birim maliyet" : "Unit cost"} value={formatUsd(item.unitCost)} />
          <Fact label={lang === "tr" ? "Satış fiyatı" : "Sell price"} value={formatUsd(item.unitPrice)} />
          <Fact label={lang === "tr" ? "Stok değeri" : "Stock value"} value={formatUsd(adjusted * item.unitCost)} />
          <Fact label={lang === "tr" ? "Kâr marjı" : "Margin"} value={`${margin}%`} />
        </div>

        {/* Stock history */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Stok geçmişi (10 hafta)" : "Stock history (10 weeks)"}</p>
          <HistoryBars history={item.history} reorderPoint={item.reorderPoint} />
        </div>

        {/* Locations */}
        <div>
          <p className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Konumlar" : "Locations"}</p>
          <div className="mt-2 space-y-1.5">
            {item.locations.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-3 py-2 text-center text-[12px] text-muted-foreground">
                {lang === "tr" ? "Hiçbir konumda stok yok" : "No stock in any location"}
              </p>
            )}
            {item.locations.map((l) => (
              <div key={l.loc} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[13px]">
                <span className="tnum text-muted-foreground">{l.loc}</span>
                <span className="tnum font-semibold">{l.qty} {tt(item.unit)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Barcode + QR */}
        <div className="rounded-xl border border-border p-3.5">
          <p className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Etiket" : "Label"}</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1">
              <Barcode value={item.barcode} height={48} />
            </div>
            <div className="shrink-0 rounded-lg border border-border p-1.5">
              <QrCode value={item.sku} size={72} />
            </div>
          </div>
          <button className="mt-3 w-full rounded-lg border border-border py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-muted">
            {lang === "tr" ? "Etiket yazdır" : "Print label"}
          </button>
        </div>
      </div>
    </aside>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 tnum text-[15px] font-bold leading-none">{value}</p>
    </div>
  );
}

/* Tiny inline-SVG bar history with a reorder-line. */
function HistoryBars({ history, reorderPoint }: { history: { date: string; qty: number }[]; reorderPoint: number }) {
  const max = Math.max(...history.map((h) => h.qty), reorderPoint, 1);
  return (
    <div className="mt-2 flex h-16 items-end gap-1">
      {history.map((h, i) => {
        const pct = (h.qty / max) * 100;
        const below = h.qty <= reorderPoint;
        return (
          <div key={h.date + i} className="flex flex-1 items-end" title={`${h.date}: ${h.qty}`} style={{ height: "100%" }}>
            <div
              className="w-full rounded-sm"
              style={{
                height: `${Math.max(pct, 4)}%`,
                background: below ? "var(--color-stock-low)" : "color-mix(in oklch, var(--color-primary) 70%, white)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
