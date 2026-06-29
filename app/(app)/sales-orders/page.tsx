"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, ShoppingCart, Clock, CheckCircle2, PackageCheck,
  X, Loader2, Package, ChevronRight, XCircle, Printer,
} from "lucide-react";
import { NewSalesOrderModal } from "@/components/app/new-sales-order-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber, formatDate } from "@/lib/utils";

type SOStatus = "draft" | "confirmed" | "shipped" | "cancelled";

type SO = {
  id: string; number: string; status: SOStatus;
  customer_id: string | null; customer_name: string;
  lines: number; units: number; total: number;
  notes: string | null; created_at: string;
};

type SOItem = {
  id: string; item_id: string; qty: number; unit_price: number;
  items: { name: string; sku: string; cost: number } | null;
};

const FILTERS = ["all", "draft", "confirmed", "shipped", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

const SO_LABEL: Record<SOStatus, { tr: string; en: string; tone: string }> = {
  draft:     { tr: "Taslak",    en: "Draft",     tone: "bg-muted text-muted-foreground" },
  confirmed: { tr: "Onaylandı", en: "Confirmed", tone: "bg-info/12 text-info" },
  shipped:   { tr: "Gönderildi",en: "Shipped",   tone: "bg-success/15 text-success" },
  cancelled: { tr: "İptal",     en: "Cancelled", tone: "bg-destructive/10 text-destructive" },
};

const STATUS_NEXT: Partial<Record<SOStatus, SOStatus>> = {
  draft:     "confirmed",
  confirmed: "shipped",
};

export default function SalesOrdersPage() {
  const { lang } = useLang();
  const [orders, setOrders]         = useState<SO[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<Filter>("all");
  const [selectedSO, setSelectedSO] = useState<SO | null>(null);
  const [soItems, setSOItems]       = useState<SOItem[]>([]);
  const [soItemsLoading, setSOItemsLoading] = useState(false);
  const [advancing, setAdvancing]   = useState(false);
  const [showNewSO, setShowNewSO]   = useState(false);

  const fetchAll = useCallback(async () => {
    const r = await fetch("/api/sales-orders");
    if (r.ok) setOrders(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function selectSO(so: SO) {
    setSelectedSO(so);
    setSOItems([]);
    setSOItemsLoading(true);
    const r = await fetch(`/api/sales-orders/${so.id}`);
    if (r.ok) setSOItems(await r.json());
    setSOItemsLoading(false);
  }

  async function advanceStatus() {
    if (!selectedSO) return;
    const next = STATUS_NEXT[selectedSO.status];
    if (!next) return;
    setAdvancing(true);
    await fetch(`/api/sales-orders/${selectedSO.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setAdvancing(false);
    const r = await fetch("/api/sales-orders");
    if (r.ok) {
      const updated: SO[] = await r.json();
      setOrders(updated);
      const refreshed = updated.find((o) => o.id === selectedSO.id);
      if (refreshed) setSelectedSO(refreshed);
    }
  }

  function printSO() {
    if (!selectedSO) return;
    const rows = soItems.map((si) => `
      <tr>
        <td>${si.items?.name ?? "—"}</td>
        <td class="mono">${si.items?.sku ?? "—"}</td>
        <td class="right">${si.qty}</td>
        <td class="right">${formatUsd(si.unit_price)}</td>
        <td class="right">${formatUsd(si.qty * si.unit_price)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${lang === "tr" ? "Satış Siparişi" : "Sales Order"} – ${selectedSO.number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:40px}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
  .header h1{font-size:22px;font-weight:700}
  .header .sub{font-size:11px;color:#666;margin-top:2px}
  .meta{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 24px;margin-bottom:24px;padding:16px;background:#f8f8f8;border-radius:8px}
  .meta-item label{font-size:10px;color:#888;display:block;margin-bottom:2px;text-transform:uppercase;letter-spacing:.04em}
  .meta-item span{font-size:13px;font-weight:600}
  .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;background:#e5e7eb;color:#374151}
  .notes{margin-bottom:20px;padding:12px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;font-size:12px;color:#78350f}
  table{width:100%;border-collapse:collapse}
  th{background:#f3f4f6;text-align:left;padding:8px 10px;font-size:11px;color:#6b7280;border-bottom:2px solid #e5e7eb}
  td{padding:8px 10px;border-bottom:1px solid #f3f4f6;font-size:12px;vertical-align:middle}
  .right{text-align:right}
  .mono{font-family:monospace;font-size:11px;color:#6b7280}
  tfoot td{font-weight:700;font-size:13px;border-top:2px solid #d1d5db;border-bottom:none;padding-top:12px}
  @media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div>
    <h1>${lang === "tr" ? "Satış Siparişi" : "Sales Order"}</h1>
    <div class="sub">Inventory Stock Guard</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:20px;font-weight:700;font-family:monospace">${selectedSO.number}</div>
    <div class="sub">${formatDate(selectedSO.created_at)}</div>
  </div>
</div>
<div class="meta">
  <div class="meta-item"><label>${lang === "tr" ? "Müşteri" : "Customer"}</label><span>${selectedSO.customer_name}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Durum" : "Status"}</label><span class="badge">${SO_LABEL[selectedSO.status][lang]}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Tarih" : "Date"}</label><span>${formatDate(selectedSO.created_at)}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Toplam tutar" : "Order total"}</label><span>${formatUsd(selectedSO.total)}</span></div>
</div>
${selectedSO.notes ? `<div class="notes"><strong>${lang === "tr" ? "Notlar" : "Notes"}:</strong> ${selectedSO.notes}</div>` : ""}
<table>
  <thead><tr>
    <th>${lang === "tr" ? "Ürün" : "Item"}</th>
    <th>SKU</th>
    <th class="right">${lang === "tr" ? "Adet" : "Qty"}</th>
    <th class="right">${lang === "tr" ? "Birim fiyat" : "Unit price"}</th>
    <th class="right">${lang === "tr" ? "Toplam" : "Total"}</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr>
    <td colspan="4" class="right">${lang === "tr" ? "Genel Toplam" : "Grand Total"}</td>
    <td class="right">${formatUsd(selectedSO.total)}</td>
  </tr></tfoot>
</table>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  }

  async function cancelOrder() {
    if (!selectedSO) return;
    setAdvancing(true);
    await fetch(`/api/sales-orders/${selectedSO.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    setAdvancing(false);
    const r = await fetch("/api/sales-orders");
    if (r.ok) {
      const updated: SO[] = await r.json();
      setOrders(updated);
      const refreshed = updated.find((o) => o.id === selectedSO.id);
      if (refreshed) setSelectedSO(refreshed);
    }
  }

  const rows = useMemo(
    () => orders.filter((o) => filter === "all" || o.status === filter),
    [orders, filter],
  );

  const openOrders  = useMemo(() => orders.filter((o) => o.status !== "shipped" && o.status !== "cancelled"), [orders]);
  const totalRevenue = useMemo(() => orders.filter((o) => o.status === "shipped").reduce((s, o) => s + o.total, 0), [orders]);

  const filterLabel: Record<Filter, { tr: string; en: string }> = {
    all:       { tr: "Tümü",      en: "All" },
    draft:     { tr: "Taslak",    en: "Draft" },
    confirmed: { tr: "Onaylandı", en: "Confirmed" },
    shipped:   { tr: "Gönderildi",en: "Shipped" },
    cancelled: { tr: "İptal",     en: "Cancelled" },
  };

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in space-y-6">
      {showNewSO && (
        <NewSalesOrderModal onClose={() => setShowNewSO(false)} onCreated={() => { setShowNewSO(false); fetchAll(); }} />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Satış siparişleri" : "Sales orders"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr" ? "Müşteri siparişlerini yönet, gönderilince stok düşer." : "Manage customer orders — stock decreases on shipment."}
          </p>
        </div>
        <button onClick={() => setShowNewSO(true)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />{lang === "tr" ? "Yeni sipariş" : "New order"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Clock className="h-4 w-4" />} tone="warning" label={lang === "tr" ? "Açık sipariş" : "Open orders"} value={formatNumber(openOrders.length)} />
        <StatCard icon={<PackageCheck className="h-4 w-4" />} tone="info" label={lang === "tr" ? "Gönderilen" : "Shipped"} value={formatNumber(orders.filter((o) => o.status === "shipped").length)} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} tone="primary" label={lang === "tr" ? "Toplam gelir" : "Total revenue"} value={formatUsd(totalRevenue)} />
      </div>

      <div className={cn("grid gap-6", selectedSO ? "lg:grid-cols-[1.5fr_1fr]" : "grid-cols-1")}>
        {/* Order list */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border p-3">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors", filter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")}
              >
                {filterLabel[f][lang]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-semibold">{lang === "tr" ? "Sipariş yok" : "No orders"}</p>
              <button onClick={() => setShowNewSO(true)}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />{lang === "tr" ? "İlk siparişi oluştur" : "Create first order"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="label-mono py-2.5 pl-4 font-medium text-muted-foreground">{lang === "tr" ? "Sipariş" : "Order"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground sm:table-cell">{lang === "tr" ? "Müşteri" : "Customer"}</th>
                    <th className="label-mono hidden py-2.5 font-medium text-muted-foreground lg:table-cell">{lang === "tr" ? "Tarih" : "Date"}</th>
                    <th className="label-mono py-2.5 text-right font-medium text-muted-foreground">{lang === "tr" ? "Toplam" : "Total"}</th>
                    <th className="label-mono py-2.5 pr-4 text-right font-medium text-muted-foreground">{lang === "tr" ? "Durum" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((so) => {
                    const isSel = selectedSO?.id === so.id;
                    return (
                      <tr key={so.id} onClick={() => selectSO(so)}
                        className={cn("cursor-pointer border-b border-border/60 transition-colors last:border-0", isSel ? "bg-primary/[0.05]" : "hover:bg-muted/50")}
                      >
                        <td className="py-3 pl-4">
                          <p className="tnum font-semibold leading-tight">{so.number}</p>
                          <p className="text-[11px] text-muted-foreground">{so.lines} {lang === "tr" ? "satır" : "lines"} · {so.units} {lang === "tr" ? "birim" : "units"}</p>
                        </td>
                        <td className="hidden py-3 sm:table-cell"><span className="text-[13px]">{so.customer_name}</span></td>
                        <td className="hidden py-3 lg:table-cell"><span className="tnum text-[12.5px] text-muted-foreground">{formatDate(so.created_at)}</span></td>
                        <td className="py-3 text-right tnum font-semibold">{formatUsd(so.total)}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", SO_LABEL[so.status].tone)}>
                            {SO_LABEL[so.status][lang]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SO detail panel */}
        {selectedSO && (
          <div className="animate-float-up space-y-4 lg:sticky lg:top-2 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="tnum font-semibold">{selectedSO.number}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedSO.customer_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", SO_LABEL[selectedSO.status].tone)}>
                    {SO_LABEL[selectedSO.status][lang]}
                  </span>
                  <button
                    onClick={printSO}
                    title={lang === "tr" ? "Yazdır" : "Print"}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button onClick={() => setSelectedSO(null)} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-card px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Toplam tutar" : "Order total"}</p>
                  <p className="tnum text-lg font-bold">{formatUsd(selectedSO.total)}</p>
                </div>
                <div className="bg-card px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Tarih" : "Created"}</p>
                  <p className="tnum text-lg font-bold">{formatDate(selectedSO.created_at)}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="divide-y divide-border/60">
                {soItemsLoading ? (
                  <div className="flex h-20 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : soItems.length === 0 ? (
                  <p className="py-8 text-center text-[13px] text-muted-foreground">{lang === "tr" ? "Bu siparişte kalem yok." : "No items in this order."}</p>
                ) : (
                  soItems.map((si) => (
                    <div key={si.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">{si.items?.name ?? "—"}</p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">
                          {si.items?.sku} · {formatUsd(si.unit_price)}/{lang === "tr" ? "birim" : "unit"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[13px] font-semibold">{si.qty} {lang === "tr" ? "adet" : "units"}</p>
                        <p className="tnum text-[11px] text-muted-foreground">{formatUsd(si.qty * si.unit_price)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 border-t border-border p-3">
                {STATUS_NEXT[selectedSO.status] && (
                  <button onClick={advanceStatus} disabled={advancing}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60",
                      STATUS_NEXT[selectedSO.status] === "shipped" ? "bg-success text-white" : "bg-primary text-primary-foreground",
                    )}
                  >
                    {advancing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <ChevronRight className="h-3.5 w-3.5" />
                    {lang === "tr"
                      ? `${SO_LABEL[STATUS_NEXT[selectedSO.status]!].tr} olarak işaretle`
                      : `Mark as ${SO_LABEL[STATUS_NEXT[selectedSO.status]!].en}`}
                  </button>
                )}
                {STATUS_NEXT[selectedSO.status] === "shipped" && (
                  <p className="text-center text-[11px] text-muted-foreground">
                    {lang === "tr" ? "Gönderilince stok otomatik düşer." : "Stock decreases automatically when shipped."}
                  </p>
                )}
                {selectedSO.status !== "shipped" && selectedSO.status !== "cancelled" && (
                  <button onClick={cancelOrder} disabled={advancing}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-[12.5px] font-medium text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-40"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {lang === "tr" ? "İptal et" : "Cancel order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, tone, label, value }: { icon: React.ReactNode; tone: "primary" | "info" | "warning"; label: string; value: string }) {
  const toneCls = { primary: "bg-primary/12 text-primary", info: "bg-info/12 text-info", warning: "bg-warning/15 text-warning-foreground" }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <p className="mt-3 tnum text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
