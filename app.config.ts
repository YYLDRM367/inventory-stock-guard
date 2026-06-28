/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  app.config.ts — the single source of truth for this starter.            │
 * │                                                                          │
 * │  CRATE — simple inventory & warehouse management for SMBs: track stock,  │
 * │  locations, low-stock alerts and reorders. Modeled on sortly.com and     │
 * │  inflowinventory.com (clean, visual, practical light B2B).               │
 * │                                                                          │
 * │  Every user-facing string is bilingual: { tr: "...", en: "..." }.        │
 * │  The guided setup (run `/setup`, or say "bu projeyi kur") edits this      │
 * │  file plus app/globals.css and .env.local.                               │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import type { L } from "@/lib/i18n/config";

export type IconName = string;

export interface NavItem {
  label: L;
  href: string;
  icon: IconName;
  /** A small count/alert pill shown on the right of the nav row. */
  badge?: L;
  /** "Coming soon" — rendered non-navigating + dimmed. */
  muted?: boolean;
}

export interface NavGroup {
  label: L;
  items: NavItem[];
}

export interface Feature {
  icon: IconName;
  title: L;
  body: L;
}

export interface Stat {
  value: string;
  label: L;
}

export interface PricingTier {
  name: string;
  price: string;
  period?: L;
  tagline: L;
  features: L[];
  cta: L;
  featured?: boolean;
}

export interface FaqItem {
  q: L;
  a: L;
}

export interface Integration {
  key: string;
  name: string;
  envVars: string[];
  required: boolean;
  docsUrl: string;
  purpose: string;
}

export interface AppConfig {
  name: string;
  tagline: L;
  description: L;
  domain: string;
  logoText: string;
  accentName: string;
  marketing: {
    badge: L;
    heroTitle: L;
    /** Accent line shown as the gradient tail of the hero title. */
    heroAccent: L;
    heroSubtitle: L;
    heroCtaPrimary: L;
    heroCtaSecondary: L;
    features: Feature[];
    stats: Stat[];
    pricing: PricingTier[];
    faq: FaqItem[];
  };
  /** Flat list — used by the topbar to resolve the current page title. */
  nav: NavItem[];
  /** Grouped list — drives the dashboard sidebar. */
  navGroups: NavGroup[];
  integrations: Integration[];
}

