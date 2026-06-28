"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Download, LayoutGrid, Rows3, TriangleAlert } from "lucide-react";
import { ItemThumb } from "@/components/app/item-thumb";
import { StockLevelBar } from "@/components/app/charts";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber } from "@/lib/utils";
import {
  items,
  categories,
  categoryByKey,
  stockStateOf,
  stockValueOf,
  STOCK_LABEL,
} from "@/lib/demo/data";

export default function ItemsPage() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [view, setView] = useState<"grid" | "table">("grid");
  const tt = (v: { tr: string; en: string }) => v[lang];

  const rows = useMemo(
    () =>
      items.filter((it) => {
        if (category !== "all" && it.category !== category) return false;
        if (query) {
          const q = query.toLowerCase();
          if (!it.name.toLowerCase().includes(q) && !it.sku.toLowerCase().includes(q)) return false;
        }
        return true;
      }),
    [category, query],
  );

  const totalValue = rows.reduce((s, i) => s + stockValueOf(i), 0);
  const totalUnits = rows.reduce((s, i) => s + i.onHand, 0);

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Kalemler" : "Items"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatNumber(rows.length)} {lang === "tr" ? "kalem" : "items"} · {formatNumber(totalUnits)} {lang === "tr" ? "birim" : "units"} · {formatUsd(totalValue)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-pill transition-colors hover:bg-muted">
            <Download className="h-4 w-4 text-muted-foreground" />
            {lang === "tr" ? "CSV içe aktar" : "Import CSV"}
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Kalem ekle" : "Add item"}
          </button>
        </div>
      </div>

      {/* Toolbar */}
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
        <div className="flex flex-wrap gap-1.5">
          <CatPill active={category === "all"} onClick={() => setCategory("all")} label={lang === "tr" ? "Tümü" : "All"} />
          {categories.map((c) => (
            <CatPill key={c.key} active={category === c.key} onClick={() => setCategory(c.key)} label={tt(c.label)} color={c.color} />
          ))}
        </div>
        <div className="ml-auto inline-flex items-center rounded-lg border border-border p-0.5">
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("table")}
            aria-label="Table view"
            className={cn("grid h-7 w-7 place-items-center rounded-md transition-colors", view === "table" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <Rows3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((it) => {
            const st = stockStateOf(it);
            const cat = categoryByKey(it.category);
            return (
              <Link
                key={it.id}
                href="/dashboard"
                className="group rounded-2xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-pop"
              >
                <div className="flex items-start justify-between">
                  <ItemThumb category={it.category} size={48} />
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", STOCK_LABEL[st].tone)}>
                    {st === "low" || st === "out" ? <TriangleAlert className="h-2.5 w-2.5" /> : null}
                    {lang === "tr" ? STOCK_LABEL[st].tr : STOCK_LABEL[st].en}
                  </span>
                </div>
                <h3 className="mt-3 truncate font-semibold leading-tight">{it.name}</h3>
                <p className="tnum truncate text-[12px] text-muted-foreground">{it.sku} · {tt(cat.label)}</p>
                <div className="mt-3">
                  <StockLevelBar onHand={it.onHand} reorderPoint={it.reorderPoint} state={st} />
                  <div className="mt-1.5 flex items-center justify-between text-[12px]">
                    <span className="tnum font-semibold">{it.onHand} {tt(it.unit)}</span>
                    <span className="tnum text-muted-foreground">{formatUsd(stockValueOf(it))}</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {rows.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">{lang === "tr" ? "Eşleşen kalem yok." : "No items match."}</p>
          )}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Kalem" : "Item"}</th>
                  <th className="label-mono hidden py-2.5 font-medium text-muted-foreground md:table-cell">SKU</th>
                  <th className="label-mono hidden py-2.5 font-medium text-muted-foreground lg:table-cell">{lang === "tr" ? "Tedarikçi" : "Supplier"}</th>
                  <th className="label-mono py-2.5 font-medium text-muted-foreground">{lang === "tr" ? "Stok" : "Stock"}</th>
                  <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Değer" : "Value"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((it) => {
                  const st = stockStateOf(it);
                  const cat = categoryByKey(it.category);
                  return (
                    <tr key={it.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <ItemThumb category={it.category} size={32} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold leading-tight">{it.name}</p>
                            <p className="text-xs text-muted-foreground">{tt(cat.label)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-3 md:table-cell"><span className="tnum text-[12.5px] text-muted-foreground">{it.sku}</span></td>
                      <td className="hidden py-3 lg:table-cell"><span className="text-[12.5px] text-muted-foreground">{it.supplier}</span></td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <StockLevelBar onHand={it.onHand} reorderPoint={it.reorderPoint} state={st} className="w-20 shrink-0" />
                          <span className="tnum text-[12.5px] font-semibold">{it.onHand}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-right tnum font-semibold">{formatUsd(stockValueOf(it))}</td>
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

function CatPill({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color?: string }) {
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
