"use client";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  specPreview?: string | null;
  timestamp?: Date | string;
  promptTokens?: number | null;
  completionTokens?: number | null;
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  role,
  content,
  specPreview,
  timestamp,
  promptTokens,
  completionTokens,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="message-bubble message-bubble--user">
        <div>{content}</div>
        {timestamp && (
          <span className="message-bubble-timestamp">{formatTime(timestamp)}</span>
        )}
      </div>
    );
  }

  const totalTokens =
    (promptTokens ?? 0) + (completionTokens ?? 0);

  return (
    <div className="message-bubble message-bubble--assistant">
      <div className="message-bubble-label">
        {specPreview ? "Refined UI" : "Generated UI"}
        {totalTokens > 0 && (
          <span className="message-bubble-tokens">{totalTokens} tokens</span>
        )}
      </div>
      <div>{content || "UI spec generated. See the preview panel."}</div>
      {timestamp && (
        <span className="message-bubble-timestamp">{formatTime(timestamp)}</span>
      )}
    </div>
  );
}