export const appConfig: AppConfig = {
  name: "Inventory Stock Guard",
  tagline: {
    tr: "Stoğunu koru. Hiç tükenme.",
    en: "Guard your stock. Never run out.",
  },
  description: {
    tr: "KOBİ'ler için basit stok ve depo yönetimi. Stok takibi, konumlar, düşük stok uyarıları ve yeniden sipariş — tek temiz panelde.",
    en: "Simple inventory & warehouse management for SMBs. Track stock, locations, low-stock alerts and reorders — in one clean panel.",
  },
  domain: "crate.app",
  logoText: "ISG",
  accentName: "blue",

  marketing: {
    badge: { tr: "Stok yönetimi · KOBİ'ler için", en: "Inventory management · for SMBs" },
    heroTitle: {
      tr: "Neyin var, nerede ve",
      en: "Know what you have, where,",
    },
    heroAccent: {
      tr: "ne zaman sipariş vereceğini bil.",
      en: "and when to reorder.",
    },
    heroSubtitle: {
      tr: "Inventory Stock Guard stoklarını, konumlarını ve yeniden sipariş noktalarını tek yerde tutar. Bir şey azaldığında uyarır — tablo karmaşası ya da tahmin yok.",
      en: "Inventory Stock Guard keeps your stock, locations and reorder points in one place. It alerts you the moment something runs low — no spreadsheet chaos, no guessing.",
    },
    heroCtaPrimary: { tr: "Ücretsiz başla", en: "Start free" },
    heroCtaSecondary: { tr: "Demoyu gör", en: "See the demo" },
    features: [
      { icon: "boxes", title: { tr: "Gerçek-zamanlı stok", en: "Real-time stock" }, body: { tr: "Her kalemin eldeki miktarı, ayrıldığı ve gelen miktarı anında güncel — tüm konumlarda.", en: "On-hand, allocated and incoming counts stay live for every item, across every location." } },
      { icon: "bell-ring", title: { tr: "Düşük stok uyarıları", en: "Low-stock alerts" }, body: { tr: "Bir kalem yeniden sipariş noktasının altına düştüğünde Crate seni uyarır ve siparişi hazırlar.", en: "When an item drops below its reorder point, Crate flags it and drafts the purchase order for you." } },
      { icon: "warehouse", title: { tr: "Çoklu konum", en: "Multi-location" }, body: { tr: "Raf, depo ve mağazaları takip et. Bir kalemin her zerresinin nerede olduğunu bil.", en: "Track bins, warehouses and stores. Know where every unit of an item lives." } },
      { icon: "scan-barcode", title: { tr: "Barkod & QR", en: "Barcode & QR" }, body: { tr: "Her kaleme bir barkod/QR oluştur, telefonla okut, sayım yaparken miktarı anında düzelt.", en: "Generate a barcode/QR per item, scan with your phone, and adjust quantities on the spot." } },
      { icon: "clipboard-list", title: { tr: "Satın alma siparişleri", en: "Purchase orders" }, body: { tr: "Tedarikçi başına sipariş oluştur, mal gelince stoğu otomatik artır.", en: "Raise POs per supplier and receive stock back in automatically when goods arrive." } },
      { icon: "bar-chart-3", title: { tr: "Raporlar", en: "Reports" }, body: { tr: "Stok değeri, hareket hızı ve tedarikçi performansı — dışa aktarılabilir, temiz raporlar.", en: "Stock value, movement velocity and supplier performance — clean, exportable reports." } },
    ],
    stats: [
      { value: "5 dk", label: { tr: "kurulum", en: "to set up" } },
      { value: "0", label: { tr: "tablo gerekir", en: "spreadsheets needed" } },
      { value: "∞", label: { tr: "konum", en: "locations" } },
      { value: "100%", label: { tr: "senin verin", en: "your data" } },
    ],
    pricing: [
      {
        name: "Starter",
        price: "$0",
        period: { tr: "/ay", en: "/mo" },
        tagline: { tr: "Tek mağaza, küçük katalog.", en: "One store, a small catalog." },
        features: [
          { tr: "100 kaleme kadar", en: "Up to 100 items" },
          { tr: "1 konum", en: "1 location" },
          { tr: "Düşük stok uyarıları", en: "Low-stock alerts" },
          { tr: "Barkod/QR oluşturma", en: "Barcode/QR generation" },
        ],
        cta: { tr: "Başla", en: "Get started" },
      },
      {
        name: "Growth",
        price: "$39",
        period: { tr: "/ay", en: "/mo" },
        tagline: { tr: "Büyüyen, çoklu konumlu işletme.", en: "A growing, multi-location business." },
        features: [
          { tr: "Sınırsız kalem", en: "Unlimited items" },
          { tr: "5 konuma kadar", en: "Up to 5 locations" },
          { tr: "Satın alma siparişleri", en: "Purchase orders" },
          { tr: "CSV içe/dışa aktarım", en: "CSV import / export" },
          { tr: "5 ekip üyesi", en: "5 team members" },
        ],
        cta: { tr: "Ücretsiz dene", en: "Start free trial" },
        featured: true,
      },
      {
        name: "Business",
        price: "—",
        tagline: { tr: "Çok depolu operasyonlar için.", en: "For multi-warehouse operations." },
        features: [
          { tr: "Growth'taki her şey", en: "Everything in Growth" },
          { tr: "Sınırsız konum", en: "Unlimited locations" },
          { tr: "Roller & denetim kaydı", en: "Roles & audit log" },
          { tr: "Shopify/WooCommerce sync", en: "Shopify/WooCommerce sync" },
          { tr: "Özel destek", en: "Dedicated support" },
        ],
        cta: { tr: "Satışla görüş", en: "Contact sales" },
      },
    ],
    faq: [
      { q: { tr: "Denemek için API anahtarı gerekli mi?", en: "Do I need any API keys to try it?" }, a: { tr: "Hayır. Crate gerçekçi örnek bir katalog, stok ve konumlarla demo modda açılır — hemen tıklayabilirsin.", en: "No. Crate boots in demo mode with a realistic sample catalog, stock and locations so you can click around immediately." } },
      { q: { tr: "Tablolarımı taşıyabilir miyim?", en: "Can I bring my spreadsheet?" }, a: { tr: "Evet — CSV içe aktarım kalemlerini, SKU'larını, miktarlarını ve yeniden sipariş noktalarını tek seferde alır.", en: "Yes — CSV import pulls your items, SKUs, quantities and reorder points in one pass." } },
      { q: { tr: "Düşük stok uyarıları nasıl çalışır?", en: "How do low-stock alerts work?" }, a: { tr: "Her kaleme bir yeniden sipariş noktası belirlersin. Eldeki miktar altına düştüğünde kalem uyarı paneline düşer ve sana bir taslak sipariş önerilir.", en: "You set a reorder point per item. When on-hand falls below it, the item lands in the alerts panel and a draft purchase order is suggested." } },
      { q: { tr: "Telefonla barkod okutabilir miyim?", en: "Can I scan barcodes with my phone?" }, a: { tr: "Evet. Her kalem bir barkod/QR alır; telefon kameranla okutup stoğu anında düzeltebilirsin.", en: "Yes. Every item gets a barcode/QR; scan it with your phone camera and adjust stock on the spot." } },
      { q: { tr: "Birden fazla depoyu yönetir mi?", en: "Does it handle multiple warehouses?" }, a: { tr: "Konum başına stok takip edilir — raf, depo ya da mağaza. Bir kalemin her birim nerede, görürsün.", en: "Stock is tracked per location — bin, warehouse or store. You see where every unit of an item is." } },
      { q: { tr: "Mağazama bağlanır mı?", en: "Does it connect to my store?" }, a: { tr: "İsteğe bağlı Shopify/WooCommerce senkronizasyonu satış olduğunda stoğu düşürür; kurulumda anahtarını eklersin.", en: "Optional Shopify/WooCommerce sync decrements stock on a sale; you add your key during setup." } },
      { q: { tr: "Teknoloji nedir?", en: "What's the stack?" }, a: { tr: "Next.js 16 (App Router), React 19, Tailwind v4. Vendor kilidi yok — standart bir Next.js uygulaması.", en: "Next.js 16 (App Router), React 19, Tailwind v4. No vendor lock-in — a standard Next.js app." } },
      { q: { tr: "Yayına alabilir miyim?", en: "Can I deploy it?" }, a: { tr: "Evet — Vercel'e veya herhangi bir Node sunucusuna gönder, aynı env değişkenlerini ekle.", en: "Yes — push to Vercel or any Node host and add the same env vars there." } },
    ],
  },

  nav: [
    { label: { tr: "Pano", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
    { label: { tr: "Kalemler", en: "Items" }, href: "/items", icon: "boxes" },
    { label: { tr: "Satın alma", en: "Purchase orders" }, href: "/purchase-orders", icon: "clipboard-list" },
    { label: { tr: "Konumlar", en: "Locations" }, href: "/locations", icon: "warehouse", muted: true },
    { label: { tr: "Raporlar", en: "Reports" }, href: "/reports", icon: "bar-chart-3" },
    { label: { tr: "Tedarikçiler", en: "Suppliers" }, href: "/suppliers", icon: "truck" },
    { label: { tr: "Ayarlar", en: "Settings" }, href: "/settings", icon: "settings" },
  ],

  navGroups: [
    {
      label: { tr: "Genel bakış", en: "Overview" },
      items: [
        { label: { tr: "Pano", en: "Dashboard" }, href: "/dashboard", icon: "layout-dashboard" },
      ],
    },
    {
      label: { tr: "Envanter", en: "Inventory" },
      items: [
        { label: { tr: "Kalemler", en: "Items" }, href: "/items", icon: "boxes" },
        { label: { tr: "Satın alma", en: "Purchase orders" }, href: "/purchase-orders", icon: "clipboard-list", badge: { tr: "3", en: "3" } },
        { label: { tr: "Konumlar", en: "Locations" }, href: "/locations", icon: "warehouse", muted: true },
      ],
    },
    {
      label: { tr: "İçgörü", en: "Insight" },
      items: [
        { label: { tr: "Raporlar", en: "Reports" }, href: "/reports", icon: "bar-chart-3" },
        { label: { tr: "Tedarikçiler", en: "Suppliers" }, href: "/suppliers", icon: "truck" },
      ],
    },
  ],

  integrations: [
    {
      key: "supabase",
      name: "Supabase",
      envVars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      required: false,
      docsUrl: "https://supabase.com/dashboard/project/_/settings/api",
      purpose: "Database & auth for your catalog, stock and movements. Without it, the app runs in demo mode.",
    },
    {
      key: "barcode",
      name: "Barcode Lookup",
      envVars: ["BARCODE_LOOKUP_API_KEY"],
      required: false,
      docsUrl: "https://www.barcodelookup.com/api",
      purpose: "Auto-fill item name, brand and category from a scanned barcode/UPC. Optional.",
    },
    {
      key: "shopify",
      name: "Shopify",
      envVars: ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_API_TOKEN"],
      required: false,
      docsUrl: "https://shopify.dev/docs/api/admin",
      purpose: "Sync stock with your storefront — decrement on each sale. Optional.",
    },
    {
      key: "woocommerce",
      name: "WooCommerce",
      envVars: ["WOOCOMMERCE_URL", "WOOCOMMERCE_CONSUMER_KEY", "WOOCOMMERCE_CONSUMER_SECRET"],
      required: false,
      docsUrl: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
      purpose: "Alternative storefront sync for WordPress/WooCommerce shops. Optional.",
    },
  ],
};

export default appConfig;
