import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [itemsRes, movementsRes] = await Promise.all([
    supabase.from("items").select("*").eq("user_id", user.id),
    supabase
      .from("stock_movements")
      .select("type, qty, created_at")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo),
  ]);

  const items = itemsRes.data ?? [];
  const movements = movementsRes.data ?? [];

  // KPIs
  const totalValue = items.reduce((s, i) => s + i.on_hand * i.price, 0);
  const totalItems = items.length;
  const totalUnits = items.reduce((s, i) => s + i.on_hand, 0);
  const lowStockCount = items.filter((i) => i.on_hand > 0 && i.on_hand <= i.reorder_point).length;
  const outOfStockCount = items.filter((i) => i.on_hand === 0).length;

  // Category breakdown
  const catMap: Record<string, { items: number; units: number; value: number }> = {};
  for (const item of items) {
    const cat = item.category ?? "other";
    if (!catMap[cat]) catMap[cat] = { items: 0, units: 0, value: 0 };
    catMap[cat].items++;
    catMap[cat].units += item.on_hand;
    catMap[cat].value += item.on_hand * item.price;
  }
  const categoryBreakdown = Object.entries(catMap)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.value - a.value);

  // Top 5 items by stock value
  const topItems = [...items]
    .sort((a, b) => b.on_hand * b.price - a.on_hand * a.price)
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      category: i.category,
      on_hand: i.on_hand,
      price: i.price,
      cost: i.cost,
      value: i.on_hand * i.price,
    }));

  // Movement summary (last 30 days)
  const inTotal  = movements.filter((m) => m.type === "in").reduce((s, m) => s + m.qty, 0);
  const outTotal = movements.filter((m) => m.type === "out").reduce((s, m) => s + m.qty, 0);
  const adjTotal = movements.filter((m) => m.type === "adjust").reduce((s, m) => s + m.qty, 0);

  return NextResponse.json({
    totalValue,
    totalItems,
    totalUnits,
    lowStockCount,
    outOfStockCount,
    categoryBreakdown,
    topItems,
    movements: { in: inTotal, out: outTotal, adjust: adjTotal, total: movements.length },
  });
}
