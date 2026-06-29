"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Loader2, Save, User, Building2, DollarSign, Palette } from "lucide-react";
import appConfig from "@/app.config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/components/i18n/language-provider";
import { COLOR_THEMES, type ColorThemeName, useColorTheme } from "@/components/app/color-theme-provider";

const CURRENCIES = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "TRY", label: "Turkish Lira (₺)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
];

type Settings = {
  currency: string;
  display_name: string | null;
  company_name: string | null;
};

export function SettingsClient({ connected }: { connected: Record<string, boolean> }) {
  const { t, ui, lang } = useLang();
  const { colorTheme, setColorTheme } = useColorTheme();

  const [settings, setSettings] = useState<Settings>({ currency: "USD", display_name: null, company_name: null });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setSettings(d);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    const r = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (r.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">

      {/* Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/12 text-primary">
              <User className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>{lang === "tr" ? "Profil" : "Profile"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {lang === "tr" ? "Hesap bilgilerin." : "Your account information."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-20 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">{lang === "tr" ? "Ad Soyad" : "Display name"}</label>
                <input
                  type="text"
                  value={settings.display_name ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, display_name: e.target.value || null }))}
                  placeholder={lang === "tr" ? "ör. Ali Yıldırım" : "e.g. Alex Johnson"}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium">{lang === "tr" ? "Şirket adı" : "Company name"}</label>
                <input
                  type="text"
                  value={settings.company_name ?? ""}
                  onChange={(e) => setSettings((s) => ({ ...s, company_name: e.target.value || null }))}
                  placeholder={lang === "tr" ? "ör. Yıldırım Ticaret" : "e.g. Acme Corp"}
                  className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance / Color theme */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/12 text-violet-600">
              <Palette className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>{lang === "tr" ? "Tema Rengi" : "Color Theme"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Uygulamanın vurgu rengini seç. Anında uygulanır."
                  : "Choose the accent color for the app. Applied instantly."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.entries(COLOR_THEMES) as [ColorThemeName, typeof COLOR_THEMES[ColorThemeName]][]).map(([key, theme]) => {
              const isActive = colorTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => setColorTheme(key)}
                  className={`group relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                    isActive ? "border-primary shadow-pop" : "border-border hover:border-primary/40"
                  }`}
                >
                  {/* Color band */}
                  <div
                    className="h-16 w-full"
                    style={{ background: theme.gradient }}
                  >
                    {/* Mini UI preview */}
                    <div className="flex h-full flex-col justify-end gap-1 p-2.5">
                      <div className="flex gap-1">
                        <div className="h-2 w-10 rounded-full bg-white/40" />
                        <div className="h-2 w-6 rounded-full bg-white/25" />
                      </div>
                      <div className="flex gap-1">
                        <div className="h-1.5 w-7 rounded-full bg-white/30" />
                        <div className="h-1.5 w-4 rounded-full bg-white/20" />
                        <div className="h-1.5 w-8 rounded-full bg-white/30" />
                      </div>
                    </div>
                  </div>
                  {/* Label */}
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div>
                      <p className="text-[13px] font-semibold leading-tight">{theme.label[lang]}</p>
                      <p className="text-[11.5px] text-muted-foreground">{theme.desc[lang]}</p>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Currency */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-success/12 text-success">
              <DollarSign className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>{lang === "tr" ? "Para Birimi" : "Currency"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {lang === "tr"
                  ? "Rapor ve sipariş toplamlarında kullanılan para birimi."
                  : "Currency used in reports and order totals."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSettings((s) => ({ ...s, currency: c.code }))}
                className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-[13px] font-medium transition-all ${
                  settings.currency === c.code
                    ? "border-primary bg-primary/[0.05] text-primary"
                    : "border-border text-foreground hover:border-primary/50"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${settings.currency === c.code ? "bg-primary" : "bg-muted-foreground/30"}`} />
                {c.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brand (read-only) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>{ui.brand}</CardTitle>
              <p className="text-sm text-muted-foreground">{ui.brandHint}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">{ui.productName}</label>
            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
              {appConfig.name}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-muted-foreground">{ui.domain}</label>
            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
              {appConfig.domain}
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-[13px] font-medium text-muted-foreground">{ui.tagline}</label>
            <div className="flex h-9 items-center rounded-lg border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
              {t(appConfig.tagline)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>{ui.integrations}</CardTitle>
          <p className="text-sm text-muted-foreground">{ui.integrationsHint}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {appConfig.integrations.map((it) => (
            <div key={it.key} className="flex items-center gap-4 rounded-lg border border-border p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon name="plug" className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{it.name}</p>
                  {it.required && <Badge tone="warning">{ui.required}</Badge>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{it.purpose}</p>
              </div>
              {connected[it.key] ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                  <CheckCircle2 className="h-4 w-4" /> {ui.connected}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <CircleDashed className="h-4 w-4" /> {ui.demoMode}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-[13px] font-medium text-success">
            <CheckCircle2 className="h-4 w-4" />
            {lang === "tr" ? "Kaydedildi!" : "Saved!"}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {lang === "tr" ? "Değişiklikleri kaydet" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
