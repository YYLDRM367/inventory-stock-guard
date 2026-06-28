/**
 * Demo data — what makes Crate feel alive with zero API keys. Labels are
 * bilingual ({ tr, en }); the UI resolves them to the active language. Proper
 * nouns (item names, SKUs, supplier names, locations) stay as-is. Replace with
 * real Supabase queries once setup wires your integrations.
 *
 * The domain: an SMB inventory & warehouse system. Items have a SKU, category,
 * on-hand quantity, reorder point, a per-location split, a unit cost and a
 * computed stock value. Movements log every in/out. Purchase orders restock.
 */
import type { L } from "@/lib/i18n/config";

export type StockState = "in" | "low" | "out";

export interface CategoryDef {
  key: string;
  label: L;
  color: string;
  /** lucide icon name for the category */
  icon: string;
}

export const categories: CategoryDef[] = [
  { key: "tools", label: { tr: "El aletleri", en: "Hand tools" }, color: "var(--cat-1)", icon: "wrench" },
  { key: "electrical", label: { tr: "Elektrik", en: "Electrical" }, color: "var(--cat-2)", icon: "zap" },
  { key: "fasteners", label: { tr: "Bağlantı elemanları", en: "Fasteners" }, color: "var(--cat-3)", icon: "nut" },
  { key: "safety", label: { tr: "İş güvenliği", en: "Safety gear" }, color: "var(--cat-5)", icon: "hard-hat" },
  { key: "packaging", label: { tr: "Ambalaj", en: "Packaging" }, color: "var(--cat-4)", icon: "package" },
  { key: "fluids", label: { tr: "Sıvılar", en: "Fluids" }, color: "var(--cat-6)", icon: "droplet" },
];

export const categoryByKey = (k: string) => categories.find((c) => c.key === k) ?? categories[0];

export interface LocationSplit {
  loc: string;
  qty: number;
}

export interface StockEvent {
  /** YYYY-MM-DD */
  date: string;
  qty: number;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: string;
  onHand: number;
  reorderPoint: number;
  /** suggested reorder amount when below the point */
  reorderQty: number;
  unitCost: number;
  /** retail/list price per unit (for margin display) */
  unitPrice: number;
  unit: L;
  supplier: string;
  /** per-location split (sums to onHand) */
  locations: LocationSplit[];
  /** last ~12 weeks of on-hand snapshots — the detail-drawer sparkline */
  history: StockEvent[];
  barcode: string;
}

/** Stock state derived from on-hand vs reorder point. */
export function stockStateOf(it: Pick<Item, "onHand" | "reorderPoint">): StockState {
  if (it.onHand <= 0) return "out";
  if (it.onHand <= it.reorderPoint) return "low";
  return "in";
}

function hist(base: number, drift: number[]): StockEvent[] {
  // build 10 weekly snapshots ending at `base`
  const out: StockEvent[] = [];
  let v = base - drift.reduce((a, b) => a + b, 0);
  const start = new Date("2026-04-05T00:00:00Z");
  for (let i = 0; i <= drift.length; i++) {
    const d = new Date(start.getTime() + i * 7 * 86400000);
    out.push({ date: d.toISOString().slice(0, 10), qty: Math.max(0, Math.round(v)) });
    if (i < drift.length) v += drift[i];
  }
  return out;
}

