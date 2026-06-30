import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F8F9FC",
          fontFamily: "sans-serif",
        }}
      >
        {/* Sidebar */}
        <div style={{ width: 220, background: "#fff", borderRight: "1px solid #E5E7EB", display: "flex", flexDirection: "column", padding: 16, gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2855C8,#5080E0)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ color: "white", fontSize: 10, fontWeight: 800 }}>ISG</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>StockGuard</div>
          </div>
          {["Dashboard", "Items", "Purchase Orders", "Locations", "Customers", "Sales Orders", "Reports"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 8, background: i === 0 ? "#EEF2FF" : "transparent" }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? "#3B6FD4" : "#94A3B8" }} />
              <div style={{ fontSize: 11, color: i === 0 ? "#3B6FD4" : "#64748B", fontWeight: i === 0 ? 600 : 400 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 24, gap: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1E293B" }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>Inventory Stock Guard</div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total Items", value: "248", color: "#EEF2FF", accent: "#3B6FD4" },
              { label: "In Stock", value: "201", color: "#ECFDF5", accent: "#059669" },
              { label: "Low Stock", value: "31", color: "#FFFBEB", accent: "#D97706" },
              { label: "Stock Value", value: "$84.2k", color: "#F5F3FF", accent: "#7C3AED" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ width: 28, height: 28, background: s.color, borderRadius: 8, marginBottom: 4 }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1E293B" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ display: "flex", flexDirection: "column", background: "#fff", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden", flex: 1 }}>
            <div style={{ display: "flex", background: "#F8FAFC", padding: "10px 16px", borderBottom: "1px solid #E5E7EB" }}>
              {["SKU", "Item Name", "Category", "On Hand", "Reorder", "Status"].map((h, i) => (
                <div key={i} style={{ flex: i === 1 ? 2 : 1, fontSize: 10, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{h}</div>
              ))}
            </div>
            {[
              ["SKU-001", "Wireless Keyboard", "Electronics", "45", "20", "In Stock"],
              ["SKU-002", "USB-C Hub", "Electronics", "12", "15", "Low"],
              ["SKU-003", "Desk Lamp", "Furniture", "89", "10", "In Stock"],
              ["SKU-004", "Monitor Stand", "Furniture", "0", "5", "Out"],
              ["SKU-005", "Ergonomic Chair", "Furniture", "23", "8", "In Stock"],
            ].map((row, ri) => (
              <div key={ri} style={{ display: "flex", padding: "10px 16px", borderBottom: "1px solid #F1F5F9", alignItems: "center" }}>
                {row.map((cell, ci) => (
                  <div key={ci} style={{
                    flex: ci === 1 ? 2 : 1,
                    fontSize: 11,
                    color: ci === 0 ? "#94A3B8" : ci === 5 ? (cell === "In Stock" ? "#059669" : cell === "Low" ? "#D97706" : "#EF4444") : "#374151",
                    fontWeight: ci === 0 || ci === 5 ? 600 : 400,
                  }}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1280,
      height: 800,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
