"use client";

import { categoryByKey } from "@/lib/demo/data";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * A small generated item thumbnail — NO photos. A rounded tile tinted by the
 * item's category color, with the category's lucide glyph. Deterministic and
 * cheap; the visual "card" feel of sortly without any image assets.
 */
export function ItemThumb({
  category,
  size = 40,
  className,
}: {
  category: string;
  size?: number;
  className?: string;
}) {
  const cat = categoryByKey(category);
  const icon = Math.round(size * 0.48);
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-lg border border-border", className)}
      style={{
        width: size,
        height: size,
        background: `color-mix(in oklch, ${cat.color} 14%, white)`,
        color: cat.color,
      }}
      aria-hidden
    >
      <Icon name={cat.icon} style={{ width: icon, height: icon }} strokeWidth={1.8} />
    </span>
  );
}
