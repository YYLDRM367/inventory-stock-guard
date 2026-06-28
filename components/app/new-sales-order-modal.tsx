"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useLang } from "@/components/i18n/language-provider";
import { formatUsd } from "@/lib/utils";

type Customer = { id: string; name: string };
type DbItem   = { id: string; name: string; sku: string; price: number; on_hand: number };
type Line     = { item_id: string; qty: number; unit_price: number };

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function NewSalesOrderModal({ onClose, onCreated }: Props) {
  const { lang } = useLang();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems]         = useState<DbItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [lines, setLines]         = useState<Line[]>([{ item_id: "", qty: 1, unit_price: 0 }]);

  useEffect(() => {
    Promise.all([fetch("/api/customers"), fetch("/api/items")]).then(async ([cr, ir]) => {
      if (cr.ok) setCustomers(await cr.json());
      if (ir.ok) setItems(await ir.json());
    });
  }, []);

  function addLine() {
    setLines((l) => [...l, { item_id: "", qty: 1, unit_price: 0 }]);
  }

  function removeLine(i: number) {
    setLines((l) => l.filter((_, idx) => idx !== i));
  }

  function updateLine(i: number, field: keyof Line, value: string | number) {
    setLines((prev) =>
      prev.map((l, idx) => {
        if (idx !== i) return l;
        const updated = { ...l, [field]: value };
        if (field === "item_id") {
          const it = items.find((x) => x.id === value);
          if (it) updated.unit_price = it.price;
        }
        return updated;
      }),
    );
  }

  const total      = lines.reduce((s, l) => s + l.qty * l.unit_price, 0);
  const autoNumber = `SO-${Date.now().toString().slice(-6)}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validLines = lines.filter((l) => l.item_id);
    if (validLines.length === 0) {
      setError(lang === "tr" ? "En az bir kalem ekleyin." : "Add at least one item.");
      return;
    }

    setLoading(true);
    const form = e.currentTarget;
    const get  = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value;

    const res = await fetch("/api/sales-orders", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: get("customer_id") || null,
        number:      get("number") || autoNumber,
        notes:       get("notes") || null,
        lines:       validLines,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to save.");
      setLoading(false);
      return;
    }
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-pop max-h-[90vh] overflow-y-auto">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {lang === "tr" ? "Yeni Satış Siparişi" : "New Sales Order"}
          </h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_id">{lang === "tr" ? "Müşteri" : "Customer"}</Label>
              <select
                id="customer_id"
                name="customer_id"
                className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{lang === "tr" ? "— Seçiniz —" : "— Select —"}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="number">{lang === "tr" ? "Sipariş no" : "Order number"}</Label>
              <Input id="number" name="number" placeholder={autoNumber} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">{lang === "tr" ? "Notlar" : "Notes"}</Label>
              <Input id="notes" name="notes" placeholder={lang === "tr" ? "İsteğe bağlı…" : "Optional…"} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>{lang === "tr" ? "Satış kalemleri" : "Order items"}</Label>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "tr" ? "Satır ekle" : "Add line"}
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left">
                    <th className="label-mono px-3 py-2 font-medium text-muted-foreground">{lang === "tr" ? "Ürün" : "Item"}</th>
                    <th className="label-mono w-20 px-3 py-2 font-medium text-muted-foreground">{lang === "tr" ? "Adet" : "Qty"}</th>
                    <th className="label-mono w-28 px-3 py-2 font-medium text-muted-foreground">{lang === "tr" ? "Birim fiyat" : "Unit price"}</th>
                    <th className="label-mono w-24 px-3 py-2 text-right font-medium text-muted-foreground">{lang === "tr" ? "Tutar" : "Total"}</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const it = items.find((x) => x.id === line.item_id);
                    return (
                      <tr key={i} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2">
                          <select
                            value={line.item_id}
                            onChange={(e) => updateLine(i, "item_id", e.target.value)}
                            className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                          >
                            <option value="">{lang === "tr" ? "— Seç —" : "— Select —"}</option>
                            {items.map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name} ({lang === "tr" ? "stok" : "stock"}: {x.on_hand})
                              </option>
                            ))}
                          </select>
                          {it && line.qty > it.on_hand && (
                            <p className="mt-0.5 text-[11px] text-destructive">
                              {lang === "tr" ? `Stok yetersiz (${it.on_hand} adet)` : `Insufficient stock (${it.on_hand} available)`}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number" min="1"
                            value={line.qty}
                            onChange={(e) => updateLine(i, "qty", Number(e.target.value))}
                            className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number" min="0" step="0.01"
                            value={line.unit_price}
                            onChange={(e) => updateLine(i, "unit_price", Number(e.target.value))}
                            className="w-full rounded-md border border-input bg-card px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </td>
                        <td className="px-3 py-2 text-right tnum text-[13px] font-semibold">
                          {formatUsd(line.qty * line.unit_price)}
                        </td>
                        <td className="px-2 py-2">
                          {lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(i)}
                              className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={3} className="px-3 py-2 text-right text-[12.5px] font-medium text-muted-foreground">
                      {lang === "tr" ? "Genel toplam" : "Grand total"}
                    </td>
                    <td className="px-3 py-2 text-right tnum text-[14px] font-bold">{formatUsd(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {lang === "tr" ? "İptal" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {lang === "tr" ? "Taslak oluştur" : "Create draft"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
