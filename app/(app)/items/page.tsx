"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, LayoutGrid, Rows3, TriangleAlert, Package } from "lucide-react";
import { ItemThumb } from "@/components/app/item-thumb";
import { StockLevelBar } from "@/components/app/charts";
import { AddItemModal } from "@/components/app/add-item-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber } from "@/lib/utils";

type DbItem = {
  id: string;
  sku: string;
  name: string;
  on_hand: number;
  allocated: number;
  incoming: number;
  reorder_point: number;
  cost: number;
  price: number;
  created_at: string;
};

function stockState(item: DbItem): "in" | "low" | "out" {
  if (item.on_hand === 0) return "out";
  if (item.on_hand <= item.reorder_point) return "low";
  return "in";
}

const STOCK_BADGE = {
  in: { tr: "Stokta", en: "In stock", tone: "bg-success/15 text-success" },
  low: { tr: "Düşük", en: "Low", tone: "bg-warning/15 text-warning-foreground" },
  out: { tr: "Tükendi", en: "Out", tone: "bg-destructive/15 text-destructive" },
};

export default function ItemsPage() {
  const { lang } = useLang();
  const [items, setItems] = useState<DbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "table">("grid");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/items");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const rows = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q),
    );
  }, [items, query]);

  const totalValue = rows.reduce((s, i) => s + i.on_hand * i.price, 0);
  const totalUnits = rows.reduce((s, i) => s + i.on_hand, 0);

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {showModal && (
        <AddItemModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); fetchItems(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {lang === "tr" ? "Kalemler" : "Items"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading
              ? (lang === "tr" ? "Yükleniyor…" : "Loading…")
              : `${formatNumber(rows.length)} ${lang === "tr" ? "kalem" : "items"} · ${formatNumber(totalUnits)} ${lang === "tr" ? "birim" : "units"} · ${formatUsd(totalValue)}`}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Kalem ekle" : "Add item"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {items.length > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm sm:max-w-xs">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === "tr" ? "İsim ya da SKU…" : "Name or SKU…"}
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </div>
          <div className="ml-auto inline-flex items-center rounded-lg border border-border p-0.5">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid"
              className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("table")}
              aria-label="Table"
              className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-display text-lg font-semibold">
            {lang === "tr" ? "Henüz kalem yok" : "No items yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "tr"
              ? "İlk ürününü ekleyerek stok takibine başla."
              : "Add your first item to start tracking inventory."}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "İlk kalemi ekle" : "Add first item"}
          </button>
        </div>
      )}

      {/* No search results */}
      {!loading && items.length > 0 && rows.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {lang === "tr" ? "Eşleşen kalem yok." : "No items match."}
        </p>
      )}

      {/* Grid view */}
      {view === "grid" && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((it) => {
            const st = stockState(it);
            return (
              <div
                key={it.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-pop"
              >
                <div className="flex items-start justify-between">
                  <ItemThumb category="tools" size={48} />
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_BADGE[st].tone)}>
                    {(st === "low" || st === "out") && <TriangleAlert className="h-2.5 w-2.5" />}
                    {STOCK_BADGE[st][lang]}
                  </span>
                </div>
                <h3 className="mt-3 truncate font-semibold leading-tight">{it.name}</h3>
                <p className="tnum truncate text-[12px] text-muted-foreground">{it.sku}</p>
                <div className="mt-3">
                  <StockLevelBar onHand={it.on_hand} reorderPoint={it.reorder_point} state={st} />
                  <div className="mt-1.5 flex items-center justify-between text-[12px]">
                    <span className="tnum font-semibold">
                      {it.on_hand} {lang === "tr" ? "adet" : "units"}
                    </span>
                    <span className="tnum text-muted-foreground">{formatUsd(it.on_hand * it.price)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table view */}
      {view === "table" && rows.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">
                    {lang === "tr" ? "Kalem" : "Item"}
                  </th>
                  <th className="label-mono hidden py-2.5 font-medium text-muted-foreground md:table-cell">SKU</th>
                  <th className="label-mono py-2.5 font-medium text-muted-foreground">
                    {lang === "tr" ? "Stok" : "Stock"}
                  </th>
                  <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">
                    {lang === "tr" ? "Değer" : "Value"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((it) => {
                  const st = stockState(it);
                  return (
                    <tr key={it.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <ItemThumb category="tools" size={32} />
                          <p className="truncate font-semibold leading-tight">{it.name}</p>
                        </div>
                      </td>
                      <td className="hidden py-3 md:table-cell">
                        <span className="tnum text-[12.5px] text-muted-foreground">{it.sku}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <StockLevelBar onHand={it.on_hand} reorderPoint={it.reorder_point} state={st} className="w-20 shrink-0" />
                          <span className="tnum text-[12.5px] font-semibold">{it.on_hand}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right tnum font-semibold">
                        {formatUsd(it.on_hand * it.price)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