export const items: Item[] = [
  {
    id: "it1", sku: "TLS-DRL-18V", name: "18V Cordless Drill", category: "tools",
    onHand: 42, reorderPoint: 15, reorderQty: 40, unitCost: 58.0, unitPrice: 129.0,
    unit: { tr: "adet", en: "ea" }, supplier: "Maverick Tools",
    locations: [{ loc: "WH-A · A3", qty: 28 }, { loc: "WH-B · B1", qty: 9 }, { loc: "Store · Front", qty: 5 }],
    history: hist(42, [-3, 6, -4, 8, -6, 5, -2, 4, -2, 0]), barcode: "0 86423 91157 4",
  },
  {
    id: "it2", sku: "FAS-HEX-M8-100", name: "M8 Hex Bolt (box of 100)", category: "fasteners",
    onHand: 8, reorderPoint: 20, reorderQty: 60, unitCost: 4.2, unitPrice: 11.5,
    unit: { tr: "kutu", en: "box" }, supplier: "Ironline Supply",
    locations: [{ loc: "WH-A · F7", qty: 8 }],
    history: hist(8, [-4, 2, -6, 3, -5, 4, -8, 2, -4, 0]), barcode: "0 31142 55208 9",
  },
  {
    id: "it3", sku: "ELE-CBL-2.5-50", name: "2.5mm² Cable Reel · 50m", category: "electrical",
    onHand: 23, reorderPoint: 10, reorderQty: 25, unitCost: 31.0, unitPrice: 64.0,
    unit: { tr: "makara", en: "reel" }, supplier: "Volt & Wire Co.",
    locations: [{ loc: "WH-B · E2", qty: 18 }, { loc: "WH-A · E2", qty: 5 }],
    history: hist(23, [4, -2, 3, -5, 2, 6, -3, 4, -2, 0]), barcode: "0 70877 33419 2",
  },
  {
    id: "it4", sku: "SAF-GLV-NIT-M", name: "Nitrile Gloves · M (box of 50)", category: "safety",
    onHand: 0, reorderPoint: 12, reorderQty: 48, unitCost: 6.8, unitPrice: 15.0,
    unit: { tr: "kutu", en: "box" }, supplier: "GuardWell PPE",
    locations: [],
    history: hist(0, [-6, 4, -5, 3, -7, 2, -4, -3, -2, 0]), barcode: "0 84119 60273 5",
  },
  {
    id: "it5", sku: "PKG-BOX-M-25", name: "Medium Shipping Box (pack 25)", category: "packaging",
    onHand: 64, reorderPoint: 20, reorderQty: 50, unitCost: 9.5, unitPrice: 22.0,
    unit: { tr: "paket", en: "pack" }, supplier: "BoxCraft",
    locations: [{ loc: "WH-A · P1", qty: 40 }, { loc: "WH-A · P2", qty: 24 }],
    history: hist(64, [8, -10, 6, -8, 10, -6, 8, -4, 6, 0]), barcode: "0 99482 11630 7",
  },
  {
    id: "it6", sku: "FLU-OIL-SAE10-20L", name: "Hydraulic Oil SAE10 · 20L", category: "fluids",
    onHand: 6, reorderPoint: 8, reorderQty: 16, unitCost: 41.0, unitPrice: 78.0,
    unit: { tr: "bidon", en: "drum" }, supplier: "Northgate Fluids",
    locations: [{ loc: "WH-B · H4", qty: 6 }],
    history: hist(6, [2, -3, 1, -4, 2, -2, 3, -3, 1, 0]), barcode: "0 52310 88471 0",
  },
  {
    id: "it7", sku: "TLS-WRN-SET", name: "Combination Wrench Set · 12pc", category: "tools",
    onHand: 31, reorderPoint: 10, reorderQty: 20, unitCost: 24.0, unitPrice: 49.0,
    unit: { tr: "set", en: "set" }, supplier: "Maverick Tools",
    locations: [{ loc: "WH-A · A1", qty: 20 }, { loc: "Store · Wall", qty: 11 }],
    history: hist(31, [3, -2, 4, -3, 2, -1, 3, -2, 2, 0]), barcode: "0 86423 77042 6",
  },
  {
    id: "it8", sku: "ELE-LED-9W-10", name: "9W LED Bulb (pack of 10)", category: "electrical",
    onHand: 14, reorderPoint: 15, reorderQty: 30, unitCost: 7.2, unitPrice: 18.0,
    unit: { tr: "paket", en: "pack" }, supplier: "Volt & Wire Co.",
    locations: [{ loc: "WH-B · E5", qty: 14 }],
    history: hist(14, [5, -3, 4, -6, 2, -4, 3, -5, 2, 0]), barcode: "0 70877 90155 3",
  },
  {
    id: "it9", sku: "SAF-HLM-WHT", name: "Safety Helmet · White", category: "safety",
    onHand: 27, reorderPoint: 10, reorderQty: 24, unitCost: 11.0, unitPrice: 26.0,
    unit: { tr: "adet", en: "ea" }, supplier: "GuardWell PPE",
    locations: [{ loc: "WH-A · S2", qty: 18 }, { loc: "Store · Front", qty: 9 }],
    history: hist(27, [4, -2, 3, -3, 5, -2, 2, -1, 3, 0]), barcode: "0 84119 22087 1",
  },
  {
    id: "it10", sku: "FAS-SCR-WD-200", name: "Wood Screw 4×40 (box of 200)", category: "fasteners",
    onHand: 11, reorderPoint: 12, reorderQty: 40, unitCost: 5.6, unitPrice: 13.0,
    unit: { tr: "kutu", en: "box" }, supplier: "Ironline Supply",
    locations: [{ loc: "WH-A · F2", qty: 11 }],
    history: hist(11, [3, -4, 2, -3, 4, -5, 2, -3, 1, 0]), barcode: "0 31142 70391 8",
  },
  {
    id: "it11", sku: "PKG-TPE-48-36", name: "Packing Tape 48mm (case 36)", category: "packaging",
    onHand: 52, reorderPoint: 15, reorderQty: 36, unitCost: 12.0, unitPrice: 28.0,
    unit: { tr: "koli", en: "case" }, supplier: "BoxCraft",
    locations: [{ loc: "WH-A · P4", qty: 52 }],
    history: hist(52, [6, -4, 8, -6, 4, -3, 6, -2, 4, 0]), barcode: "0 99482 33810 4",
  },
  {
    id: "it12", sku: "FLU-GRS-CART-12", name: "Lithium Grease Cartridge (12)", category: "fluids",
    onHand: 19, reorderPoint: 8, reorderQty: 12, unitCost: 18.0, unitPrice: 39.0,
    unit: { tr: "kutu", en: "box" }, supplier: "Northgate Fluids",
    locations: [{ loc: "WH-B · H1", qty: 12 }, { loc: "WH-A · H1", qty: 7 }],
    history: hist(19, [2, -1, 3, -2, 2, -1, 2, -2, 1, 0]), barcode: "0 52310 41229 7",
  },
];

