"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@entropix/react";
import { MessageBubble } from "./message-bubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  prompt: string | null;
  specJson: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: string | Date;
}

interface ChatPanelProps {
  messages: Message[];
  isGenerating: boolean;
  onSend: (prompt: string) => void;
}

export function ChatPanel({ messages, isGenerating, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  useEffect(() => {
    // On initial load (messages come from server), don't auto-scroll
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevMessageCountRef.current = messages.length;
      return;
    }
    // Only auto-scroll when a NEW message is added by user action
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when generating starts (user just sent a message)
    if (isGenerating) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isGenerating]);

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isGenerating) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "40px";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && !isGenerating && (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--entropix-color-text-secondary)",
            fontSize: "0.875rem",
            textAlign: "center",
            padding: "var(--entropix-spacing-4)",
          }}>
            Describe the UI you want to build. The AI will generate a live preview.
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.role === "user" ? (msg.prompt ?? "") : "UI spec generated. See the preview panel."}
            specPreview={msg.specJson ? "preview" : null}
            timestamp={msg.createdAt}
            promptTokens={msg.promptTokens}
            completionTokens={msg.completionTokens}
          />
        ))}

        {isGenerating && (
          <div className="chat-generating">
            <span className="chat-generating-dot" />
            <span className="chat-generating-dot" />
            <span className="chat-generating-dot" />
            <span>Generating...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your UI..."
          disabled={isGenerating}
          rows={1}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!input.trim() || isGenerating}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
