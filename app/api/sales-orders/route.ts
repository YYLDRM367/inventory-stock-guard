import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("sales_orders")
    .select("*, customers(name), sales_order_items(qty, unit_price)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? []).map((so) => {
    const lines: { qty: number; unit_price: number }[] = so.sales_order_items ?? [];
    return {
      id:            so.id,
      number:        so.number,
      status:        so.status,
      notes:         so.notes,
      created_at:    so.created_at,
      customer_id:   so.customer_id,
      customer_name: (so.customers as { name: string } | null)?.name ?? "—",
      lines:         lines.length,
      units:         lines.reduce((s, l) => s + l.qty, 0),
      total:         lines.reduce((s, l) => s + l.qty * l.unit_price, 0),
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const { data: so, error: soError } = await supabase
    .from("sales_orders")
    .insert({
      user_id:     user.id,
      customer_id: body.customer_id || null,
      number:      body.number,
      status:      "draft",
      notes:       body.notes || null,
    })
    .select()
    .single();

  if (soError || !so) return NextResponse.json({ error: soError?.message }, { status: 500 });

  if (Array.isArray(body.lines) && body.lines.length > 0) {
    const rows = body.lines.map((l: { item_id: string; qty: number; unit_price: number }) => ({
      user_id:    user.id,
      so_id:      so.id,
      item_id:    l.item_id,
      qty:        Number(l.qty) || 1,
      unit_price: Number(l.unit_price) || 0,
    }));
    const { error: linesError } = await supabase.from("sales_order_items").insert(rows);
    if (linesError) return NextResponse.json({ error: linesError.message }, { status: 500 });
  }

  return NextResponse.json(so, { status: 201 });
}