export const itemById = (id: string) => items.find((i) => i.id === id);

export function stockValueOf(it: Item) {
  return it.onHand * it.unitCost;
}

/* ── Top-line summary (the dashboard stat row) ─────────────────────────────── */
const totalItems = items.length;
const totalUnits = items.reduce((s, i) => s + i.onHand, 0);
const totalValue = items.reduce((s, i) => s + stockValueOf(i), 0);
const lowCount = items.filter((i) => stockStateOf(i) === "low").length;
const outCount = items.filter((i) => stockStateOf(i) === "out").length;

export const summary = {
  totalItems: { label: { tr: "Toplam kalem", en: "Total items" } as L, value: totalItems, sub: { tr: "aktif SKU", en: "active SKUs" } as L },
  totalValue: { label: { tr: "Stok değeri", en: "Stock value" } as L, value: totalValue, delta: 4.2, sub: { tr: "maliyet bazlı", en: "at cost" } as L },
  lowStock: { label: { tr: "Düşük stok", en: "Low-stock alerts" } as L, value: lowCount, sub: { tr: "sipariş noktası altında", en: "below reorder point" } as L },
  outOfStock: { label: { tr: "Tükendi", en: "Out of stock" } as L, value: outCount, sub: { tr: "şimdi sipariş ver", en: "reorder now" } as L },
  totalUnits,
};

