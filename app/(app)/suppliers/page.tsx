"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Truck,
  Mail,
  Phone,
  Clock,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { AddSupplierModal } from "@/components/app/add-supplier-modal";
import { NewPOModal } from "@/components/app/new-po-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────────── */

type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lead_time_days: number;
  notes: string | null;
  created_at: string;
};

type PO = {
  id: string;
  supplier_id: string | null;
  status: string;
  total: number;
  units: number;
  number: string;
};

type SupplierStats = {
  totalPOs: number;
  openPOs: number;
  totalValue: number;
  openValue: number;
};

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function SuppliersPage() {
  const { lang } = useLang();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showNewPO, setShowNewPO] = useState(false);

  const fetchAll = useCallback(async () => {
    const [sr, pr] = await Promise.all([
      fetch("/api/suppliers"),
      fetch("/api/purchase-orders"),
    ]);
    if (sr.ok) setSuppliers(await sr.json());
    if (pr.ok) setPOs(await pr.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function statsFor(supplierId: string): SupplierStats {
    const mine = pos.filter((p) => p.supplier_id === supplierId);
    const open = mine.filter((p) => p.status !== "received");
    return {
      totalPOs:   mine.length,
      openPOs:    open.length,
      totalValue: mine.reduce((s, p) => s + p.total, 0),
      openValue:  open.reduce((s, p) => s + p.total, 0),
    };
  }

  const totalSuppliers = suppliers.length;
  const totalOpenPOs = useMemo(() => pos.filter((p) => p.status !== "received").length, [pos]);
  const totalOpenValue = useMemo(
    () => pos.filter((p) => p.status !== "received").reduce((s, p) => s + p.total, 0),
    [pos],
  );

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {showAddSupplier && (
        <AddSupplierModal
          onClose={() => setShowAddSupplier(false)}
          onAdded={() => { setShowAddSupplier(false); fetchAll(); }}
        />
      )}
      {showNewPO && (
        <NewPOModal
          onClose={() => setShowNewPO(false)}
          onCreated={() => { setShowNewPO(false); fetchAll(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {lang === "tr" ? "Tedarikçiler" : "Suppliers"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Tedarikçilerini yönet, sipariş geçmişini takip et."
              : "Manage your suppliers and track order history."}
          </p>
        </div>
        <button
          onClick={() => setShowAddSupplier(true)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {lang === "tr" ? "Tedarikçi ekle" : "Add supplier"}
        </button>
      </div>

      {/* Stat row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Truck className="h-4 w-4" />}
          tone="primary"
          label={lang === "tr" ? "Tedarikçi" : "Suppliers"}
          value={formatNumber(totalSuppliers)}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          tone="warning"
          label={lang === "tr" ? "Açık sipariş" : "Open orders"}
          value={formatNumber(totalOpenPOs)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="info"
          label={lang === "tr" ? "Açık değer" : "Open value"}
          value={formatUsd(totalOpenValue)}
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <Truck className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-display text-lg font-semibold">
            {lang === "tr" ? "Henüz tedarikçi yok" : "No suppliers yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Satın alma siparişi oluşturmak için önce bir tedarikçi ekle."
              : "Add a supplier to start creating purchase orders."}
          </p>
          <button
            onClick={() => setShowAddSupplier(true)}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "İlk tedarikçiyi ekle" : "Add first supplier"}
          </button>
        </div>
      ) : (
        <div className={cn("grid gap-6", selected ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
          {/* Supplier grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min">
            {suppliers.map((s) => {
              const stats = statsFor(s.id);
              const isSel = selected?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(isSel ? null : s)}
                  className={cn(
                    "rounded-2xl border bg-card p-4 shadow-soft text-left transition-all hover:shadow-pop",
                    isSel ? "border-primary bg-primary/[0.03]" : "border-border",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      isSel ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}>
                      <Truck className="h-5 w-5" />
                    </span>
                    {stats.openPOs > 0 && (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning-foreground">
                        {stats.openPOs} {lang === "tr" ? "açık" : "open"}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 truncate font-semibold leading-tight">{s.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {s.lead_time_days} {lang === "tr" ? "gün teslim" : "day lead"}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">
                      {stats.totalPOs} {lang === "tr" ? "sipariş" : "orders"}
                    </span>
                    <span className="tnum text-[12.5px] font-semibold">
                      {formatUsd(stats.totalValue)}
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Add supplier card */}
            <button
              onClick={() => setShowAddSupplier(true)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[13px] font-medium">
                {lang === "tr" ? "Tedarikçi ekle" : "Add supplier"}
              </span>
            </button>
          </div>

          {/* Supplier detail panel */}
          {selected && (
            <aside className="animate-float-up lg:sticky lg:top-2 lg:self-start">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold">{selected.name}</h2>
                    <p className="text-[12px] text-muted-foreground">
                      {selected.lead_time_days} {lang === "tr" ? "gün teslim süresi" : "day lead time"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Contact */}
                {(selected.email || selected.phone) && (
                  <div className="space-y-2 rounded-xl border border-border p-3">
                    {selected.email && (
                      <a
                        href={`mailto:${selected.email}`}
                        className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-primary"
                      >
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone}`}
                        className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-primary"
                      >
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {selected.phone}
                      </a>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selected.notes && (
                  <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                    {selected.notes}
                  </p>
                )}

                {/* Stats */}
                {(() => {
                  const stats = statsFor(selected.id);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <Fact label={lang === "tr" ? "Toplam sipariş" : "Total orders"} value={formatNumber(stats.totalPOs)} />
                      <Fact label={lang === "tr" ? "Açık sipariş" : "Open orders"} value={formatNumber(stats.openPOs)} />
                      <Fact label={lang === "tr" ? "Toplam değer" : "Total value"} value={formatUsd(stats.totalValue)} />
                      <Fact label={lang === "tr" ? "Açık değer" : "Open value"} value={formatUsd(stats.openValue)} />
                    </div>
                  );
                })()}

                {/* PO list for this supplier */}
                {(() => {
                  const mine = pos.filter((p) => p.supplier_id === selected.id);
                  if (mine.length === 0) return (
                    <p className="text-center text-[12px] text-muted-foreground">
                      {lang === "tr" ? "Bu tedarikçiye ait sipariş yok." : "No orders from this supplier."}
                    </p>
                  );
                  return (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {lang === "tr" ? "Siparişler" : "Orders"}
                      </p>
                      {mine.slice(0, 5).map((po) => (
                        <div key={po.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <span className="tnum text-[13px] font-semibold">{po.number}</span>
                          <div className="flex items-center gap-2">
                            <span className="tnum text-[12px] text-muted-foreground">{formatUsd(po.total)}</span>
                            <POStatusBadge status={po.status} lang={lang} />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Create PO button */}
                <button
                  onClick={() => setShowNewPO(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  {lang === "tr" ? "Sipariş oluştur" : "Create purchase order"}
                </button>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 tnum text-[15px] font-bold leading-none">{value}</p>
    </div>
  );
}

const PO_TONE: Record<string, string> = {
  draft:    "bg-muted text-muted-foreground",
  sent:     "bg-info/12 text-info",
  partial:  "bg-warning/15 text-warning-foreground",
  received: "bg-success/15 text-success",
};
const PO_LABEL: Record<string, { tr: string; en: string }> = {
  draft:    { tr: "Taslak", en: "Draft" },
  sent:     { tr: "Gönderildi", en: "Sent" },
  partial:  { tr: "Kısmi", en: "Partial" },
  received: { tr: "Teslim alındı", en: "Received" },
};

function POStatusBadge({ status, lang }: { status: string; lang: "tr" | "en" }) {
  return (
    <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", PO_TONE[status] ?? "bg-muted text-muted-foreground")}>
      {PO_LABEL[status]?.[lang] ?? status}
    </span>
  );
}
