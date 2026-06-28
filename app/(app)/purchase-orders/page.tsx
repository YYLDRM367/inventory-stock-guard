"use client";

import { useMemo, useState } from "react";
import { Plus, Truck, Clock, CheckCircle2 } from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber, formatDate } from "@/lib/utils";
import { purchaseOrders, suppliers, PO_LABEL, type PurchaseOrder } from "@/lib/demo/data";

const FILTERS = ["all", "draft", "sent", "partial", "received"] as const;
type Filter = (typeof FILTERS)[number];

export default function PurchaseOrdersPage() {
  const { lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(
    () => purchaseOrders.filter((p) => filter === "all" || p.status === filter),
    [filter],
  );

  const open = purchaseOrders.filter((p) => p.status !== "received");
  const openValue = open.reduce((s, p) => s + p.total, 0);
  const onOrderUnits = open.reduce((s, p) => s + p.units, 0);

  const filterLabel: Record<Filter, { tr: string; en: string }> = {
    all: { tr: "Tümü", en: "All" },
    draft: { tr: "Taslak", en: "Draft" },
    sent: { tr: "Gönderildi", en: "Sent" },
    partial: { tr: "Kısmi", en: "Partial" },
    received: { tr: "Teslim alındı", en: "Received" },
  };

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Satın alma siparişleri" : "Purchase orders"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr" ? "Tedarikçilerden stok yenile ve teslim al." : "Reorder and receive stock from your suppliers."}
          </p>
        </div>
        <button className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
          <Plus className="h-4 w-4" />
          {lang === "tr" ? "Yeni sipariş" : "New PO"}
        </button>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Clock className="h-4 w-4" />} tone="warning" label={lang === "tr" ? "Açık sipariş" : "Open orders"} value={formatNumber(open.length)} />
        <Stat icon={<Truck className="h-4 w-4" />} tone="info" label={lang === "tr" ? "Yolda birim" : "Units on order"} value={formatNumber(onOrderUnits)} />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} tone="primary" label={lang === "tr" ? "Açık değer" : "Open value"} value={formatUsd(openValue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* PO list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border p-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors",
                  filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                )}
              >
                {filterLabel[f][lang]}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Sipariş" : "PO"}</th>
                  <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Tedarikçi" : "Supplier"}</th>
                  <th className="label-mono hidden py-2.5 font-medium text-muted-foreground lg:table-cell">{lang === "tr" ? "Tahmini" : "ETA"}</th>
                  <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Toplam" : "Total"}</th>
                  <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((po: PurchaseOrder) => (
                  <tr key={po.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/50">
                    <td className="py-3 pl-4">
                      <p className="tnum font-semibold leading-tight">{po.number}</p>
                      <p className="text-[11px] text-muted-foreground">{po.lines} {lang === "tr" ? "satır" : "lines"} · {po.units} {lang === "tr" ? "birim" : "units"}</p>
                    </td>
                    <td className="hidden py-3 sm:table-cell"><span className="text-[13px]">{po.supplier}</span></td>
                    <td className="hidden py-3 lg:table-cell"><span className="tnum text-[12.5px] text-muted-foreground">{formatDate(po.eta)}</span></td>
                    <td className="py-3 text-right tnum font-semibold">{formatUsd(po.total)}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", PO_LABEL[po.status].tone)}>
                        {lang === "tr" ? PO_LABEL[po.status].tr : PO_LABEL[po.status].en}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-sm text-muted-foreground">{lang === "tr" ? "Sipariş yok." : "No purchase orders."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Suppliers */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="font-display text-[15px] font-semibold tracking-tight">{lang === "tr" ? "Tedarikçiler" : "Suppliers"}</h2>
          <div className="mt-4 space-y-3">
            {suppliers.map((s) => (
              <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Truck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold leading-tight">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.items} {lang === "tr" ? "kalem" : "items"} · {s.leadTimeDays} {lang === "tr" ? "gün teslim" : "day lead"}
                  </p>
                </div>
                <span
                  className={cn(
                    "tnum shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    s.onTimePct >= 95 ? "bg-success/10 text-success" : s.onTimePct >= 88 ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {s.onTimePct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "info" | "warning"; label: string; value: string }) {
  const toneCls = { primary: "bg-primary/12 text-primary", info: "bg-info/12 text-info", warning: "bg-warning/15 text-warning-foreground" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <p className="mt-3 tnum text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
