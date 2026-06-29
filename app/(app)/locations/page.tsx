"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus, Warehouse, Store, Archive, X, Loader2,
  MapPin, Trash2, PackageSearch,
} from "lucide-react";
import { useLang } from "@/components/i18n/language-provider";
import { cn, formatNumber } from "@/lib/utils";

/* ── Types ────────────────────────────────────────────────────────────────── */

type LocationType = "warehouse" | "store" | "bin";

type Location = {
  id: string;
  name: string;
  type: LocationType;
  notes: string | null;
  created_at: string;
};

type ItemLocation = {
  id: string;
  item_id: string;
  location_id: string;
  qty: number;
  items: { id: string; name: string; sku: string; on_hand: number } | null;
};

type DbItem = { id: string; name: string; sku: string };

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const TYPE_ICON: Record<LocationType, React.ReactNode> = {
  warehouse: <Warehouse className="h-5 w-5" />,
  store:     <Store className="h-5 w-5" />,
  bin:       <Archive className="h-5 w-5" />,
};

const TYPE_LABEL: Record<LocationType, { tr: string; en: string }> = {
  warehouse: { tr: "Depo",    en: "Warehouse" },
  store:     { tr: "Mağaza",  en: "Store" },
  bin:       { tr: "Raf",     en: "Bin" },
};

