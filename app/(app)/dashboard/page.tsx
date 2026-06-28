"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  Loader2,
  Package,
} from "lucide-react";
import { ItemThumb } from "@/components/app/item-thumb";
import { Barcode, QrCode } from "@/components/app/barcode";
import { StockLevelBar } from "@/components/app/charts";
import { AddItemModal } from "@/components/app/add-item-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatUsdCompact, formatNumber } from "@/lib/utils";
import { CATEGORIES, categoryByKey } from "@/lib/categories";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type DbItem = {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  on_hand: number;
  allocated: number;
  incoming: number;
  reorder_point: number;
  cost: number;
  price: number;
  barcode: string | null;
};

type DbMovement = {
  id: string;
  type: "in" | "out" | "adjust";
  qty: number;
  note: string | null;
  created_at: string;
  items: { name: string; sku: string } | null;
};

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function stockState(item: DbItem): "in" | "low" | "out" {
  if (item.on_hand === 0) return "out";
  if (item.on_hand <= item.reorder_point) return "low";
  return "in";
}

const STOCK_LABEL = {
  in:  { tr: "Stokta",  en: "In stock", tone: "bg-success/15 text-success" },
  low: { tr: "Düşük",   en: "Low",      tone: "bg-warning/15 text-warning-foreground" },
  out: { tr: "Tükendi", en: "Out",      tone: "bg-destructive/15 text-destructive" },
};

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { lang } = useLang();

  const [items, setItems] = useState<DbItem[]>([]);
  const [movements, setMovements] = useState<DbMovement[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adjust, setAdjust] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [lowOnly, setLowOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  /* fetch */
  const fetchAll = useCallback(async () => {
    const [ir, mr] = await Promise.all([fetch("/api/items"), fetch("/api/movements")]);
    if (ir.ok) setItems(await ir.json());
    if (mr.ok) setMovements(await mr.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* derived stats */
  const totalUnits = useMemo(() => items.reduce((s, i) => s + i.on_hand, 0), [items]);
  const totalValue = useMemo(() => items.reduce((s, i) => s + i.on_hand * i.price, 0), [items]);
  const lowItems  = useMemo(() => items.filter((i) => i.on_hand > 0 && i.on_hand <= i.reorder_point), [items]);
  const outItems  = useMemo(() => items.filter((i) => i.on_hand === 0), [items]);

  const rows = useMemo(
    () =>
      items.filter((it) => {
        if (category !== "all" && it.category !== category) return false;
        if (lowOnly && stockState(it) === "in") return false;
        if (query) {
          const q = query.toLowerCase();
          if (!it.name.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [items, category, lowOnly, query],
  );

  const sel = items.find((i) => i.id === selected) ?? null;
  const selAdjusted = sel ? Math.max(0, sel.on_hand + (adjust[sel.id] ?? 0)) : 0;

  /* save stock adjustment */
  async function saveAdjustment() {
    if (!sel) return;
    const delta = adjust[sel.id] ?? 0;
    if (delta === 0) return;
    setSaving(true);
    await fetch(`/api/items/${sel.id}/stock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    });
    setAdjust((a) => ({ ...a, [sel.id]: 0 }));
    setSaving(false);
    fetchAll();
  }

  return (
    <div className="mx-auto max-w-[1500px] animate-fade-in">
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchAll(); }}
        />
      )}

      <div className={cn("grid gap-6", drawerOpen && sel ? "xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        {/* ── Main column ─────────────────────────────────────────── */}
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
            <div className="ml-auto">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {lang === "tr" ? "Kalem ekle" : "Add item"}
              </button>
            </div>
          </div>

          {/* Stat row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Boxes className="h-4 w-4" />}
              label={lang === "tr" ? "Toplam kalem" : "Total items"}
              value={formatNumber(items.length)}
              sub={`${formatNumber(totalUnits)} ${lang === "tr" ? "birim" : "units"}`}
              tone="primary"
            />
            <StatCard
              icon={<CircleDollarSign className="h-4 w-4" />}
              label={lang === "tr" ? "Stok değeri" : "Stock value"}
              value={formatUsdCompact(totalValue)}
              sub={lang === "tr" ? "Maliyet bazında" : "At cost price"}
              tone="info"
            />
            <StatCard
              icon={<TriangleAlert className="h-4 w-4" />}
              label={lang === "tr" ? "Düşük stok" : "Low stock"}
              value={formatNumber(lowItems.length)}
              sub={lang === "tr" ? "Sipariş noktasının altında" : "Below reorder point"}
              tone="warning"
            />
            <StatCard
              icon={<PackageX className="h-4 w-4" />}
              label={lang === "tr" ? "Tükendi" : "Out of stock"}
              value={formatNumber(outItems.length)}
              sub={lang === "tr" ? "Stok kalmadı" : "No units remaining"}
              tone="destructive"
            />
          </div>

          {/* Low-stock alert panel */}
          {!loading && lowItems.length > 0 && (
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
              </div>
              <div className="divide-y divide-warning/20">
                {lowItems.map((it) => {
                  const st = stockState(it);
                  return (
                    <button
                      key={it.id}
                      onClick={() => { setSelected(it.id); setDrawerOpen(true); }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-warning/[0.04]"
                    >
                      <ItemThumb category={it.category ?? "tools"} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">{it.name}</p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">{it.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[13px] font-semibold">
                          {it.on_hand} / {it.reorder_point}
                        </p>
                        <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_LABEL[st].tone)}>
                          {STOCK_LABEL[st][lang]}
                        </span>
                      </div>
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
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {rows.length}
              </span>
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
              {CATEGORIES.map((c) => (
                <CatPill
                  key={c.key}
                  active={category === c.key}
                  onClick={() => setCategory(c.key)}
                  label={c.label[lang]}
                  color={c.color}
                />
              ))}
            </div>

            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="font-semibold">{lang === "tr" ? "Henüz kalem yok" : "No items yet"}</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "tr" ? "Kalem ekle" : "Add item"}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Kalem" : "Item"}</th>
                      <th className="label-mono hidden py-2.5 font-medium text-muted-foreground md:table-cell">SKU</th>
                      <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Stok seviyesi" : "Stock level"}</th>
                      <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Değer" : "Value"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((it) => {
                      const isSel = it.id === selected;
                      const st = stockState(it);
                      const cat = categoryByKey(it.category);
                      return (
                        <tr
                          key={it.id}
                          onClick={() => { setSelected(it.id); setDrawerOpen(true); }}
                          className={cn(
                            "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                            isSel ? "bg-primary/[0.05]" : "hover:bg-muted/50",
                          )}
                        >
                          <td className="py-3 pl-4">
                            <div className="flex items-center gap-2.5">
                              <ItemThumb category={it.category ?? "tools"} size={34} />
                              <div className="min-w-0">
                                <p className="truncate font-semibold leading-tight">{it.name}</p>
                                <p className="text-xs text-muted-foreground">{cat?.label[lang] ?? "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden py-3 md:table-cell">
                            <span className="tnum text-[12.5px] text-muted-foreground">{it.sku}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <StockLevelBar onHand={it.on_hand} reorderPoint={it.reorder_point} state={st} className="w-24 shrink-0" />
                              <span className="tnum whitespace-nowrap text-[12.5px] font-semibold">
                                {it.on_hand}
                                <span className="text-muted-foreground"> {lang === "tr" ? "adet" : "units"}</span>
                              </span>
                              <span className={cn("hidden shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:inline", STOCK_LABEL[st].tone)}>
                                {STOCK_LABEL[st][lang]}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-right">
                            <p className="tnum font-semibold">{formatUsd(it.on_hand * it.price)}</p>
                            <p className="tnum text-[11px] text-muted-foreground">{formatUsd(it.cost)} {lang === "tr" ? "/birim" : "/unit"}</p>
                          </td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                          {lang === "tr" ? "Eşleşen kalem yok." : "No items match."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Stock movement log */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="flex items-center border-b border-border p-4">
              <h3 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Stok hareketleri" : "Stock movements"}
              </h3>
            </div>
            {movements.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Henüz hareket yok. Stok düzeltmeleri burada görünür."
                  : "No movements yet. Stock adjustments will appear here."}
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {movements.slice(0, 8).map((mv) => (
                  <div key={mv.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        mv.type === "in"
                          ? "bg-success/12 text-success"
                          : mv.type === "out"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-info/12 text-info",
                      )}
                    >
                      {mv.type === "in" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : mv.type === "out" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <Settings2 className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-tight">{mv.items?.name ?? "—"}</p>
                      <p className="tnum truncate text-[11px] text-muted-foreground">
                        {mv.items?.sku}{mv.note ? ` · ${mv.note}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "tnum text-[13px] font-semibold",
                          mv.type === "in" ? "text-success" : mv.type === "out" ? "text-foreground" : "text-info",
                        )}
                      >
                        {mv.type === "in" ? "+" : mv.type === "out" ? "−" : ""}{mv.qty}
                      </p>
                      <p className="text-[10.5px] text-muted-foreground">
                        {new Date(mv.created_at).toLocaleDateString(
                          lang === "tr" ? "tr-TR" : "en-US",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right detail drawer ──────────────────────────────────── */}
        {drawerOpen && sel && (
          <ItemDrawer
            item={sel}
            adjusted={selAdjusted}
            saving={saving}
            onAdjust={(d) => setAdjust((a) => ({ ...a, [sel.id]: (a[sel.id] ?? 0) + d }))}
            onReset={() => setAdjust((a) => ({ ...a, [sel.id]: 0 }))}
            onSave={saveAdjustment}
            onClose={() => { setDrawerOpen(false); setSelected(null); }}
            lang={lang}
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
    primary:     "bg-primary/12 text-primary",
    info:        "bg-info/12 text-info",
    warning:     "bg-warning/15 text-warning-foreground",
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

/* ── Category pill ──────────────────────────────────────────────────────────── */

function CatPill({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />}
      {label}
    </button>
  );
}

/* ── Item detail drawer ────────────────────────────────────────────────────── */

function ItemDrawer({
  item,
  adjusted,
  saving,
  onAdjust,
  onReset,
  onSave,
  onClose,
  lang,
}: {
  item: DbItem;
  adjusted: number;
  saving: boolean;
  onAdjust: (d: number) => void;
  onReset: () => void;
  onSave: () => void;
  onClose: () => void;
  lang: "tr" | "en";
}) {
  const cat = categoryByKey(item.category);
  const st: "in" | "low" | "out" = adjusted <= 0 ? "out" : adjusted <= item.reorder_point ? "low" : "in";
  const dirty = adjusted !== item.on_hand;
  const diff = adjusted - item.on_hand;
  const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : 0;

  return (
    <aside className="animate-float-up xl:sticky xl:top-2 xl:self-start">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">
            {lang === "tr" ? "Kalem detayı" : "Item details"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item header */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <ItemThumb category={item.category ?? "tools"} size={44} />
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{item.name}</p>
            <p className="tnum truncate text-xs text-muted-foreground">
              {item.sku}{cat ? ` · ${cat.label[lang]}` : ""}
            </p>
          </div>
        </div>

        {/* On-hand + adjust stock */}
        <div className="rounded-xl border border-border p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{lang === "tr" ? "Eldeki miktar" : "On hand"}</p>
            <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_LABEL[st].tone)}>
              {STOCK_LABEL[st][lang]}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => onAdjust(-1)}
              disabled={saving}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex-1 text-center">
              <p className="tnum text-3xl font-bold leading-none">{adjusted}</p>
              <p className="text-[11px] text-muted-foreground">
                {lang === "tr" ? "yeniden sipariş" : "reorder at"} {item.reorder_point} {lang === "tr" ? "adet" : "units"}
              </p>
            </div>
            <button
              onClick={() => onAdjust(+1)}
              disabled={saving}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3">
            <StockLevelBar onHand={adjusted} reorderPoint={item.reorder_point} state={st} />
          </div>
          {dirty && (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={onSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {lang === "tr"
                  ? `Kaydet (${diff > 0 ? "+" : ""}${diff})`
                  : `Save (${diff > 0 ? "+" : ""}${diff})`}
              </button>
              <button
                onClick={onReset}
                disabled={saving}
                className="rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
              >
                {lang === "tr" ? "Geri al" : "Reset"}
              </button>
            </div>
          )}
        </div>

        {/* Quick facts */}
        <div className="grid grid-cols-2 gap-3">
          <Fact label={lang === "tr" ? "Birim maliyet" : "Unit cost"} value={formatUsd(item.cost)} />
          <Fact label={lang === "tr" ? "Satış fiyatı" : "Sell price"} value={formatUsd(item.price)} />
          <Fact label={lang === "tr" ? "Stok değeri" : "Stock value"} value={formatUsd(adjusted * item.price)} />
          <Fact label={lang === "tr" ? "Kâr marjı" : "Margin"} value={`${margin}%`} />
        </div>

        {/* Barcode + QR */}
        <div className="rounded-xl border border-border p-3.5">
          <p className="text-xs font-medium text-muted-foreground">{lang === "tr" ? "Etiket" : "Label"}</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1">
              <Barcode value={item.barcode ?? item.sku} height={48} />
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
