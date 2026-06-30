"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Menu, Settings } from "lucide-react";
import appConfig from "@/app.config";
import { Logo } from "@/components/ui/logo";
import { Icon } from "@/components/ui/icon";
import { useLang } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

/* ── Context ──────────────────────────────────────────────────────────────── */

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const MobileNavCtx = createContext<Ctx>({ open: false, setOpen: () => {} });

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileNavCtx.Provider value={{ open, setOpen }}>{children}</MobileNavCtx.Provider>;
}

export function useMobileNav() {
  return useContext(MobileNavCtx);
}

/* ── Hamburger toggle (goes in Topbar) ───────────────────────────────────── */

export function MobileNavToggle() {
  const { setOpen } = useMobileNav();
  return (
    <button
      onClick={() => setOpen(true)}
      className="grid h-9 w-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-muted md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

/* ── Slide-in drawer ─────────────────────────────────────────────────────── */

export function MobileNavDrawer() {
  const { open, setOpen } = useMobileNav();
  const pathname = usePathname();
  const { t, lang } = useLang();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Drawer panel */}
      <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-pop animate-float-up"
        style={{ animationDuration: "0.25s" }}
      >
        {/* Logo + close */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Logo withChevron />
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {appConfig.navGroups.map((group) => (
            <div key={t(group.label)} className="mb-4">
              <p className="label-mono px-3 pb-1.5 pt-2 text-muted-foreground">{t(group.label)}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  if (item.muted) return null;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon
                        name={item.icon}
                        className={cn(
                          "h-[18px] w-[18px] shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      {t(item.label)}
                      {item.badge && (
                        <span className="ml-auto rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning-foreground">
                          {t(item.badge)}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors",
              isActive("/settings")
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings
              className={cn(
                "h-[18px] w-[18px]",
                isActive("/settings") ? "text-primary" : "text-muted-foreground",
              )}
            />
            {lang === "tr" ? "Ayarlar" : "Settings"}
          </Link>
        </div>
      </aside>
    </div>
  );
}
