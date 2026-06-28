import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data, error } = await supabase
    .from("sales_order_items")
    .select("*, items(name, sku, cost)")
    .eq("so_id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status: newStatus } = await request.json();

  const { error } = await supabase
    .from("sales_orders")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When shipped → decrement stock
  if (newStatus === "shipped") {
    const { data: lines } = await supabase
      .from("sales_order_items")
      .select("item_id, qty")
      .eq("so_id", id)
      .eq("user_id", user.id);

    for (const line of lines ?? []) {
      const { data: item } = await supabase
        .from("items")
        .select("on_hand")
        .eq("id", line.item_id)
        .single();

      if (item) {
        const newOnHand = Math.max(0, item.on_hand - line.qty);
        await supabase
          .from("items")
          .update({ on_hand: newOnHand })
          .eq("id", line.item_id);

        await supabase.from("stock_movements").insert({
          user_id: user.id,
          item_id: line.item_id,
          type:    "out",
          qty:     line.qty,
          note:    "Sales order shipped",
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