/* ── Stock value over time (the area chart) ────────────────────────────────── */
export const stockValueTrend: { label: string; value: number }[] = [
  { label: "Apr 5", value: 9420 },
  { label: "Apr 12", value: 9810 },
  { label: "Apr 19", value: 9240 },
  { label: "Apr 26", value: 10120 },
  { label: "May 3", value: 10640 },
  { label: "May 10", value: 10110 },
  { label: "May 17", value: 10980 },
  { label: "May 24", value: 11320 },
  { label: "May 31", value: 10860 },
  { label: "Jun 7", value: Math.round(totalValue) },
];

export const stockValueMeta = {
  title: { tr: "Stok değeri", en: "Stock value" } as L,
  subtitle: { tr: "Son 10 hafta", en: "Last 10 weeks" } as L,
  delta: "+4.2%",
};

/* ── Locations / warehouses breakdown ──────────────────────────────────────── */
export interface LocationRow {
  id: string;
  name: L;
  code: string;
  units: number;
  value: number;
  itemCount: number;
}

export const locationsMeta = { title: { tr: "Konumlar", en: "Locations" } as L };

export const locations: LocationRow[] = [
  { id: "wha", name: { tr: "Ana Depo", en: "Main Warehouse" }, code: "WH-A", units: 198, value: 6240, itemCount: 9 },
  { id: "whb", name: { tr: "İkinci Depo", en: "Overflow Warehouse" }, code: "WH-B", units: 86, value: 2980, itemCount: 5 },
  { id: "store", name: { tr: "Mağaza Önü", en: "Store Front" }, code: "STORE", units: 25, value: 1180, itemCount: 3 },
];

/* ── Stock-movement log (in / out / adjust) ────────────────────────────────── */
export interface Movement {
  id: string;
  type: "in" | "out" | "adjust";
  sku: string;
  item: string;
  qty: number;
  loc: string;
  who: string;
  at: string;
  note: L;
}

export const movements: Movement[] = [
  { id: "m1", type: "out", sku: "PKG-BOX-M-25", item: "Medium Shipping Box", qty: -6, loc: "WH-A · P1", who: "Sam O.", at: "2026-06-14T08:42:00Z", note: { tr: "satış sevkiyatı #4821", en: "sales shipment #4821" } },
  { id: "m2", type: "in", sku: "TLS-DRL-18V", item: "18V Cordless Drill", qty: +40, loc: "WH-A · A3", who: "PO-1043", at: "2026-06-14T07:15:00Z", note: { tr: "Maverick Tools teslimatı", en: "Maverick Tools delivery" } },
  { id: "m3", type: "adjust", sku: "FAS-HEX-M8-100", item: "M8 Hex Bolt", qty: -2, loc: "WH-A · F7", who: "Dana K.", at: "2026-06-13T16:30:00Z", note: { tr: "sayım düzeltmesi", en: "cycle-count correction" } },
  { id: "m4", type: "out", sku: "SAF-GLV-NIT-M", item: "Nitrile Gloves · M", qty: -4, loc: "WH-A · S1", who: "Sam O.", at: "2026-06-13T14:05:00Z", note: { tr: "atölye kullanımı", en: "workshop consumption" } },
  { id: "m5", type: "out", sku: "ELE-CBL-2.5-50", item: "2.5mm² Cable Reel", qty: -3, loc: "WH-B · E2", who: "Job #221", at: "2026-06-13T11:20:00Z", note: { tr: "saha işine ayrıldı", en: "allocated to field job" } },
  { id: "m6", type: "in", sku: "PKG-TPE-48-36", item: "Packing Tape 48mm", qty: +36, loc: "WH-A · P4", who: "PO-1041", at: "2026-06-12T09:48:00Z", note: { tr: "BoxCraft teslimatı", en: "BoxCraft delivery" } },
  { id: "m7", type: "out", sku: "ELE-LED-9W-10", item: "9W LED Bulb", qty: -6, loc: "WH-B · E5", who: "Store", at: "2026-06-12T08:10:00Z", note: { tr: "mağaza transferi", en: "transfer to store" } },
  { id: "m8", type: "adjust", sku: "FLU-OIL-SAE10-20L", item: "Hydraulic Oil SAE10", qty: -1, loc: "WH-B · H4", who: "Dana K.", at: "2026-06-11T17:40:00Z", note: { tr: "hasarlı bidon", en: "damaged drum" } },
];

