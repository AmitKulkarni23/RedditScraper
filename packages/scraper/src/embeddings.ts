const OPENROUTER_URL = "https://openrouter.ai/api/v1/embeddings";
const MODEL = "nvidia/nemotron-3-embed-1b:free";

export async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export function buildEmbeddingText(title: string, body: string): string {
  const text = body ? `${title}\n${body}` : title;
  return text.slice(0, 8000);
}
