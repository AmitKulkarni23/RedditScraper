import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { MOCK_POSTS } from "@/lib/mock-data";
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

  if (!supabase) {
    let posts = [...MOCK_POSTS];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q)
      );
    }
    if (filters.subreddit) {
      posts = posts.filter((p) => p.subreddit === filters.subreddit);
    }
    if (filters.minScore !== undefined) {
      posts = posts.filter((p) => p.score >= filters.minScore!);
    }

    const sortKey = filters.sortBy ?? "created_utc";
    const asc = filters.sortOrder === "asc";
    posts.sort((a, b) => {
      const av = a[sortKey as keyof typeof a];
      const bv = b[sortKey as keyof typeof b];
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });

    const total = posts.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 25;
    posts = posts.slice(offset, offset + limit);

    return NextResponse.json({ posts, total });
  }

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
