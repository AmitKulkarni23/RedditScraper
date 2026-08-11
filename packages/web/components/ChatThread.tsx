"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What are the most common complaints?",
  "What do people love about the bakery?",
  "How do customers feel about prices?",
];

export default function ChatThread() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrievedPostIds, setRetrievedPostIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    const userMessage: Message = { role: "user", content: msg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          retrievedPostIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("0:")) {
            const text = JSON.parse(line.slice(2));
            assistantContent += text;
            const captured = assistantContent;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: captured };
              return updated;
            });
          } else if (line.startsWith("e:")) {
            try {
              const event = JSON.parse(line.slice(2));
              if (event.retrievedPostIds) {
                setRetrievedPostIds(event.retrievedPostIds);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
      setMessages((prev) => {
        if (prev[prev.length - 1]?.role === "assistant" && prev[prev.length - 1].content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={scrollRef}>
        {isEmpty && (
          <div className="chat-welcome">
            <p className="chat-welcome-title">Ask about the community</p>
            <p className="chat-welcome-subtitle">
              Get answers based on posts from the scraped subreddits
            </p>
            <div className="chat-suggestions">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  className="chat-suggestion"
                  onClick={() => handleSubmit(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message-${msg.role}`}>
            <div className="chat-message-label">
              {msg.role === "user" ? "You" : "Assistant"}
            </div>
            <div className="chat-message-content">
              {msg.content || (isLoading && i === messages.length - 1 ? "" : "")}
              {isLoading && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="chat-cursor" />
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="chat-message chat-message-assistant">
            <div className="chat-message-label">Assistant</div>
            <div className="chat-message-content">
              <span className="chat-cursor" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="chat-error">
          {error}
          <button className="chat-error-retry" onClick={() => handleSubmit(messages[messages.length - 1]?.content)}>
            Retry
          </button>
        </div>
      )}

      <form
        className="chat-input-form"
        onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      >
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the community..."
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!input.trim() || isLoading}
        >
          Send
        </button>
      </form>
    </div>
  );
}
