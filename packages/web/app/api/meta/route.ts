import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { MOCK_POSTS } from "@/lib/mock-data";

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const lastScrapedAt = MOCK_POSTS
      .map((p) => p.scraped_at)
      .sort()
      .pop() ?? null;
    return NextResponse.json({ lastScrapedAt });
  }

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
