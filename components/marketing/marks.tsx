"use client";

import { ItemThumb } from "@/components/app/item-thumb";
import { StockLevelBar } from "@/components/app/charts";
import { useLang } from "@/components/i18n/language-provider";
import { formatUsd, cn } from "@/lib/utils";

/* ── Inline-SVG fake-company wordmarks for the trusted-by row ───────────────── */
export function CompanyMark({ name }: { name: string }) {
  const glyphs: Record<string, React.ReactNode> = {
    Hearthside: <path d="M4 12 L12 4 L20 12 M7 11 V19 H17 V11" />,
    Forge: <path d="M5 18 L12 4 L19 18 M9 13 H15" />,
    Bramble: <circle cx="12" cy="12" r="7" />,
    Tideline: <path d="M4 14 q4 -5 8 0 t8 0 M4 9 q4 -5 8 0 t8 0" />,
    Cobbler: <path d="M5 6 h10 a4 4 0 0 1 0 8 H5 z M5 14 v4" />,
    Maple: <path d="M12 3 c4 4 4 10 0 14 c-4 -4 -4 -10 0 -14 z M12 17 v4" />,
    Anvil: <path d="M4 8 h10 a4 4 0 0 1 4 4 h2 M9 8 v8 M5 18 h12" />,
    Ridgeway: <path d="M3 18 L9 7 L13 14 L16 9 L21 18" />,
  };
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground/70">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {glyphs[name]}
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">{name}</span>
    </span>
  );
}

/* ── Hero product-preview: a mini inventory dashboard ──────────────────────── */
export function ProductPreview() {
  const { lang } = useLang();
  const rows = [
    { name: "18V Cordless Drill", cat: "tools", sku: "TLS-DRL-18V", onHand: 42, rp: 15, state: "in" as const, value: 2436 },
    { name: "M8 Hex Bolt (box 100)", cat: "fasteners", sku: "FAS-HEX-M8-100", onHand: 8, rp: 20, state: "low" as const, value: 33.6 },
    { name: "Nitrile Gloves · M", cat: "safety", sku: "SAF-GLV-NIT-M", onHand: 0, rp: 12, state: "out" as const, value: 0 },
  ];

  return (
    <div className="w-full rounded-2xl border border-border bg-card p-4 shadow-pop sm:p-5">
      {/* mini stat row */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl border border-border bg-muted/40 p-2.5">
          <p className="text-[10px] font-medium text-muted-foreground">{lang === "tr" ? "Kalem" : "Items"}</p>
          <p className="mt-1 tnum text-base font-bold leading-none">12</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-2.5">
          <p className="text-[10px] font-medium text-muted-foreground">{lang === "tr" ? "Değer" : "Value"}</p>
          <p className="mt-1 tnum text-base font-bold leading-none">$10.4k</p>
        </div>
        <div className="rounded-xl border border-warning/40 bg-warning/[0.08] p-2.5">
          <p className="text-[10px] font-medium text-warning-foreground">{lang === "tr" ? "Düşük" : "Low"}</p>
          <p className="mt-1 tnum text-base font-bold leading-none text-warning-foreground">4</p>
        </div>
      </div>

      {/* mini table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <div className="grid grid-cols-[1.6fr_1fr_auto] gap-2 border-b border-border bg-muted/40 px-3 py-2 label-mono text-muted-foreground">
          <span>{lang === "tr" ? "Kalem" : "Item"}</span>
          <span>{lang === "tr" ? "Stok" : "Stock"}</span>
          <span className="text-right">{lang === "tr" ? "Değer" : "Value"}</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={r.sku}
            className={cn(
              "grid grid-cols-[1.6fr_1fr_auto] items-center gap-2 px-3 py-2.5",
              i === 0 && "bg-primary/[0.04]",
              i < rows.length - 1 && "border-b border-border/60",
            )}
          >
            <div className="flex items-center gap-2">
              <ItemThumb category={r.cat} size={26} />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold leading-tight">{r.name}</p>
                <p className="tnum truncate text-[9.5px] text-muted-foreground">{r.sku}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <StockLevelBar onHand={r.onHand} reorderPoint={r.rp} state={r.state} className="w-10 shrink-0" />
              <span className="tnum text-[11px] font-semibold">{r.onHand}</span>
            </div>
            <p className="tnum text-right text-[11.5px] font-semibold">{formatUsd(r.value)}</p>
          </div>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
        {lang === "tr" ? "Sipariş oluştur" : "Create purchase order"}
        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">4</span>
      </button>
    </div>
  );
}
