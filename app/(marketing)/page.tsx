"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  Quote,
  Star,
  ScanLine,
  TriangleAlert,
  Warehouse,
  Boxes,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Truck,
  Store,
  Building2,
  Wrench,
  PackageCheck,
} from "lucide-react";
import appConfig from "@/app.config";
import { Icon } from "@/components/ui/icon";
import { InventoryDemo } from "@/components/marketing/inventory-demo";
import { ProductPreview, CompanyMark } from "@/components/marketing/marks";
import { ItemThumb } from "@/components/app/item-thumb";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import type { L } from "@/lib/i18n/config";

/* ─────────────────────────────────────────────────────────────────────────────
   Local bilingual copy that doesn't belong in app.config.ts. Everything here is
   { tr, en } and resolved through the active language via tt().
   ───────────────────────────────────────────────────────────────────────────── */

const HERO_BENEFITS: L[] = [
  { tr: "Her kalemin eldeki, ayrılan ve gelen miktarı gerçek zamanlı", en: "Real-time on-hand, allocated and incoming for every item" },
  { tr: "Bir şey azaldığında otomatik düşük stok uyarısı ve taslak sipariş", en: "Automatic low-stock alerts and a draft PO the moment you run low" },
  { tr: "Çoklu konum, barkod/QR okutma ve CSV içe/dışa aktarım", en: "Multi-location, barcode/QR scanning and CSV import/export" },
];

const TRUSTED = ["Hearthside", "Forge", "Bramble", "Tideline", "Cobbler", "Maple", "Anvil", "Ridgeway"];

const HOW_STEPS: { n: string; icon: string; title: L; body: L }[] = [
  {
    n: "01",
    icon: "boxes",
    title: { tr: "Kalemleri ekle", en: "Add your items" },
    body: { tr: "Tek tek ekle ya da tablonu CSV ile içe aktar — SKU, miktar ve maliyet bir seferde gelir.", en: "Add them one by one or import your spreadsheet via CSV — SKUs, quantities and costs in one pass." },
  },
  {
    n: "02",
    icon: "bell-ring",
    title: { tr: "Sipariş noktası belirle", en: "Set reorder points" },
    body: { tr: "Her kaleme bir eşik ver. Stok altına düştüğünde Crate seni uyarır — tahmin yok.", en: "Give each item a threshold. When stock drops below it, Crate alerts you — no guessing." },
  },
  {
    n: "03",
    icon: "scan-barcode",
    title: { tr: "Okut & düzelt", en: "Scan & adjust" },
    body: { tr: "Telefonla barkodu okut, miktarı anında artır/azalt. Her hareket otomatik kaydedilir.", en: "Scan a barcode with your phone and bump quantities up or down. Every move is logged automatically." },
  },
  {
    n: "04",
    icon: "clipboard-list",
    title: { tr: "Uyarı al & sipariş ver", en: "Get alerts & reorder" },
    body: { tr: "Düşük stok paneli sipariş edilecekleri toplar; tek tıkla tedarikçi başına satın alma siparişi oluştur.", en: "The low-stock panel groups what to reorder; raise a per-supplier PO in one click." },
  },
];

const CATEGORY_CHIPS: { cat: string; label: L }[] = [
  { cat: "tools", label: { tr: "El aletleri", en: "Hand tools" } },
  { cat: "electrical", label: { tr: "Elektrik", en: "Electrical" } },
  { cat: "fasteners", label: { tr: "Bağlantı", en: "Fasteners" } },
  { cat: "safety", label: { tr: "İş güvenliği", en: "Safety" } },
  { cat: "packaging", label: { tr: "Ambalaj", en: "Packaging" } },
  { cat: "fluids", label: { tr: "Sıvılar", en: "Fluids" } },
];

type CompareValue = boolean | L | string;
const COMPARE: { feature: L; sheets: CompareValue; generic: CompareValue; crate: CompareValue }[] = [
  { feature: { tr: "Gerçek-zamanlı stok", en: "Real-time stock" }, sheets: false, generic: true, crate: true },
  { feature: { tr: "Düşük stok uyarıları", en: "Low-stock alerts" }, sheets: false, generic: { tr: "Manuel", en: "Manual" }, crate: true },
  { feature: { tr: "Çoklu konum", en: "Multi-location" }, sheets: { tr: "Dağınık", en: "Messy" }, generic: { tr: "Kısıtlı", en: "Limited" }, crate: true },
  { feature: { tr: "Barkod & QR okutma", en: "Barcode & QR scanning" }, sheets: false, generic: { tr: "Eklenti", en: "Add-on" }, crate: true },
  { feature: { tr: "Satın alma siparişleri", en: "Purchase orders" }, sheets: { tr: "Elle", en: "By hand" }, generic: true, crate: true },
  { feature: { tr: "Hareket kaydı / denetim", en: "Movement log / audit" }, sheets: false, generic: { tr: "Kısmi", en: "Partial" }, crate: true },
  { feature: { tr: "Kurulum süresi", en: "Setup time" }, sheets: { tr: "Sonsuz", en: "Endless" }, generic: { tr: "Günler", en: "Days" }, crate: { tr: "5 dakika", en: "5 minutes" } },
];

