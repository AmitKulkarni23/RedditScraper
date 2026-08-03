import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("posts")
    .select("scraped_at")
    .order("scraped_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lastScrapedAt = data?.[0]?.scraped_at ?? null;

  return NextResponse.json({ lastScrapedAt });
}
