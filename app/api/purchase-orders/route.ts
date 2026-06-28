import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name), purchase_order_items(qty_ordered, unit_cost)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((po) => {
    const poItems: { qty_ordered: number; unit_cost: number }[] = po.purchase_order_items ?? [];
    return {
      id: po.id,
      number: po.number,
      status: po.status,
      expected_at: po.expected_at,
      notes: po.notes,
      created_at: po.created_at,
      supplier_id: po.supplier_id,
      supplier_name: (po.suppliers as { name: string } | null)?.name ?? "—",
      lines: poItems.length,
      units: poItems.reduce((s, i) => s + i.qty_ordered, 0),
      total: poItems.reduce((s, i) => s + i.qty_ordered * i.unit_cost, 0),
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  // body: { supplier_id, number, expected_at, notes, lines: [{ item_id, qty_ordered, unit_cost }] }

  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .insert({
      user_id: user.id,
      supplier_id: body.supplier_id || null,
      number: body.number,
      status: "draft",
      expected_at: body.expected_at || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (poError || !po) return NextResponse.json({ error: poError?.message }, { status: 500 });

  if (Array.isArray(body.lines) && body.lines.length > 0) {
    const itemRows = body.lines.map((l: { item_id: string; qty_ordered: number; unit_cost: number }) => ({
      user_id: user.id,
      po_id: po.id,
      item_id: l.item_id,
      qty_ordered: Number(l.qty_ordered) || 1,
      qty_received: 0,
      unit_cost: Number(l.unit_cost) || 0,
    }));
    const { error: itemsError } = await supabase.from("purchase_order_items").insert(itemRows);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json(po, { status: 201 });
}
