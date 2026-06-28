"use client";

import { useState } from "react";
import { Minus, Plus, TriangleAlert, Check, RotateCcw, PackageX } from "lucide-react";
import { ItemThumb } from "@/components/app/item-thumb";
import { StockLevelBar } from "@/components/app/charts";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd } from "@/lib/utils";

/**
 * Interactive landing demo: adjust an item's quantity with +/- and watch the
 * stock bar move. When on-hand drops to/below the reorder point, a low-stock
 * alert fires and the "create PO" action appears; at zero it goes out of stock.
 * Pure useState, no deps.
 */
const REORDER = 15;
const UNIT_COST = 58;
const REORDER_QTY = 40;

export function InventoryDemo() {
  const { lang } = useLang();
  const [qty, setQty] = useState(22);

  const state = qty <= 0 ? "out" : qty <= REORDER ? "low" : "in";
  const alert = state !== "in";

  const set = (n: number) => setQty(Math.max(0, Math.min(99, n)));

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-pop sm:p-6">
      <div className="flex items-center gap-3">
        <ItemThumb category="tools" size={44} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">18V Cordless Drill</p>
          <p className="tnum text-xs text-muted-foreground">TLS-DRL-18V · WH-A · A3</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            state === "in" ? "bg-success/10 text-success" : state === "low" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive",
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: state === "in" ? "var(--color-stock-in)" : state === "low" ? "var(--color-stock-low)" : "var(--color-stock-out)" }} />
          {state === "in" ? (lang === "tr" ? "stokta" : "in stock") : state === "low" ? (lang === "tr" ? "düşük" : "low") : (lang === "tr" ? "tükendi" : "out")}
        </span>
      </div>

      {/* Adjust control */}
      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => set(qty - 1)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-foreground shadow-pill transition-colors hover:bg-muted"
            aria-label={lang === "tr" ? "Azalt" : "Decrease"}
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="min-w-[110px] text-center">
            <p className="tnum text-5xl font-bold leading-none">{qty}</p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {lang === "tr" ? "eldeki adet" : "units on hand"}
            </p>
          </div>
          <button
            onClick={() => set(qty + 1)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-card text-foreground shadow-pill transition-colors hover:bg-muted"
            aria-label={lang === "tr" ? "Artır" : "Increase"}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <StockLevelBar onHand={qty} reorderPoint={REORDER} state={state} />
          <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{lang === "tr" ? "0" : "0"}</span>
            <span className="tnum">{lang === "tr" ? `sipariş noktası ${REORDER}` : `reorder at ${REORDER}`}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[12px]">
          <span className="text-muted-foreground">{lang === "tr" ? "Stok değeri" : "Stock value"}</span>
          <span className="tnum font-semibold">{formatUsd(qty * UNIT_COST)}</span>
        </div>
      </div>

      {/* Alert area (fires when below reorder point) */}
      <div className="mt-4 min-h-[64px]">
        {alert ? (
          <div
            className={cn(
              "animate-float-up flex items-center gap-3 rounded-xl border p-3",
              state === "out" ? "border-destructive/40 bg-destructive/[0.06]" : "border-warning/40 bg-warning/[0.08]",
            )}
          >
            <span
              className={cn(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                state === "out" ? "bg-destructive/15 text-destructive" : "bg-warning/20 text-warning-foreground",
              )}
            >
              {state === "out" ? <PackageX className="h-4.5 w-4.5" /> : <TriangleAlert className="h-4.5 w-4.5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight">
                {state === "out"
                  ? lang === "tr" ? "Tükendi — şimdi sipariş ver" : "Out of stock — reorder now"
                  : lang === "tr" ? "Düşük stok uyarısı tetiklendi" : "Low-stock alert fired"}
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                {lang === "tr"
                  ? `Sipariş noktasının altında. Önerilen: +${REORDER_QTY} adet.`
                  : `Below reorder point. Suggested: +${REORDER_QTY} units.`}
              </p>
            </div>
            <button className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              {lang === "tr" ? "Sipariş" : "Reorder"}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/[0.05] p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success/12 text-success">
              <Check className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-tight">
                {lang === "tr" ? "Sağlıklı stok seviyesi" : "Healthy stock level"}
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                {lang === "tr" ? "Sipariş noktasının üzerinde — şimdilik sorun yok." : "Above the reorder point — nothing to do."}
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => set(22)}
        className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {lang === "tr" ? "Sıfırla" : "Reset demo"}
      </button>
    </div>
  );
}
