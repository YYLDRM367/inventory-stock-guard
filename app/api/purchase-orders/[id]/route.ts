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
    .from("purchase_order_items")
    .select("*, items(name, sku)")
    .eq("po_id", id)
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
  const body = await request.json();
  const newStatus: string = body.status;

  const { error } = await supabase
    .from("purchase_orders")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // When received → update stock for each line item
  if (newStatus === "received") {
    const { data: lines } = await supabase
      .from("purchase_order_items")
      .select("item_id, qty_ordered")
      .eq("po_id", id)
      .eq("user_id", user.id);

    for (const line of lines ?? []) {
      const { data: item } = await supabase
        .from("items")
        .select("on_hand")
        .eq("id", line.item_id)
        .single();

      if (item) {
        await supabase
          .from("items")
          .update({ on_hand: item.on_hand + line.qty_ordered })
          .eq("id", line.item_id);

        await supabase.from("stock_movements").insert({
          user_id: user.id,
          item_id: line.item_id,
          type: "in",
          qty: line.qty_ordered,
          note: "PO received",
        });

        await supabase
          .from("purchase_order_items")
          .update({ qty_received: line.qty_ordered })
          .eq("po_id", id)
          .eq("item_id", line.item_id);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
