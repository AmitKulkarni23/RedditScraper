import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabaseClient();

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
