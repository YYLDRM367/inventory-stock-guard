"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Truck,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  X,
  Loader2,
  Package,
  ChevronRight,
  Printer,
} from "lucide-react";
import { AddSupplierModal } from "@/components/app/add-supplier-modal";
import { NewPOModal } from "@/components/app/new-po-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber, formatDate } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────────── */

type POStatus = "draft" | "sent" | "partial" | "received";

type PO = {
  id: string;
  number: string;
  status: POStatus;
  supplier_name: string;
  supplier_id: string | null;
  expected_at: string | null;
  lines: number;
  units: number;
  total: number;
  created_at: string;
};

type POItem = {
  id: string;
  item_id: string;
  qty_ordered: number;
  qty_received: number;
  unit_cost: number;
  items: { name: string; sku: string } | null;
};

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lead_time_days: number;
  notes: string | null;
};

/* ── Constants ────────────────────────────────────────────────────────────── */

const FILTERS = ["all", "draft", "sent", "partial", "received"] as const;
type Filter = (typeof FILTERS)[number];

const PO_LABEL: Record<POStatus, { tr: string; en: string; tone: string }> = {
  draft:    { tr: "Taslak",       en: "Draft",    tone: "bg-muted text-muted-foreground" },
  sent:     { tr: "Gönderildi",   en: "Sent",     tone: "bg-info/12 text-info" },
  partial:  { tr: "Kısmi",        en: "Partial",  tone: "bg-warning/15 text-warning-foreground" },
  received: { tr: "Teslim alındı",en: "Received", tone: "bg-success/15 text-success" },
};