export const movementsMeta = { title: { tr: "Stok hareketleri", en: "Stock movement" } as L };

/* ── Purchase orders (the reorder mini-panel) ──────────────────────────────── */
export interface PurchaseOrder {
  id: string;
  number: string;
  supplier: string;
  status: "draft" | "sent" | "received" | "partial";
  lines: number;
  units: number;
  total: number;
  eta: string;
  createdAt: string;
}

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po1", number: "PO-1044", supplier: "GuardWell PPE", status: "draft", lines: 2, units: 96, total: 652.8, eta: "2026-06-20", createdAt: "2026-06-14" },
  { id: "po2", number: "PO-1043", supplier: "Maverick Tools", status: "received", lines: 1, units: 40, total: 2320.0, eta: "2026-06-14", createdAt: "2026-06-09" },
  { id: "po3", number: "PO-1042", supplier: "Ironline Supply", status: "sent", lines: 3, units: 160, total: 894.0, eta: "2026-06-18", createdAt: "2026-06-11" },
  { id: "po4", number: "PO-1041", supplier: "BoxCraft", status: "received", lines: 2, units: 72, total: 1548.0, eta: "2026-06-12", createdAt: "2026-06-07" },
  { id: "po5", number: "PO-1040", supplier: "Volt & Wire Co.", status: "partial", lines: 2, units: 55, total: 1184.0, eta: "2026-06-16", createdAt: "2026-06-06" },
];

export const purchaseOrdersMeta = { title: { tr: "Satın alma siparişleri", en: "Purchase orders" } as L };

/* ── Suppliers (used on PO page) ───────────────────────────────────────────── */
export interface Supplier {
  name: string;
  items: number;
  leadTimeDays: number;
  onTimePct: number;
}

export const suppliers: Supplier[] = [
  { name: "Maverick Tools", items: 2, leadTimeDays: 5, onTimePct: 98 },
  { name: "Ironline Supply", items: 2, leadTimeDays: 4, onTimePct: 95 },
  { name: "Volt & Wire Co.", items: 2, leadTimeDays: 7, onTimePct: 91 },
  { name: "GuardWell PPE", items: 2, leadTimeDays: 6, onTimePct: 88 },
  { name: "BoxCraft", items: 2, leadTimeDays: 3, onTimePct: 99 },
  { name: "Northgate Fluids", items: 2, leadTimeDays: 9, onTimePct: 84 },
];

/* ── Status label maps (shared by table cells / chips) ─────────────────────── */
export const STOCK_LABEL: Record<StockState, { tr: string; en: string; tone: string; dot: string }> = {
  in: { tr: "stokta", en: "in stock", tone: "text-success bg-success/10", dot: "var(--color-stock-in)" },
  low: { tr: "düşük", en: "low", tone: "text-warning-foreground bg-warning/15", dot: "var(--color-stock-low)" },
  out: { tr: "tükendi", en: "out", tone: "text-destructive bg-destructive/10", dot: "var(--color-stock-out)" },
};

export const PO_LABEL: Record<PurchaseOrder["status"], { tr: string; en: string; tone: string }> = {
  draft: { tr: "taslak", en: "draft", tone: "text-muted-foreground bg-muted" },
  sent: { tr: "gönderildi", en: "sent", tone: "text-info bg-info/12" },
  partial: { tr: "kısmi", en: "partial", tone: "text-warning-foreground bg-warning/15" },
  received: { tr: "teslim alındı", en: "received", tone: "text-success bg-success/10" },
};
