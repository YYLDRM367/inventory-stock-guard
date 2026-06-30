import { ImageResponse } from "next/og";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size } = await params;
  const dim = parseInt(size) || 512;

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #2855C8 0%, #5080E0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: Math.round(dim * 0.03),
        }}
      >
        {/* Box grid */}
        <div style={{ display: "flex", gap: Math.round(dim * 0.03) }}>
          {[0.9, 0.7, 0.5].map((op, i) => (
            <div
              key={i}
              style={{
                width: Math.round(dim * 0.14),
                height: Math.round(dim * 0.14),
                background: `rgba(255,255,255,${op})`,
                borderRadius: Math.round(dim * 0.03),
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: Math.round(dim * 0.03) }}>
          {[0.7, 0.9, 0.5].map((op, i) => (
            <div
              key={i}
              style={{
                width: Math.round(dim * 0.14),
                height: Math.round(dim * 0.14),
                background: `rgba(255,255,255,${op})`,
                borderRadius: Math.round(dim * 0.03),
              }}
            />
          ))}
        </div>
        {/* Label */}
        <div
          style={{
            color: "white",
            fontSize: Math.round(dim * 0.14),
            fontWeight: 800,
            letterSpacing: -1,
            marginTop: Math.round(dim * 0.02),
            fontFamily: "sans-serif",
          }}
        >
          ISG
        </div>
      </div>
    ),
    {
      width: dim,
      height: dim,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
