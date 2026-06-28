export interface CategoryDef {
  key: string;
  label: { tr: string; en: string };
  color: string;
  icon: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: "tools",      label: { tr: "El aletleri",          en: "Hand tools"   }, color: "var(--cat-1)", icon: "wrench"   },
  { key: "electrical", label: { tr: "Elektrik",              en: "Electrical"   }, color: "var(--cat-2)", icon: "zap"      },
  { key: "fasteners",  label: { tr: "Bağlantı elemanları",  en: "Fasteners"    }, color: "var(--cat-3)", icon: "nut"      },
  { key: "safety",     label: { tr: "İş güvenliği",         en: "Safety gear"  }, color: "var(--cat-5)", icon: "hard-hat" },
  { key: "packaging",  label: { tr: "Ambalaj",              en: "Packaging"    }, color: "var(--cat-4)", icon: "package"  },
  { key: "fluids",     label: { tr: "Sıvılar",              en: "Fluids"       }, color: "var(--cat-6)", icon: "droplet"  },
];

export const categoryByKey = (k: string | null | undefined) =>
  CATEGORIES.find((c) => c.key === k) ?? null;
