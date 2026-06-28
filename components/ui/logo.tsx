import { cn } from "@/lib/utils";
import appConfig from "@/app.config";

/**
 * Crate brand mark — a bespoke inline-SVG logomark: an isometric open crate with
 * a stacked cube inside it, in a warm amber gradient. No external image. The
 * setup can swap `appConfig.name` for the wordmark; drop a real file at
 * public/logo.svg if you have one.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-8 w-8 shrink-0", className)}
      aria-hidden
      fill="none"
    >
      <defs>
        <linearGradient id="crate-mark" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="oklch(78% 0.13 78)" />
          <stop offset="1" stopColor="oklch(63% 0.16 48)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#crate-mark)" />
      {/* isometric crate: top diamond + two side faces */}
      <g stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" fill="none">
        {/* top face */}
        <path d="M16 7 L24 11 L16 15 L8 11 Z" strokeOpacity="0.95" />
        {/* left + right body */}
        <path d="M8 11 V20 L16 24 V15" strokeOpacity="0.85" />
        <path d="M24 11 V20 L16 24" strokeOpacity="0.6" />
        {/* the stacked cube inside (a tiny diamond) */}
        <path d="M16 17.2 L19 18.7 L16 20.2 L13 18.7 Z" strokeOpacity="0.95" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  withWordmark = true,
  withChevron = false,
  onDark = false,
}: {
  className?: string;
  withWordmark?: boolean;
  /** Render a small chevron after the wordmark (matches the sidebar header). */
  withChevron?: boolean;
  /** Use light wordmark on a dark surface (e.g. the auth brand panel). */
  onDark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8 shadow-pill" />
      {withWordmark && (
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "font-display text-[17px] font-bold tracking-[-0.02em]",
              onDark ? "text-white" : "text-foreground",
            )}
          >
            {appConfig.name}
          </span>
          {withChevron && (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-muted-foreground" aria-hidden>
              <path d="M5 6l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          )}
        </span>
      )}
    </span>
  );
}