const TESTIMONIALS: { quote: L; name: string; role: L; initials: string; metric: L }[] = [
  { quote: { tr: "Tabloları bıraktık. İlk kez tüm raflarda ne olduğunu gerçekten biliyoruz — ve hiçbir şey bitmeden uyarı geliyor.", en: "We ditched the spreadsheets. For the first time we actually know what's on every shelf — and we get warned before anything runs out." }, name: "Dana Kim", role: { tr: "Operasyon · Forge", en: "Ops · Forge" }, initials: "DK", metric: { tr: "0 stok-dışı", en: "0 stockouts" } },
  { quote: { tr: "Telefonla barkod okutup sayım yapmak günleri dakikalara indirdi. Ekip bayıldı.", en: "Scanning barcodes on a phone turned our stock count from days into minutes. The team loves it." }, name: "Marcus Reed", role: { tr: "Depo · Anvil", en: "Warehouse · Anvil" }, initials: "MR", metric: { tr: "Günler → dakikalar", en: "Days → minutes" } },
  { quote: { tr: "Düşük stok paneli her sabah ne sipariş edeceğimi söylüyor. Tedarikçi başına tek tık.", en: "The low-stock panel tells me exactly what to reorder each morning. One click per supplier." }, name: "Priya Nair", role: { tr: "Satın alma · Bramble", en: "Purchasing · Bramble" }, initials: "PN", metric: { tr: "Haftada 6s tasarruf", en: "6h/wk saved" } },
  { quote: { tr: "Üç konumumuz var ve artık hangi raftaki hangi kalem olduğunu tek panelden görüyoruz.", en: "We run three locations and now see which item is on which shelf from a single panel." }, name: "Tom Walsh", role: { tr: "Kurucu · Cobbler", en: "Founder · Cobbler" }, initials: "TW", metric: { tr: "3 konum, tek görünüm", en: "3 sites, one view" } },
  { quote: { tr: "Stok değerini gerçek zamanlı görmek nakit akışını planlamayı çok kolaylaştırdı.", en: "Seeing stock value in real time made cash-flow planning so much easier." }, name: "Elif Yıldız", role: { tr: "Finans · Maple", en: "Finance · Maple" }, initials: "EY", metric: { tr: "%18 daha az fazla stok", en: "18% less overstock" } },
  { quote: { tr: "Bir öğleden sonrada kurduk, CSV'mizi içe aktardık ve aynı gün çalışmaya başladık.", en: "We set it up in an afternoon, imported our CSV, and were running the same day." }, name: "Sam Okafor", role: { tr: "Müdür · Tideline", en: "Manager · Tideline" }, initials: "SO", metric: { tr: "1 öğleden sonra", en: "1 afternoon" } },
];

const TRUST_POINTS: { icon: typeof ShieldCheck; title: L; body: L }[] = [
  { icon: ShieldCheck, title: { tr: "Senin verin, senin kontrolün", en: "Your data, your control" }, body: { tr: "Katalog ve stok kendi veritabanında. Dışa aktarabilir, taşıyabilirsin.", en: "Your catalog and stock live in your own database. Export and take it anywhere." } },
  { icon: ClipboardList, title: { tr: "Tam denetim kaydı", en: "Full audit trail" }, body: { tr: "Her giriş, çıkış ve düzeltme kim-ne-zaman ile kaydedilir.", en: "Every in, out and adjustment is logged with who and when." } },
  { icon: ScanLine, title: { tr: "Sahada çalışır", en: "Works in the field" }, body: { tr: "Telefon kamerasıyla okut; depoda ya da yolda stoğu güncelle.", en: "Scan with a phone camera; update stock in the aisle or on the road." } },
];

