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

export function AddCustomerModal({ onClose, onAdded }: Props) {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement).value;

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:    get("name"),
        email:   get("email"),
        phone:   get("phone"),
        address: get("address"),
        notes:   get("notes"),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error || "Failed to save.");
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
            {lang === "tr" ? "Yeni Müşteri" : "New Customer"}
          </h2>
          <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{lang === "tr" ? "Müşteri adı" : "Customer name"} *</Label>
            <Input id="name" name="name" placeholder={lang === "tr" ? "Örn. ABC Ltd." : "e.g. ABC Ltd."} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="info@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{lang === "tr" ? "Telefon" : "Phone"}</Label>
              <Input id="phone" name="phone" placeholder="+1 (212) 555-0100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">{lang === "tr" ? "Adres" : "Address"}</Label>
            <Input id="address" name="address" placeholder={lang === "tr" ? "Şehir, ülke…" : "City, country…"} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">{lang === "tr" ? "Notlar" : "Notes"}</Label>
            <Input id="notes" name="notes" placeholder={lang === "tr" ? "İsteğe bağlı…" : "Optional…"} />
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
              {lang === "tr" ? "Kaydet" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
