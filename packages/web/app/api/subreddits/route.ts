import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { MOCK_POSTS } from "@/lib/mock-data";

export async function GET() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const unique = [...new Set(MOCK_POSTS.map((p) => p.subreddit))].sort();
    return NextResponse.json({ subreddits: unique });
  }

  const { data, error } = await supabase
    .from("posts")
    .select("subreddit")
    .order("subreddit");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const unique = [...new Set((data ?? []).map((r) => r.subreddit))];

  return NextResponse.json({ subreddits: unique });
}