const FILTERS = ["all", "warehouse", "store", "bin"] as const;
type Filter = (typeof FILTERS)[number];

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function LocationsPage() {
  const { lang } = useLang();

  const [locations, setLocations]     = useState<Location[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<Filter>("all");
  const [selected, setSelected]       = useState<Location | null>(null);
  const [locItems, setLocItems]       = useState<ItemLocation[]>([]);
  const [locItemsLoading, setLocItemsLoading] = useState(false);

  /* Add-location form */
  const [showAddLoc, setShowAddLoc]   = useState(false);
  const [locForm, setLocForm]         = useState({ name: "", type: "warehouse" as LocationType, notes: "" });
  const [locSaving, setLocSaving]     = useState(false);

  /* Assign-item inline form */
  const [showAssign, setShowAssign]   = useState(false);
  const [allItems, setAllItems]       = useState<DbItem[]>([]);
  const [assignForm, setAssignForm]   = useState({ item_id: "", qty: 1 });
  const [assignSaving, setAssignSaving] = useState(false);

  /* Fetch */
  const fetchLocations = useCallback(async () => {
    const r = await fetch("/api/locations");
    if (r.ok) setLocations(await r.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchLocations(); }, [fetchLocations]);

  async function selectLoc(loc: Location) {
    setSelected(loc);
    setShowAssign(false);
    setLocItems([]);
    setLocItemsLoading(true);
    const r = await fetch(`/api/item-locations?location_id=${loc.id}`);
    if (r.ok) setLocItems(await r.json());
    setLocItemsLoading(false);
  }

  /* Add location */
  async function saveLocation() {
    if (!locForm.name.trim()) return;
    setLocSaving(true);
    const r = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(locForm),
    });
    setLocSaving(false);
    if (r.ok) {
      setShowAddLoc(false);
      setLocForm({ name: "", type: "warehouse", notes: "" });
      fetchLocations();
    }
  }

  /* Delete location */
  async function deleteLoc(id: string) {
    if (!confirm(lang === "tr" ? "Bu konumu silmek istediğinize emin misiniz?" : "Delete this location?")) return;
    await fetch(`/api/locations/${id}`, { method: "DELETE" });
    setSelected(null);
    fetchLocations();
  }

  /* Assign item to location */
  async function openAssign() {
    if (allItems.length === 0) {
      const r = await fetch("/api/items");
      if (r.ok) setAllItems(await r.json());
    }
    setAssignForm({ item_id: "", qty: 1 });
    setShowAssign(true);
  }

  async function saveAssign() {
    if (!selected || !assignForm.item_id) return;
    setAssignSaving(true);
    await fetch("/api/item-locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: assignForm.item_id,
        location_id: selected.id,
        qty: assignForm.qty,
      }),
    });
    setAssignSaving(false);
    setShowAssign(false);
    const r = await fetch(`/api/item-locations?location_id=${selected.id}`);
    if (r.ok) setLocItems(await r.json());
  }

  /* Derived */
  const filtered = useMemo(
    () => filter === "all" ? locations : locations.filter((l) => l.type === filter),
    [locations, filter],
  );

  const totalUnits = useMemo(
    () => locItems.reduce((s, li) => s + li.qty, 0),
    [locItems],
  );

  /* ── Render ─────────────────────────────────────────────────────────────── */

  return (
    <div className="mx-auto max-w-[1300px] animate-fade-in space-y-6">

      {/* Add location modal */}
      {showAddLoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-pop">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {lang === "tr" ? "Konum Ekle" : "Add Location"}
              </h2>
              <button
                onClick={() => setShowAddLoc(false)}
                className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  {lang === "tr" ? "Ad" : "Name"}
                </label>
                <input
                  type="text"
                  value={locForm.name}
                  onChange={(e) => setLocForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={lang === "tr" ? "ör. Ana Depo, Raf A-1" : "e.g. Main Warehouse, Shelf A-1"}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">
                  {lang === "tr" ? "Tip" : "Type"}
                </label>
                <select
                  value={locForm.type}
                  onChange={(e) => setLocForm((f) => ({ ...f, type: e.target.value as LocationType }))}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="warehouse">{lang === "tr" ? "Depo" : "Warehouse"}</option>
                  <option value="store">{lang === "tr" ? "Mağaza" : "Store"}</option>
                  <option value="bin">{lang === "tr" ? "Raf" : "Bin"}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  {lang === "tr" ? "Notlar (isteğe bağlı)" : "Notes (optional)"}
                </label>
                <input
                  type="text"
                  value={locForm.notes}
                  onChange={(e) => setLocForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder={lang === "tr" ? "ör. Zemin kat, soğuk depo" : "e.g. Ground floor, cold storage"}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowAddLoc(false)}
                  className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-[13px] font-medium hover:bg-muted"
                >
                  {lang === "tr" ? "İptal" : "Cancel"}
                </button>
                <button
                  onClick={saveLocation}
                  disabled={locSaving || !locForm.name.trim()}
                  className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {locSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {lang === "tr" ? "Kaydet" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {lang === "tr" ? "Konumlar" : "Locations"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {lang === "tr"
              ? "Raf, depo ve mağazalarındaki stok dağılımı."
              : "Track stock across your bins, warehouses and stores."}
          </p>
        </div>
        <button
          onClick={() => setShowAddLoc(true)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {lang === "tr" ? "Konum ekle" : "Add location"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all"
              ? lang === "tr" ? "Tümü" : "All"
              : TYPE_LABEL[f as LocationType][lang]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <MapPin className="mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-display text-lg font-semibold">
            {lang === "tr" ? "Henüz konum yok" : "No locations yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {lang === "tr"
              ? "İlk konumunu ekle ve stok dağılımını takip et."
              : "Add your first location to start tracking stock distribution."}
          </p>
          <button
            onClick={() => setShowAddLoc(true)}
            className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {lang === "tr" ? "Konum ekle" : "Add location"}
          </button>
        </div>
      ) : (
        <div className={cn("grid gap-6", selected ? "lg:grid-cols-[1fr_400px]" : "grid-cols-1")}>

          {/* Location cards */}
          <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((loc) => {
              const isSel = selected?.id === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => isSel ? setSelected(null) : selectLoc(loc)}
                  className={cn(
                    "rounded-2xl border bg-card p-4 text-left shadow-soft transition-all hover:shadow-pop",
                    isSel ? "border-primary bg-primary/[0.03]" : "border-border",
                  )}
                >
                  <div className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl",
                    isSel ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {TYPE_ICON[loc.type]}
                  </div>
                  <p className="mt-3 truncate font-semibold leading-tight">{loc.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{TYPE_LABEL[loc.type][lang]}</p>
                  {loc.notes && (
                    <p className="mt-1 truncate text-[11.5px] text-muted-foreground/60">{loc.notes}</p>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setShowAddLoc(true)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[13px] font-medium">
                {lang === "tr" ? "Konum ekle" : "Add location"}
              </span>
            </button>
          </div>

          {/* Detail panel */}
          {selected && (
            <aside className="animate-float-up lg:sticky lg:top-2 lg:self-start">
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-soft">

                {/* Panel header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                      {TYPE_ICON[selected.type]}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-lg font-semibold">{selected.name}</h2>
                      <p className="text-[12px] text-muted-foreground">{TYPE_LABEL[selected.type][lang]}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => deleteLoc(selected.id)}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { setSelected(null); setShowAssign(false); }}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {selected.notes && (
                  <p className="rounded-xl bg-muted/50 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                    {selected.notes}
                  </p>
                )}

                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "tr" ? "Ürün çeşidi" : "Item types"}
                    </p>
                    <p className="mt-1 tnum text-[15px] font-bold leading-none">{formatNumber(locItems.length)}</p>
                  </div>
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "tr" ? "Toplam adet" : "Total units"}
                    </p>
                    <p className="mt-1 tnum text-[15px] font-bold leading-none">{formatNumber(totalUnits)}</p>
                  </div>
                </div>

                {/* Stock list */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {lang === "tr" ? "Stok" : "Stock"}
                    </p>
                    <button
                      onClick={openAssign}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {lang === "tr" ? "Ürün ata" : "Assign item"}
                    </button>
                  </div>

                  {locItemsLoading ? (
                    <div className="flex h-12 items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : locItems.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <PackageSearch className="mb-2 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-[12px] text-muted-foreground">
                        {lang === "tr" ? "Bu konumda ürün yok." : "No items in this location."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {locItems.map((li) => (
                        <div
                          key={li.id}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold">{li.items?.name ?? "—"}</p>
                            <p className="font-mono text-[11px] text-muted-foreground">{li.items?.sku ?? "—"}</p>
                          </div>
                          <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-bold text-primary">
                            {formatNumber(li.qty)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assign item form (inline) */}
                {showAssign && (
                  <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-[13px] font-medium">
                      {lang === "tr" ? "Ürün Ata / Güncelle" : "Assign / Update Stock"}
                    </p>
                    <select
                      value={assignForm.item_id}
                      onChange={(e) => setAssignForm((f) => ({ ...f, item_id: e.target.value }))}
                      className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">{lang === "tr" ? "— Ürün seç —" : "— Select item —"}</option>
                      {allItems.map((it) => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        value={assignForm.qty}
                        onChange={(e) => setAssignForm((f) => ({ ...f, qty: Number(e.target.value) }))}
                        placeholder={lang === "tr" ? "Adet" : "Qty"}
                        className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <button
                        onClick={saveAssign}
                        disabled={assignSaving || !assignForm.item_id}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {assignSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {lang === "tr" ? "Kaydet" : "Save"}
                      </button>
                      <button
                        onClick={() => setShowAssign(false)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