const STATUS_NEXT: Partial<Record<POStatus, POStatus>> = {
  draft:   "sent",
  sent:    "partial",
  partial: "received",
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function PurchaseOrdersPage() {
  const { lang } = useLang();
  const [pos, setPOs] = useState<PO[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [poItems, setPOItems] = useState<POItem[]>([]);
  const [poItemsLoading, setPOItemsLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const [showNewPO, setShowNewPO] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);

  const fetchAll = useCallback(async () => {
    const [pr, sr] = await Promise.all([
      fetch("/api/purchase-orders"),
      fetch("/api/suppliers"),
    ]);
    if (pr.ok) setPOs(await pr.json());
    if (sr.ok) setSuppliers(await sr.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function selectPO(po: PO) {
    setSelectedPO(po);
    setPOItems([]);
    setPOItemsLoading(true);
    const r = await fetch(`/api/purchase-orders/${po.id}`);
    if (r.ok) setPOItems(await r.json());
    setPOItemsLoading(false);
  }

  function printPO() {
    if (!selectedPO) return;
    const rows = poItems.map((pi) => `
      <tr>
        <td>${pi.items?.name ?? "—"}</td>
        <td class="mono">${pi.items?.sku ?? "—"}</td>
        <td class="right">${pi.qty_ordered}</td>
        <td class="right">${pi.qty_received}</td>
        <td class="right">${formatUsd(pi.unit_cost)}</td>
        <td class="right">${formatUsd(pi.qty_ordered * pi.unit_cost)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${lang === "tr" ? "Satın Alma Siparişi" : "Purchase Order"} – ${selectedPO.number}</title>
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
    <h1>${lang === "tr" ? "Satın Alma Siparişi" : "Purchase Order"}</h1>
    <div class="sub">Inventory Stock Guard</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:20px;font-weight:700;font-family:monospace">${selectedPO.number}</div>
    <div class="sub">${formatDate(selectedPO.created_at)}</div>
  </div>
</div>
<div class="meta">
  <div class="meta-item"><label>${lang === "tr" ? "Tedarikçi" : "Supplier"}</label><span>${selectedPO.supplier_name}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Durum" : "Status"}</label><span class="badge">${PO_LABEL[selectedPO.status][lang]}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Tahmini teslim" : "Expected"}</label><span>${selectedPO.expected_at ? formatDate(selectedPO.expected_at) : "—"}</span></div>
  <div class="meta-item"><label>${lang === "tr" ? "Toplam tutar" : "Total value"}</label><span>${formatUsd(selectedPO.total)}</span></div>
</div>
<table>
  <thead><tr>
    <th>${lang === "tr" ? "Ürün" : "Item"}</th>
    <th>SKU</th>
    <th class="right">${lang === "tr" ? "Sipariş" : "Ordered"}</th>
    <th class="right">${lang === "tr" ? "Teslim" : "Received"}</th>
    <th class="right">${lang === "tr" ? "Birim fiyat" : "Unit cost"}</th>
    <th class="right">${lang === "tr" ? "Toplam" : "Total"}</th>
  </tr></thead>
  <tbody>${rows}</tbody>
  <tfoot><tr>
    <td colspan="5" class="right">${lang === "tr" ? "Genel Toplam" : "Grand Total"}</td>
    <td class="right">${formatUsd(selectedPO.total)}</td>
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

  async function advanceStatus() {
    if (!selectedPO) return;
    const next = STATUS_NEXT[selectedPO.status];
    if (!next) return;
    setAdvancing(true);
    await fetch(`/api/purchase-orders/${selectedPO.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setAdvancing(false);
    // Refresh
    const r = await fetch("/api/purchase-orders");
    if (r.ok) {
      const updated: PO[] = await r.json();
      setPOs(updated);
      const refreshed = updated.find((p) => p.id === selectedPO.id);
      if (refreshed) setSelectedPO(refreshed);
    }
  }

  const rows = useMemo(
    () => pos.filter((p) => filter === "all" || p.status === filter),
    [pos, filter],
  );

  const open = useMemo(() => pos.filter((p) => p.status !== "received"), [pos]);
  const openValue = useMemo(() => open.reduce((s, p) => s + p.total, 0), [open]);
  const onOrderUnits = useMemo(() => open.reduce((s, p) => s + p.units, 0), [open]);

  const filterLabel: Record<Filter, { tr: string; en: string }> = {
    all:      { tr: "Tümü",         en: "All" },
    draft:    { tr: "Taslak",       en: "Draft" },
    sent:     { tr: "Gönderildi",   en: "Sent" },
    partial:  { tr: "Kısmi",        en: "Partial" },
    received: { tr: "Teslim alındı",en: "Received" },
  };

  return (
    <div className="mx-auto max-w-[1400px] animate-fade-in space-y-6">
      {showNewPO && (
        <NewPOModal
          onClose={() => setShowNewPO(false)}
          onCreated={() => { setShowNewPO(false); fetchAll(); }}
        />
      )}
      {showNewSupplier && (
        <AddSupplierModal
          onClose={() => setShowNewSupplier(false)}
          onAdded={() => { setShowNewSupplier(false); fetchAll(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {lang === "tr" ? "Satın alma siparişleri" : "Purchase orders"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Tedarikçilerden stok yenile ve teslim al."
              : "Reorder and receive stock from your suppliers."}
          </p>
        </div>
        <button
          onClick={() => setShowNewPO(true)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
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

      <div className={cn("grid gap-6", selectedPO ? "lg:grid-cols-[1.5fr_1fr]" : "lg:grid-cols-[1.6fr_1fr]")}>
        {/* ── PO list ─────────────────────────────────────────────── */}
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

          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="font-semibold">{lang === "tr" ? "Sipariş yok" : "No purchase orders"}</p>
              <button
                onClick={() => setShowNewPO(true)}
                className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "tr" ? "İlk siparişi oluştur" : "Create first PO"}
              </button>
            </div>
          ) : (
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
                  {rows.map((po) => {
                    const isSel = selectedPO?.id === po.id;
                    return (
                      <tr
                        key={po.id}
                        onClick={() => selectPO(po)}
                        className={cn(
                          "cursor-pointer border-b border-border/60 transition-colors last:border-0",
                          isSel ? "bg-primary/[0.05]" : "hover:bg-muted/50",
                        )}
                      >
                        <td className="py-3 pl-4">
                          <p className="tnum font-semibold leading-tight">{po.number}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {po.lines} {lang === "tr" ? "satır" : "lines"} · {po.units} {lang === "tr" ? "birim" : "units"}
                          </p>
                        </td>
                        <td className="hidden py-3 sm:table-cell">
                          <span className="text-[13px]">{po.supplier_name}</span>
                        </td>
                        <td className="hidden py-3 lg:table-cell">
                          <span className="tnum text-[12.5px] text-muted-foreground">
                            {po.expected_at ? formatDate(po.expected_at) : "—"}
                          </span>
                        </td>
                        <td className="py-3 text-right tnum font-semibold">{formatUsd(po.total)}</td>
                        <td className="py-3 pr-4 text-right">
                          <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", PO_LABEL[po.status].tone)}>
                            {PO_LABEL[po.status][lang]}
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

        {/* ── Right panel: PO detail OR Suppliers ─────────────────── */}
        {selectedPO ? (
          /* PO detail drawer */
          <div className="animate-float-up space-y-4 lg:sticky lg:top-2 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="tnum font-semibold">{selectedPO.number}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedPO.supplier_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", PO_LABEL[selectedPO.status].tone)}>
                    {PO_LABEL[selectedPO.status][lang]}
                  </span>
                  <button
                    onClick={printPO}
                    title={lang === "tr" ? "Yazdır" : "Print"}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedPO(null)}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-card px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Toplam tutar" : "Total value"}</p>
                  <p className="tnum text-lg font-bold">{formatUsd(selectedPO.total)}</p>
                </div>
                <div className="bg-card px-4 py-3">
                  <p className="text-[11px] text-muted-foreground">{lang === "tr" ? "Tahmini teslim" : "Expected"}</p>
                  <p className="tnum text-lg font-bold">{selectedPO.expected_at ? formatDate(selectedPO.expected_at) : "—"}</p>
                </div>
              </div>

              {/* Line items */}
              <div className="divide-y divide-border/60">
                {poItemsLoading ? (
                  <div className="flex h-20 items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : poItems.length === 0 ? (
                  <p className="py-8 text-center text-[13px] text-muted-foreground">
                    {lang === "tr" ? "Bu siparişte kalem yok." : "No items in this order."}
                  </p>
                ) : (
                  poItems.map((pi) => (
                    <div key={pi.id} className="flex items-center gap-3 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold leading-tight">
                          {pi.items?.name ?? "—"}
                        </p>
                        <p className="tnum truncate text-[11px] text-muted-foreground">
                          {pi.items?.sku} · {formatUsd(pi.unit_cost)}/{lang === "tr" ? "birim" : "unit"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="tnum text-[13px] font-semibold">{pi.qty_ordered} {lang === "tr" ? "adet" : "units"}</p>
                        <p className="tnum text-[11px] text-muted-foreground">{formatUsd(pi.qty_ordered * pi.unit_cost)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Status advance */}
              {STATUS_NEXT[selectedPO.status] && (
                <div className="border-t border-border p-3">
                  <button
                    onClick={advanceStatus}
                    disabled={advancing}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60",
                      selectedPO.status === "partial" || STATUS_NEXT[selectedPO.status] === "received"
                        ? "bg-success text-white"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {advancing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <ChevronRight className="h-3.5 w-3.5" />
                    {lang === "tr"
                      ? `${PO_LABEL[STATUS_NEXT[selectedPO.status]!].tr} olarak işaretle`
                      : `Mark as ${PO_LABEL[STATUS_NEXT[selectedPO.status]!].en}`}
                  </button>
                  {STATUS_NEXT[selectedPO.status] === "received" && (
                    <p className="mt-2 text-center text-[11px] text-muted-foreground">
                      {lang === "tr"
                        ? "Teslim alındığında stok otomatik güncellenir."
                        : "Stock will be updated automatically when received."}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Suppliers panel */
          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[15px] font-semibold tracking-tight">
                {lang === "tr" ? "Tedarikçiler" : "Suppliers"}
              </h2>
              <button
                onClick={() => setShowNewSupplier(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-[12.5px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "tr" ? "Ekle" : "Add"}
              </button>
            </div>

            {loading ? (
              <div className="mt-4 flex h-20 items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="mt-6 flex flex-col items-center justify-center text-center">
                <Truck className="mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-[13px] text-muted-foreground">
                  {lang === "tr" ? "Henüz tedarikçi yok." : "No suppliers yet."}
                </p>
                <button
                  onClick={() => setShowNewSupplier(true)}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {lang === "tr" ? "İlk tedarikçiyi ekle" : "Add first supplier"}
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {suppliers.map((s) => (
                  <div key={s.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Truck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold leading-tight">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {s.lead_time_days} {lang === "tr" ? "gün teslim" : "day lead"}
                        {s.email && ` · ${s.email}`}
                      </p>
                      {s.phone && (
                        <p className="tnum text-[11px] text-muted-foreground">{s.phone}</p>
                      )}
                    </div>
                    <a
                      href={s.email ? `mailto:${s.email}` : undefined}
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-primary",
                        !s.email && "pointer-events-none opacity-30",
                      )}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            {!loading && suppliers.length > 0 && (
              <p className="mt-4 text-[11px] text-muted-foreground/70">
                {lang === "tr"
                  ? "Bir siparişe tıklayarak detayları görebilirsin."
                  : "Click a purchase order to see its details."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────────────── */

function Stat({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: "primary" | "info" | "warning";
  label: string;
  value: string;
}) {
  const toneCls = {
    primary: "bg-primary/12 text-primary",
    info:    "bg-info/12 text-info",
    warning: "bg-warning/15 text-warning-foreground",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", toneCls)}>{icon}</span>
      <p className="mt-3 tnum text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
