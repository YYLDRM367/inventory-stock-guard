"use client";

/**
 * Inline-SVG barcode + QR — generated deterministically from a string. NOT a
 * scannable spec-compliant symbology; it's a faithful *visual* of the real
 * thing (the kind sortly/inFlow print on labels), with zero dependencies.
 */

function hashChars(s: string): number[] {
  // simple rolling hash → a stable sequence of pseudo-random bytes
  const out: number[] = [];
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
    out.push(h & 0xff);
  }
  // extend to a decent length
  while (out.length < 48) {
    h = Math.imul(h ^ out.length, 16777619) >>> 0;
    out.push(h & 0xff);
  }
  return out;
}

export function Barcode({
  value,
  height = 56,
  className,
}: {
  value: string;
  height?: number;
  className?: string;
}) {
  const bytes = hashChars(value);
  const bars: { x: number; w: number }[] = [];
  let x = 4;
  // guard bars
  bars.push({ x, w: 2 });
  x += 5;
  for (let i = 0; i < bytes.length && x < 252; i++) {
    const w = 1 + (bytes[i] % 4); // 1–4 px wide
    const gap = 1 + ((bytes[i] >> 2) % 3);
    bars.push({ x, w });
    x += w + gap;
  }
  bars.push({ x: 254, w: 2 });

  return (
    <div className={className}>
      <svg viewBox="0 0 260 60" style={{ width: "100%", height }} preserveAspectRatio="none" role="img" aria-label={`barcode ${value}`}>
        <rect width="260" height="60" fill="white" />
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y="4" width={b.w} height="42" fill="var(--color-foreground)" />
        ))}
      </svg>
      <p className="mt-1 text-center font-mono text-[11px] tracking-[0.25em] text-muted-foreground">{value}</p>
    </div>
  );
}

export function QrCode({
  value,
  size = 96,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const n = 21; // modules per side (QR-ish grid)
  const bytes = hashChars(value + "::qr");
  const cell = size / n;

  const on = (r: number, c: number) => {
    const idx = (r * n + c) % bytes.length;
    return (bytes[idx] + r * 7 + c * 13) % 5 < 2;
  };

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, n - 7) || inBox(n - 7, 0);
  };

  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (isFinder(r, c)) continue;
      if (on(r, c)) cells.push({ r, c });
    }
  }

  const Finder = ({ r, c }: { r: number; c: number }) => (
    <g>
      <rect x={c * cell} y={r * cell} width={cell * 7} height={cell * 7} fill="var(--color-foreground)" />
      <rect x={(c + 1) * cell} y={(r + 1) * cell} width={cell * 5} height={cell * 5} fill="white" />
      <rect x={(c + 2) * cell} y={(r + 2) * cell} width={cell * 3} height={cell * 3} fill="var(--color-foreground)" />
    </g>
  );

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size }}
      className={className}
      role="img"
      aria-label={`QR ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((m, i) => (
        <rect key={i} x={m.c * cell} y={m.r * cell} width={cell} height={cell} fill="var(--color-foreground)" />
      ))}
      <Finder r={0} c={0} />
      <Finder r={0} c={n - 7} />
      <Finder r={n - 7} c={0} />
    </svg>
  );
}
