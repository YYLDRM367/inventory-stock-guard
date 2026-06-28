"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useLang } from "@/components/i18n/language-provider";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export function AddItemModal({ onClose, onAdded }: Props) {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement).value;

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: get("name"),
        sku: get("sku"),
        on_hand: get("on_hand"),
        reorder_point: get("reorder_point"),
        cost: get("cost"),
        price: get("price"),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || (lang === "tr" ? "Kaydedilemedi." : "Failed to save."));
      setLoading(false);
      return;
    }

    onAdded();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-pop">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {lang === "tr" ? "Yeni Kalem" : "New Item"}
          </h2>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">{lang === "tr" ? "Ürün adı" : "Item name"} *</Label>
              <Input
                id="name"
                name="name"
                placeholder={lang === "tr" ? "Örn. Kablo Makarası" : "e.g. Cable Reel"}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" placeholder="SKU-0001" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="on_hand">{lang === "tr" ? "Eldeki miktar" : "On hand"}</Label>
              <Input id="on_hand" name="on_hand" type="number" min="0" defaultValue="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reorder_point">
                {lang === "tr" ? "Sipariş noktası" : "Reorder point"}
              </Label>
              <Input id="reorder_point" name="reorder_point" type="number" min="0" defaultValue="5" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">{lang === "tr" ? "Maliyet ($)" : "Cost ($)"}</Label>
              <Input id="cost" name="cost" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">{lang === "tr" ? "Satış fiyatı ($)" : "Sale price ($)"}</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue="0" />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {lang === "tr" ? "İptal" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {lang === "tr" ? "Kaydet" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