/* Who Crate is for — use-case cards. */
const USE_CASES: { icon: typeof Store; title: L; body: L }[] = [
  { icon: Store, title: { tr: "Perakende & mağazalar", en: "Retail & shops" }, body: { tr: "Raf stoğunu mağaza önü ve depo arasında takip et; satışla otomatik düş.", en: "Track shelf stock across store front and back room; decrement on each sale." } },
  { icon: Wrench, title: { tr: "Atölye & imalat", en: "Workshops & makers" }, body: { tr: "Hammadde ve sarf malzemesini izle, üretim durmadan zamanında sipariş ver.", en: "Track raw materials and consumables, reorder on time before production stalls." } },
  { icon: Building2, title: { tr: "Çok depolu işletmeler", en: "Multi-warehouse ops" }, body: { tr: "Onlarca raf ve birkaç depoyu tek görünümde, konum başına stokla yönet.", en: "Manage dozens of bins and several warehouses in one view, with per-location stock." } },
  { icon: Truck, title: { tr: "E-ticaret & toptan", en: "E-commerce & wholesale" }, body: { tr: "Shopify/WooCommerce ile senkronize ol, fazla satıştan kaçın.", en: "Sync with Shopify/WooCommerce and never oversell again." } },
];

/* Deep-dive alternating feature blocks. */
const DEEP_DIVE: { eyebrow: L; title: L; body: L; points: L[]; reverse?: boolean; panel: "alerts" | "scan" | "po" }[] = [
  {
    eyebrow: { tr: "Uyarılar", en: "Alerts" },
    title: { tr: "Bir şey bitmeden haberin olsun", en: "Know before you run out" },
    body: { tr: "Her kaleme bir yeniden sipariş noktası belirle. Eldeki miktar altına düştüğünde Crate kalemi uyarı paneline taşır ve tam ne kadar sipariş etmen gerektiğini önerir.", en: "Set a reorder point per item. When on-hand drops below it, Crate moves the item into the alerts panel and suggests exactly how much to reorder." },
    points: [
      { tr: "Kalem başına eşik ve önerilen sipariş miktarı", en: "Per-item threshold and suggested reorder quantity" },
      { tr: "Düşük ve tükendi durumları net renklerle", en: "Low and out-of-stock states in clear colors" },
      { tr: "Tek tıkla tedarikçi başına taslak sipariş", en: "One-click draft PO grouped by supplier" },
    ],
    panel: "alerts",
  },
  {
    eyebrow: { tr: "Okutma", en: "Scanning" },
    title: { tr: "Barkod & QR ile saniyede düzelt", en: "Adjust in seconds with barcode & QR" },
    body: { tr: "Her kalem otomatik bir barkod/QR alır. Telefon kameranla okut, miktarı +/- ile düzelt; her hareket kim-ne-zaman ile kaydedilir.", en: "Every item gets an auto-generated barcode/QR. Scan with your phone camera, adjust the quantity with +/-, and every move is logged with who and when." },
    points: [
      { tr: "Kalem başına yazdırılabilir barkod + QR etiketi", en: "Printable barcode + QR label per item" },
      { tr: "Sayımı saatlerden dakikalara indir", en: "Cut stock counts from hours to minutes" },
      { tr: "Otomatik hareket kaydı (giriş/çıkış/düzeltme)", en: "Automatic movement log (in/out/adjust)" },
    ],
    reverse: true,
    panel: "scan",
  },
  {
    eyebrow: { tr: "Sipariş", en: "Reorder" },
    title: { tr: "Tedarikçi başına satın alma siparişi", en: "Purchase orders per supplier" },
    body: { tr: "Düşük kalemleri tedarikçiye göre topla, tek satın alma siparişine dönüştür. Mal gelince teslim al — stok otomatik geri girer.", en: "Group low items by supplier and turn them into a single purchase order. Receive against it when goods arrive — stock flows back in automatically." },
    points: [
      { tr: "Taslak → gönderildi → teslim alındı akışı", en: "Draft → sent → received flow" },
      { tr: "Kısmi teslimat ve ETA takibi", en: "Partial receipts and ETA tracking" },
      { tr: "Tedarikçi teslim süresi ve zamanında teslim oranı", en: "Supplier lead time and on-time rate" },
    ],
    panel: "po",
  },
];

/* Integration logos for the strip. */
const INTEGRATIONS: { name: string; glyph: "db" | "scan" | "store"; sub: L }[] = [
  { name: "Supabase", glyph: "db", sub: { tr: "Veritabanı & auth", en: "Database & auth" } },
  { name: "Barcode Lookup", glyph: "scan", sub: { tr: "Barkoddan otomatik doldur", en: "Auto-fill from barcode" } },
  { name: "Shopify / Woo", glyph: "store", sub: { tr: "Mağaza stok senkronu", en: "Storefront stock sync" } },
];

