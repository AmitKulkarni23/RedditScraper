import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { MOCK_POSTS } from "@/lib/mock-data";

export const maxDuration = 30;

const EMBEDDING_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBEDDING_MODEL = "nvidia/nemotron-3-embed-1b:free";
const CHAT_MODEL = "google/gemma-4-26b-a4b-it:free";

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
  });

  if (!res.ok) {
    throw new Error(`Embedding API error (${res.status})`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

async function retrieveByVector(queryEmbedding: number[], limit = 10) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return MOCK_POSTS.slice(0, limit);
  }

  const { data, error } = await supabase.rpc("match_posts", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.3,
    match_count: limit,
  });

  if (error) {
    console.error("Vector search error:", error.message);
    return [];
  }

  return data ?? [];
}

async function retrieveFallback(query: string, limit = 10) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const q = query.toLowerCase();
    return MOCK_POSTS.filter(
      (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    ).slice(0, limit);
  }

  let dbQuery = supabase
    .from("posts")
    .select("title, body, subreddit, author, score, num_comments, url, created_utc")
    .order("score", { ascending: false })
    .limit(limit);

  if (query.trim()) {
    dbQuery = dbQuery.textSearch("fts", query, { type: "websearch" });
  }

  const { data, error } = await dbQuery;
  if (error) {
    console.error("Fallback search error:", error.message);
    return [];
  }
  return data ?? [];
}

function buildSystemPrompt(
  posts: Record<string, unknown>[],
  previousPostIds: Set<string>
) {
  const allPosts = posts;
  const postsContext = allPosts
    .map(
      (p, i) =>
        `[${i + 1}] r/${p.subreddit} | "${p.title}" by u/${p.author} (score: ${p.score}, comments: ${p.num_comments})${p.similarity ? ` [relevance: ${(Number(p.similarity) * 100).toFixed(0)}%]` : ""}\n${p.body || "(no body)"}\nURL: ${p.url}`
    )
    .join("\n\n");

  return `You are a helpful assistant that answers questions using data from Reddit posts scraped from community subreddits.

When answering:
- Reference specific posts when relevant
- Be honest if the data doesn't cover the question
- Summarize trends and common themes when appropriate
- Keep answers concise and actionable

Here are the most relevant posts from the database:

${postsContext || "No matching posts found in the database."}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY not configured" },
      { status: 500 }
    );
  }

  const { messages, retrievedPostIds = [] } = await req.json();

  const lastUserMessage =
    [...messages].reverse().find((m: { role: string }) => m.role === "user")?.content ?? "";

  const previousPostIds = new Set<string>(retrievedPostIds);

  let relevantPosts: Record<string, unknown>[];
  try {
    const queryEmbedding = await embedQuery(lastUserMessage, apiKey);
    relevantPosts = await retrieveByVector(queryEmbedding);
  } catch (err) {
    console.error("Vector search failed, falling back to text search:", err);
    relevantPosts = await retrieveFallback(lastUserMessage);
  }

  const systemPrompt = buildSystemPrompt(relevantPosts, previousPostIds);

  const newPostIds = relevantPosts
    .map((p) => String(p.id ?? p.reddit_id ?? ""))
    .filter(Boolean);

  const openrouterMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: openrouterMessages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("OpenRouter error:", response.status, body);
    return NextResponse.json(
      { error: `OpenRouter error (${response.status})` },
      { status: 502 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(`e:${JSON.stringify({ retrievedPostIds: [...new Set([...retrievedPostIds, ...newPostIds])] })}\n`)
      );

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(content)}\n`));
              }
            } catch {}
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
