import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "22%",
          gap: 16,
        }}
      >
        {/* Box icon rows */}
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.9)", borderRadius: 16 }} />
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.7)", borderRadius: 16 }} />
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.7)", borderRadius: 16 }} />
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.9)", borderRadius: 16 }} />
          <div style={{ width: 72, height: 72, background: "rgba(255,255,255,0.5)", borderRadius: 16 }} />
        </div>
        {/* ISG label */}
        <div
          style={{
            color: "white",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            marginTop: 8,
            fontFamily: "sans-serif",
          }}
        >
          ISG
        </div>
      </div>
    ),
    { ...size },
  );
}
