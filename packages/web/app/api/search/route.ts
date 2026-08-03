import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import type { SearchFilters } from "@reddit-scraper/shared";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters: SearchFilters = {
    query: params.get("q") ?? undefined,
    subreddit: params.get("subreddit") ?? undefined,
    minScore: params.has("minScore")
      ? Number(params.get("minScore"))
      : undefined,
    sortBy:
      (params.get("sortBy") as SearchFilters["sortBy"]) ?? "created_utc",
    sortOrder:
      (params.get("sortOrder") as SearchFilters["sortOrder"]) ?? "desc",
    limit: Math.min(Number(params.get("limit") ?? 25), 100),
    offset: Number(params.get("offset") ?? 0),
  };

  const supabase = getSupabaseClient();

  let query = supabase.from("posts").select("*", { count: "exact" });

  if (filters.query) {
    query = query.textSearch("fts", filters.query, { type: "websearch" });
  }

  if (filters.subreddit) {
    query = query.eq("subreddit", filters.subreddit);
  }

  if (filters.minScore !== undefined) {
    query = query.gte("score", filters.minScore);
  }

  query = query
    .order(filters.sortBy ?? "created_utc", {
      ascending: filters.sortOrder === "asc",
    })
    .range(
      filters.offset ?? 0,
      (filters.offset ?? 0) + (filters.limit ?? 25) - 1
    );

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ posts: data, total: count });
}
