"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Users, Mail, Phone, MapPin, X, Loader2, ShoppingCart, CircleDollarSign } from "lucide-react";
import { AddCustomerModal } from "@/components/app/add-customer-modal";
import { NewSalesOrderModal } from "@/components/app/new-sales-order-modal";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatUsd, formatNumber } from "@/lib/utils";

type Customer = {
  id: string; name: string; email: string | null;
  phone: string | null; address: string | null; notes: string | null;
};

type SO = {
  id: string; number: string; status: string;
  customer_id: string | null; total: number; units: number;
};

const SO_TONE: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  confirmed: "bg-info/12 text-info",
  shipped:   "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};
const SO_LABEL: Record<string, { tr: string; en: string }> = {
  draft:     { tr: "Taslak",    en: "Draft" },
  confirmed: { tr: "Onaylandı", en: "Confirmed" },
  shipped:   { tr: "Gönderildi",en: "Shipped" },
  cancelled: { tr: "İptal",     en: "Cancelled" },
};

export default function CustomersPage() {
  const { lang } = useLang();
  const [customers, setCustomers]       = useState<Customer[]>([]);
  const [orders, setOrders]             = useState<SO[]>([]);
  const [loading, setLoading]           = useState(true);
  const [selected, setSelected]         = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showNewSO, setShowNewSO]       = useState(false);

  const fetchAll = useCallback(async () => {
    const [cr, sr] = await Promise.all([fetch("/api/customers"), fetch("/api/sales-orders")]);
    if (cr.ok) setCustomers(await cr.json());
    if (sr.ok) setOrders(await sr.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function ordersFor(cid: string) { return orders.filter((o) => o.customer_id === cid); }

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status === "shipped").reduce((s, o) => s + o.total, 0),
    [orders],
  );
  const openOrders = useMemo(() => orders.filter((o) => o.status !== "shipped" && o.status !== "cancelled").length, [orders]);

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">
      {showAddCustomer && (
        <AddCustomerModal onClose={() => setShowAddCustomer(false)} onAdded={() => { setShowAddCustomer(false); fetchAll(); }} />
      )}
      {showNewSO && (
        <NewSalesOrderModal onClose={() => setShowNewSO(false)} onCreated={() => { setShowNewSO(false); fetchAll(); }} />
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{lang === "tr" ? "Müşteriler" : "Customers"}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr" ? "Müşterilerini ve satış geçmişini yönet." : "Manage your customers and sales history."}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowNewSO(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted">
            <ShoppingCart className="h-4 w-4" />
            {lang === "tr" ? "Satış siparişi" : "New order"}
          </button>
          <button onClick={() => setShowAddCustomer(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Müşteri ekle" : "Add customer"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: <Users className="h-4 w-4" />, tone: "primary", label: lang === "tr" ? "Müşteri" : "Customers",      value: formatNumber(customers.length) },
          { icon: <ShoppingCart className="h-4 w-4" />, tone: "warning", label: lang === "tr" ? "Açık sipariş" : "Open orders", value: formatNumber(openOrders) },
          { icon: <CircleDollarSign className="h-4 w-4" />, tone: "info", label: lang === "tr" ? "Toplam gelir" : "Total revenue", value: formatUsd(totalRevenue) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <span className={cn("grid h-8 w-8 place-items-center rounded-lg", {
              primary: "bg-primary/12 text-primary", warning: "bg-warning/15 text-warning-foreground", info: "bg-info/12 text-info",
            }[s.tone])}>{s.icon}</span>
            <p className="mt-3 tnum text-2xl font-bold leading-none">{s.value}</p>
            <p className="mt-1.5 text-[12.5px] font-medium text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <Users className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-display text-lg font-semibold">{lang === "tr" ? "Henüz müşteri yok" : "No customers yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{lang === "tr" ? "İlk müşterini ekle ve satış takibine başla." : "Add your first customer to start tracking sales."}</p>
          <button onClick={() => setShowAddCustomer(true)} className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" />{lang === "tr" ? "Müşteri ekle" : "Add customer"}
          </button>
        </div>
      ) : (
        <div className={cn("grid gap-6", selected ? "lg:grid-cols-[1fr_380px]" : "grid-cols-1")}>
          {/* Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-min">
            {customers.map((c) => {
              const myOrders = ordersFor(c.id);
              const revenue  = myOrders.filter((o) => o.status === "shipped").reduce((s, o) => s + o.total, 0);
              const isSel    = selected?.id === c.id;
              return (
                <button key={c.id} onClick={() => setSelected(isSel ? null : c)}
                  className={cn("rounded-2xl border bg-card p-4 shadow-soft text-left transition-all hover:shadow-pop", isSel ? "border-primary bg-primary/[0.03]" : "border-border")}
                >
                  <div className={cn("grid h-10 w-10 place-items-center rounded-xl", isSel ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="mt-3 truncate font-semibold leading-tight">{c.name}</p>
                  {c.email && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{c.email}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{myOrders.length} {lang === "tr" ? "sipariş" : "orders"}</span>
                    <span className="tnum text-[12.5px] font-semibold">{formatUsd(revenue)}</span>
                  </div>
                </button>
              );
            })}
            <button onClick={() => setShowAddCustomer(true)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[13px] font-medium">{lang === "tr" ? "Müşteri ekle" : "Add customer"}</span>
            </button>
          </div>

          {/* Detail panel */}
          {selected && (
            <aside className="animate-float-up lg:sticky lg:top-2 lg:self-start">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-lg font-semibold">{selected.name}</h2>
                  </div>
                  <button onClick={() => setSelected(null)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {(selected.email || selected.phone || selected.address) && (
                  <div className="space-y-2 rounded-xl border border-border p-3">
                    {selected.email && (
                      <a href={`mailto:${selected.email}`} className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-primary">
                        <Mail className="h-3.5 w-3.5 shrink-0" />{selected.email}
                      </a>
                    )}
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-primary">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{selected.phone}
                      </a>
                    )}
                    {selected.address && (
                      <p className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />{selected.address}
                      </p>
                    )}
                  </div>
                )}

                {selected.notes && (
                  <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[12.5px] text-muted-foreground">{selected.notes}</p>
                )}

                {(() => {
                  const myOrders = ordersFor(selected.id);
                  const revenue  = myOrders.filter((o) => o.status === "shipped").reduce((s, o) => s + o.total, 0);
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <Fact label={lang === "tr" ? "Toplam sipariş" : "Total orders"} value={formatNumber(myOrders.length)} />
                      <Fact label={lang === "tr" ? "Toplam gelir" : "Revenue"} value={formatUsd(revenue)} />
                    </div>
                  );
                })()}

                {(() => {
                  const myOrders = ordersFor(selected.id);
                  if (myOrders.length === 0) return (
                    <p className="text-center text-[12px] text-muted-foreground">{lang === "tr" ? "Bu müşteriye ait sipariş yok." : "No orders for this customer."}</p>
                  );
                  return (
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{lang === "tr" ? "Son siparişler" : "Recent orders"}</p>
                      {myOrders.slice(0, 5).map((o) => (
                        <div key={o.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                          <span className="tnum text-[13px] font-semibold">{o.number}</span>
                          <div className="flex items-center gap-2">
                            <span className="tnum text-[12px] text-muted-foreground">{formatUsd(o.total)}</span>
                            <span className={cn("inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-semibold", SO_TONE[o.status] ?? "bg-muted text-muted-foreground")}>
                              {SO_LABEL[o.status]?.[lang] ?? o.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <button onClick={() => setShowNewSO(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {lang === "tr" ? "Sipariş oluştur" : "Create order"}
                </button>
              </div>
            </aside>
          )}
        </div>
      )}
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
