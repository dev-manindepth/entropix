"use client";

import { useState } from "react";

export function ForkButton({ shareId }: { shareId: string }) {
  const [forking, setForking] = useState(false);

  const handleFork = async () => {
    setForking(true);
    try {
      const res = await fetch(`/api/shares/${shareId}/fork`, {
        method: "POST",
      });
      if (res.ok) {
        const { projectId } = await res.json();
        window.location.href = `/projects/${projectId}`;
      } else {
        const data = await res.json();
        alert(data.error || "Fork failed");
        setForking(false);
      }
    } catch {
      alert("Fork failed");
      setForking(false);
    }
  };

  return (
    <button
      onClick={handleFork}
      disabled={forking}
      style={{
        padding: "8px 16px",
        fontSize: "0.875rem",
        fontWeight: 500,
        border: "1px solid var(--entropix-color-border-default)",
        borderRadius: "var(--entropix-radius-md)",
        background: "var(--entropix-color-surface-primary)",
        color: "var(--entropix-color-text-primary)",
        cursor: forking ? "not-allowed" : "pointer",
        opacity: forking ? 0.6 : 1,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {forking ? "Forking..." : "Fork into My Project"}
    </button>
  );
}