export default function LandingPage() {
  const { t, lang } = useLang();
  const m = appConfig.marketing;
  const tt = (v: L) => v[lang];

  const sectionCopy = {
    demoTitle: { tr: "Miktarı değiştir, uyarının tetiklendiğini gör", en: "Adjust the quantity, watch the alert fire" } as L,
    demoSub: { tr: "Eldeki miktarı azalt; sipariş noktasının altına indiğinde Crate'in düşük stok uyarısı nasıl çalışıyor gör.", en: "Lower the on-hand count; see exactly how Crate's low-stock alert fires once it drops below the reorder point." } as L,
    featuresTitle: { tr: "Stoğunu yönetmek için ihtiyacın olan her şey", en: "Everything you need to run your stock" } as L,
    featuresSub: { tr: "Kalemlerden konumlara, uyarılardan satın alma siparişlerine — tek temiz panelde.", en: "From items to locations to alerts to purchase orders — in one clean panel." } as L,
    deepTitle: { tr: "Stoktan deftere kadar", en: "From the shelf to the ledger" } as L,
    deepSub: { tr: "Üç katman, tek panel: uyar, okut, yeniden sipariş ver.", en: "Three layers, one panel: alert, scan, reorder." } as L,
    howTitle: { tr: "Dört adımda kontrol", en: "In control in four steps" } as L,
    howSub: { tr: "Ekle, eşik belirle, okut, uyarı al. Crate aradaki her şeyi halleder.", en: "Add, set thresholds, scan, get alerts. Crate handles everything in between." } as L,
    catTitle: { tr: "Sattığın her şeyi takip et", en: "Track everything you stock" } as L,
    catSub: { tr: "El aletlerinden sıvılara — kategori, konum ve tedarikçiye göre düzenle.", en: "From hand tools to fluids — organize by category, location and supplier." } as L,
    useCasesTitle: { tr: "Crate kimler için?", en: "Who Crate is for" } as L,
    useCasesSub: { tr: "Fiziksel stok tutan her ekip için pratik bir akış.", en: "A practical flow for any team that holds physical stock." } as L,
    integrationsTitle: { tr: "Sevdiğin araçlarla çalışır", en: "Works with the tools you love" } as L,
    integrationsSub: { tr: "Supabase, barkod araması ve mağaza senkronunu dakikalar içinde bağla.", en: "Wire Supabase, barcode lookup and storefront sync in minutes." } as L,
    compareTitle: { tr: "Neden Crate?", en: "Why Crate?" } as L,
    compareSub: { tr: "Tablolar ve genel araçlarla karşılaştır.", en: "Compared to spreadsheets and generic tools." } as L,
    trustTitle: { tr: "Üzerine güvenebileceğin temel", en: "A foundation you can rely on" } as L,
    trustSub: { tr: "Verin sende, her hareket kayıtlı, sahada çalışır.", en: "Your data stays yours, every move is logged, and it works in the field." } as L,
    testimonialsTitle: { tr: "Operasyon ekipleri Crate'i seviyor", en: "Ops teams love Crate" } as L,
    testimonialsSub: { tr: "Fiziksel stok tutan işletmelerden.", en: "From businesses that hold physical stock." } as L,
    pricingTitle: { tr: "Basit, ölçeklenen fiyatlandırma", en: "Simple pricing that scales" } as L,
    pricingSub: { tr: "Ücretsiz başla. Kalem ve konum sayısına göre büyü.", en: "Start free. Grow by items and locations." } as L,
    popular: { tr: "En popüler", en: "Most popular" } as L,
    faqTitle: { tr: "Sıkça sorulanlar", en: "Frequently asked" } as L,
    faqSub: { tr: "Cevabını bulamadın mı? Ekibimize yaz.", en: "Can't find an answer? Reach our team." } as L,
    ctaTitle: { tr: "Stoğunun kontrolünü bugün ele al", en: "Take control of your stock today" } as L,
    ctaSub: { tr: "Anahtarsız demoyu aç, hazır olunca Supabase'i ve mağazanı bağla.", en: "Open the keyless demo, then wire Supabase and your store when you're ready." } as L,
  };

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left copy */}
          <div className="stagger">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-pill">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
              {t(m.badge)}
            </span>
            <h1 className="mt-5 max-w-xl font-display text-[40px] font-extrabold leading-[1.03] tracking-[-0.03em] sm:text-[56px]">
              {t(m.heroTitle)}{" "}
              <span className="bg-gradient-to-br from-[oklch(74%_0.14_75)] to-[oklch(62%_0.16_45)] bg-clip-text text-transparent">
                {t(m.heroAccent)}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-muted-foreground">{t(m.heroSubtitle)}</p>

            <ul className="mt-6 space-y-2.5">
              {HERO_BENEFITS.map((b) => (
                <li key={tt(b)} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {tt(b)}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
              >
                {t(m.heroCtaSecondary)}
              </a>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              {lang === "tr" ? "Kredi kartı gerekmez · Anahtarsız demo · 5 dakikada kurulum" : "No credit card · Keyless demo · 5-minute setup"}
            </p>
          </div>

          {/* Right floating product preview */}
          <div className="relative animate-float-up lg:pl-4">
            <div className="absolute -left-6 -top-6 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl drift" aria-hidden />
            <div className="absolute -bottom-8 -right-4 -z-10 h-44 w-44 rounded-full bg-[oklch(60%_0.12_240)]/10 blur-3xl" aria-hidden />
            <ProductPreview />
          </div>
        </div>

        {/* Trusted-by row */}
        <div className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-5 py-6">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {lang === "tr" ? "Stok tutan ekipler tarafından kullanılıyor" : "Used by teams that hold stock"}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
              {TRUSTED.map((c) => (
                <CompanyMark key={c} name={c} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-soft sm:grid-cols-4">
          {[
            { value: "12k+", label: { tr: "takip edilen kalem", en: "items tracked" } as L },
            { value: "3,400+", label: { tr: "aktif işletme", en: "active businesses" } as L },
            { value: "−31%", label: { tr: "stok-dışı olay", en: "fewer stockouts" } as L },
            { value: "5 dk", label: { tr: "ortalama kurulum", en: "avg setup" } as L },
          ].map((s) => (
            <div key={s.value} className="bg-card px-5 py-8 text-center">
              <p className="tnum font-display text-3xl font-extrabold tracking-tight">{s.value}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{tt(s.label)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ──────────────────────────────────────── */}
      <section id="demo" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="label-mono text-primary">{lang === "tr" ? "Canlı deneme" : "Live try-it"}</p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.demoTitle)}</h2>
            <p className="mt-3 max-w-md text-muted-foreground">{tt(sectionCopy.demoSub)}</p>
            <ul className="mt-6 space-y-2.5">
              {[
                { tr: "Stok çubuğu anlık güncellenir", en: "The stock bar updates instantly" },
                { tr: "Sipariş noktası altında uyarı tetiklenir", en: "An alert fires below the reorder point" },
                { tr: "Sıfırda 'tükendi' durumuna geçer", en: "It flips to 'out of stock' at zero" },
              ].map((p) => (
                <li key={p.en} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {lang === "tr" ? p.tr : p.en}
                </li>
              ))}
            </ul>
          </div>
          <InventoryDemo />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.featuresTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.featuresSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.map((f) => (
              <div key={tt(f.title)} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-pop">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{t(f.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(f.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEEP-DIVE FEATURE BLOCKS ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.deepTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.deepSub)}</p>
        </div>
        <div className="mt-14 space-y-16">
          {DEEP_DIVE.map((d) => (
            <div
              key={tt(d.title)}
              className={cn("grid items-center gap-10 lg:grid-cols-2", d.reverse && "lg:[&>*:first-child]:order-2")}
            >
              <div>
                <p className="label-mono text-primary">{tt(d.eyebrow)}</p>
                <h3 className="mt-2 max-w-md font-display text-2xl font-bold tracking-tight sm:text-3xl">{tt(d.title)}</h3>
                <p className="mt-3 max-w-md text-muted-foreground">{tt(d.body)}</p>
                <ul className="mt-5 space-y-2.5">
                  {d.points.map((p) => (
                    <li key={tt(p)} className="flex items-start gap-2.5 text-[15px]">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {tt(p)}
                    </li>
                  ))}
                </ul>
              </div>
              {/* an illustrative panel per block */}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <DeepPanel kind={d.panel} lang={lang} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.howTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.howSub)}</p>
          </div>
          <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon name={s.icon} className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-extrabold text-primary/20">{s.n}</span>
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">{tt(s.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(s.body)}</p>
                {i < HOW_STEPS.length - 1 && (
                  <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground lg:grid">
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES STRIP ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.catTitle)}</h2>
            <p className="mt-3 max-w-md text-muted-foreground">{tt(sectionCopy.catSub)}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((c) => (
                <span key={c.cat} className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-sm font-medium shadow-pill">
                  <ItemThumb category={c.cat} size={24} />
                  {tt(c.label)}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { cat: "tools", name: "18V Cordless Drill", sku: "TLS-DRL-18V", state: "in" as const, qty: 42 },
              { cat: "fasteners", name: "M8 Hex Bolt", sku: "FAS-HEX-M8-100", state: "low" as const, qty: 8 },
              { cat: "safety", name: "Nitrile Gloves · M", sku: "SAF-GLV-NIT-M", state: "out" as const, qty: 0 },
              { cat: "electrical", name: "2.5mm² Cable Reel", sku: "ELE-CBL-2.5-50", state: "in" as const, qty: 23 },
            ].map((it) => (
              <div key={it.sku} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <ItemThumb category={it.cat} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold tracking-tight">{it.name}</p>
                  <p className="tnum truncate text-xs text-muted-foreground">{it.sku}</p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    it.state === "in" ? "bg-success/10 text-success" : it.state === "low" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive",
                  )}
                >
                  <span className="tnum">{it.qty}</span>
                  {it.state === "in" ? (lang === "tr" ? "stokta" : "in") : it.state === "low" ? (lang === "tr" ? "düşük" : "low") : (lang === "tr" ? "tükendi" : "out")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.useCasesTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.useCasesSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => {
              const I = u.icon;
              return (
                <div key={tt(u.title)} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <I className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{tt(u.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(u.body)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS + CSV IMPORT ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="label-mono text-primary">{lang === "tr" ? "İçe aktarım" : "Import"}</p>
            <h2 className="mt-2 max-w-md font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "tr" ? "Tablonu getir, dakikalar içinde çalış" : "Bring your spreadsheet, run in minutes"}
            </h2>
            <p className="mt-3 max-w-md text-muted-foreground">
              {lang === "tr"
                ? "CSV içe aktarım kalemlerini, SKU'larını, miktarlarını, maliyetlerini ve yeniden sipariş noktalarını tek seferde alır. Eşle, önizle, içe aktar."
                : "CSV import pulls your items, SKUs, quantities, costs and reorder points in one pass. Map, preview, import."}
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                { tr: "Akıllı sütun eşleştirme", en: "Smart column mapping" },
                { tr: "İçe aktarmadan önce önizleme", en: "Preview before you import" },
                { tr: "Barkoddan otomatik kalem doldurma", en: "Auto-fill items from a barcode" },
              ].map((p) => (
                <li key={p.en} className="flex items-start gap-2.5 text-[15px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {lang === "tr" ? p.tr : p.en}
                </li>
              ))}
            </ul>
          </div>
          {/* CSV preview card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-pop">
            <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <PackageCheck className="h-4 w-4 text-primary" />
              <span className="font-mono text-[12px] text-muted-foreground">inventory-export.csv</span>
              <span className="ml-auto rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                {lang === "tr" ? "12 satır hazır" : "12 rows ready"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="label-mono px-3 py-2 font-medium">SKU</th>
                    <th className="label-mono px-3 py-2 font-medium">{lang === "tr" ? "İsim" : "Name"}</th>
                    <th className="label-mono px-3 py-2 text-right font-medium">{lang === "tr" ? "Adet" : "Qty"}</th>
                    <th className="label-mono px-3 py-2 text-right font-medium">{lang === "tr" ? "Nokta" : "RP"}</th>
                  </tr>
                </thead>
                <tbody className="tnum">
                  {[
                    ["TLS-DRL-18V", "18V Cordless Drill", "42", "15"],
                    ["FAS-HEX-M8-100", "M8 Hex Bolt", "8", "20"],
                    ["ELE-CBL-2.5-50", "Cable Reel 50m", "23", "10"],
                    ["SAF-GLV-NIT-M", "Nitrile Gloves M", "0", "12"],
                    ["PKG-BOX-M-25", "Medium Box ×25", "64", "20"],
                  ].map((r, i) => (
                    <tr key={r[0]} className={cn("border-b border-border/60 last:border-0", i % 2 === 1 && "bg-muted/20")}>
                      <td className="px-3 py-2 text-muted-foreground">{r[0]}</td>
                      <td className="px-3 py-2 font-sans font-medium">{r[1]}</td>
                      <td className="px-3 py-2 text-right font-semibold">{r[2]}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border p-3">
              <button className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
                {lang === "tr" ? "12 kalemi içe aktar" : "Import 12 items"}
              </button>
            </div>
          </div>
        </div>

        {/* Integration logos */}
        <div className="mt-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="font-display text-2xl font-bold tracking-tight">{tt(sectionCopy.integrationsTitle)}</h3>
            <p className="mt-2 text-muted-foreground">{tt(sectionCopy.integrationsSub)}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {INTEGRATIONS.map((it) => (
              <div key={it.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <IntegrationGlyph glyph={it.glyph} />
                <div>
                  <p className="font-semibold tracking-tight">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{tt(it.sub)}</p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {lang === "tr" ? "Hazır" : "Ready"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.compareTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.compareSub)}</p>
          </div>
          <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-4 text-left font-medium text-muted-foreground"></th>
                    <th className="px-5 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Tablolar" : "Spreadsheets"}</th>
                    <th className="px-5 py-4 text-center font-medium text-muted-foreground">{lang === "tr" ? "Genel araç" : "Generic tool"}</th>
                    <th className="bg-primary/[0.05] px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                        <Boxes className="h-4 w-4" />
                        {appConfig.name}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((row, i) => (
                    <tr key={tt(row.feature)} className={cn("border-b border-border/60 last:border-0", i % 2 === 1 && "bg-muted/20")}>
                      <td className="px-5 py-3.5 font-medium">{tt(row.feature)}</td>
                      <CompareCell value={row.sheets} lang={lang} />
                      <CompareCell value={row.generic} lang={lang} />
                      <CompareCell value={row.crate} lang={lang} highlight />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{tt(sectionCopy.trustTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.trustSub)}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TRUST_POINTS.map((s) => {
            const I = s.icon;
            return (
              <div key={tt(s.title)} className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <I className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{tt(s.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{tt(s.body)}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.testimonialsTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.testimonialsSub)}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((tm) => (
              <figure key={tm.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
                <Quote className="h-5 w-5 text-primary/30" />
                <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-foreground/90">
                  {tt(tm.quote)}
                </blockquote>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white" style={{ backgroundImage: "var(--grad-brand)" }}>
                    {tm.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <figcaption className="text-sm font-semibold leading-tight">{tm.name}</figcaption>
                    <p className="truncate text-xs text-muted-foreground">{tt(tm.role)}</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">{tt(tm.metric)}</span>
                </div>
              </figure>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-warning text-warning" />
            ))}
            <span className="ml-2">{lang === "tr" ? "4.9/5 · 3.400+ işletme" : "4.9/5 · 3,400+ businesses"}</span>
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.pricingTitle)}</h2>
          <p className="mt-3 text-muted-foreground">{tt(sectionCopy.pricingSub)}</p>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {m.pricing.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-7 shadow-soft",
                tier.featured ? "border-primary/40 shadow-pop ring-1 ring-primary/20" : "border-border",
              )}
            >
              {tier.featured && (
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <Star className="h-3 w-3 fill-current" />
                  {tt(sectionCopy.popular)}
                </span>
              )}
              <h3 className="font-semibold tracking-tight">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="tnum font-display text-4xl font-extrabold tracking-tight">{tier.price}</span>
                {tier.period && <span className="text-sm text-muted-foreground">{t(tier.period)}</span>}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(tier.tagline)}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={t(f)} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    {t(f)}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={cn(
                  "mt-7 inline-flex h-11 items-center justify-center rounded-xl text-sm font-semibold transition-all",
                  tier.featured
                    ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                    : "border border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {t(tier.cta)}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border">
        <div className="mx-auto max-w-3xl px-5 py-20">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{tt(sectionCopy.faqTitle)}</h2>
            <p className="mt-3 text-muted-foreground">{tt(sectionCopy.faqSub)}</p>
          </div>
          <div className="mt-10 space-y-3">
            {m.faq.map((f) => (
              <details key={t(f.q)} className="group rounded-xl border border-border bg-card px-5 py-4 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {t(f.q)}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-open:border-primary group-open:bg-primary group-open:text-primary-foreground">
                    <Plus className="h-3.5 w-3.5 group-open:hidden" />
                    <Minus className="hidden h-3.5 w-3.5 group-open:block" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center shadow-pop">
          <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: "var(--grad-hero)" }} aria-hidden />
          <span className="pointer-events-none absolute -left-10 top-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl drift" aria-hidden />
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-pill">
            <Warehouse className="h-4 w-4 text-primary" />
            <span>{lang === "tr" ? "Çoklu konum · canlı demo" : "Multi-location · live demo"}</span>
          </div>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{tt(sectionCopy.ctaTitle)}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{tt(sectionCopy.ctaSub)}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              {t(m.heroCtaPrimary)} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-7 text-[15px] font-semibold text-foreground shadow-pill transition-colors hover:bg-muted"
            >
              {lang === "tr" ? "Giriş yap" : "Sign in"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── Deep-dive illustrative panels ─────────────────────────────────────────── */
function DeepPanel({ kind, lang }: { kind: "alerts" | "scan" | "po"; lang: "tr" | "en" }) {
  if (kind === "alerts") {
    const rows = [
      { cat: "fasteners", name: "M8 Hex Bolt", qty: 8, rp: 20, tone: "warning" as const },
      { cat: "safety", name: "Nitrile Gloves · M", qty: 0, rp: 12, tone: "destructive" as const },
      { cat: "fluids", name: "Hydraulic Oil 20L", qty: 6, rp: 8, tone: "warning" as const },
    ];
    return (
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
            <ItemThumb category={r.cat} size={30} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">{r.name}</p>
              <p className="tnum text-[11px] text-muted-foreground">{r.qty} / {r.rp}</p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                r.tone === "warning" ? "bg-warning/15 text-warning-foreground" : "bg-destructive/10 text-destructive",
              )}
            >
              <TriangleAlert className="h-3 w-3" />
              {r.tone === "warning" ? (lang === "tr" ? "düşük" : "low") : (lang === "tr" ? "tükendi" : "out")}
            </span>
          </div>
        ))}
        <button className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
          {lang === "tr" ? "Tedarikçi başına sipariş oluştur" : "Create POs per supplier"}
        </button>
      </div>
    );
  }
  if (kind === "scan") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3">
          <ItemThumb category="tools" size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-tight">18V Cordless Drill</p>
            <p className="tnum text-[11px] text-muted-foreground">TLS-DRL-18V</p>
          </div>
          <ScanLine className="h-5 w-5 text-primary" />
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <svg viewBox="0 0 260 50" className="w-full" preserveAspectRatio="none" style={{ height: 44 }} aria-hidden>
            {Array.from({ length: 46 }).map((_, i) => {
              const w = 1 + ((i * 7) % 4);
              const x = 6 + i * 5.4;
              return <rect key={i} x={x} y="4" width={w} height="36" fill="var(--color-foreground)" />;
            })}
          </svg>
          <p className="mt-1 text-center font-mono text-[10px] tracking-[0.25em] text-muted-foreground">0 86423 91157 4</p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-border"><Minus className="h-4 w-4" /></span>
          <span className="tnum text-2xl font-bold">43</span>
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-primary/10 text-primary"><Plus className="h-4 w-4" /></span>
        </div>
      </div>
    );
  }
  // po
  const lines = [
    { name: "Nitrile Gloves · M", qty: 48, cost: 6.8 },
    { name: "Safety Helmet · White", qty: 24, cost: 11.0 },
  ];
  const total = lines.reduce((s, l) => s + l.qty * l.cost, 0);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="tnum text-sm font-semibold">PO-1044</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{lang === "tr" ? "taslak" : "draft"}</span>
      </div>
      <p className="text-[12px] text-muted-foreground">{lang === "tr" ? "Tedarikçi" : "Supplier"}: GuardWell PPE</p>
      <div className="space-y-2">
        {lines.map((l) => (
          <div key={l.name} className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-[12.5px]">
            <span className="font-medium">{l.name}</span>
            <span className="tnum text-muted-foreground">×{l.qty}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3 text-[13px]">
        <span className="text-muted-foreground">{lang === "tr" ? "Toplam" : "Total"}</span>
        <span className="tnum font-bold">${total.toFixed(2)}</span>
      </div>
      <button className="w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground">
        {lang === "tr" ? "Tedarikçiye gönder" : "Send to supplier"}
      </button>
    </div>
  );
}

function IntegrationGlyph({ glyph }: { glyph: "db" | "scan" | "store" }) {
  const color =
    glyph === "db" ? "var(--color-success)" : glyph === "scan" ? "var(--color-primary)" : "var(--color-info)";
  return (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: color }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph === "db" && <path d="M4 6 c0 -1.7 3.6 -3 8 -3 s8 1.3 8 3 v12 c0 1.7 -3.6 3 -8 3 s-8 -1.3 -8 -3 z M4 6 c0 1.7 3.6 3 8 3 s8 -1.3 8 -3 M4 12 c0 1.7 3.6 3 8 3 s8 -1.3 8 -3" />}
        {glyph === "scan" && <path d="M4 7 V5 a1 1 0 0 1 1 -1 h2 M17 4 h2 a1 1 0 0 1 1 1 v2 M20 17 v2 a1 1 0 0 1 -1 1 h-2 M7 20 H5 a1 1 0 0 1 -1 -1 v-2 M8 8 v8 M11 8 v8 M14 8 v8 M16 8 v8" />}
        {glyph === "store" && <path d="M4 9 l1 -5 h14 l1 5 M4 9 h16 v10 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 z M9 20 v-5 h6 v5" />}
      </svg>
    </span>
  );
}

function CompareCell({
  value,
  lang,
  highlight = false,
}: {
  value: boolean | L | string;
  lang: "tr" | "en";
  highlight?: boolean;
}) {
  const text = typeof value === "string" ? value : typeof value === "object" ? value[lang] : null;
  return (
    <td className={cn("px-5 py-3.5 text-center", highlight && "bg-primary/[0.05]")}>
      {typeof value === "boolean" ? (
        value ? (
          <span className={cn("mx-auto grid h-5 w-5 place-items-center rounded-full", highlight ? "bg-primary text-primary-foreground" : "bg-success/12 text-success")}>
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
        ) : (
          <span className="mx-auto grid h-5 w-5 place-items-center rounded-full bg-muted text-muted-foreground">
            <Minus className="h-3 w-3" />
          </span>
        )
      ) : (
        <span className={cn("text-[13px] font-medium", highlight ? "text-primary" : "text-muted-foreground")}>{text}</span>
      )}
    </td>
  );
}
