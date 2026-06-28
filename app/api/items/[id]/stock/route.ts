import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const delta = Number(body.delta);
  const note = body.note || "";

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("on_hand")
    .eq("id", id)
    .single();

  if (fetchError || !item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  const newOnHand = Math.max(0, item.on_hand + delta);
  const type = delta > 0 ? "in" : "out";

  const { error: updateError } = await supabase
    .from("items")
    .update({ on_hand: newOnHand })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase.from("stock_movements").insert({
    user_id: user.id,
    item_id: id,
    type,
    qty: Math.abs(delta),
    note,
  });

  return NextResponse.json({ on_hand: newOnHand });
}
