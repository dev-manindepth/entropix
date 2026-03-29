"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChatPanel } from "@/components/workspace/chat-panel";
import { PreviewPanel } from "@/components/workspace/preview-panel";
import { Toolbar } from "@/components/workspace/toolbar";
import { useLayout } from "@/lib/layout-context";
import { TEMPLATES } from "@/lib/templates";

type Viewport = "desktop" | "tablet" | "mobile";

interface Project {
  id: string;
  name: string;
  description: string | null;
  currentSpecJson: string | null;
}

interface Generation {
  id: string;
  projectId: string;
  turnNumber: number;
  role: "user" | "assistant";
  prompt: string | null;
  specJson: string | null;
  rawResponse: string | null;
  promptTokens: number | null;
  completionTokens: number | null;
  createdAt: string;
}

export default function WorkspacePage() {
  const params = useParams<{ projectId: string }>();
  const searchParams = useSearchParams();
  const projectId = params.projectId;
  const templateSentRef = useRef(false);

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Generation[]>([]);
  const [currentSpec, setCurrentSpec] = useState<Record<string, unknown> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState("preview");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [exportedCode, setExportedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<"default" | "ocean" | "sunset">("default");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to load project");
        const data = await res.json();
        setProject(data.project);
        setMessages(data.generations ?? []);
        if (data.project.currentSpecJson) {
          setCurrentSpec(JSON.parse(data.project.currentSpecJson));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project");
      }
    }

    loadProject();
  }, [projectId]);

  const handleSend = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    setExportedCode(null);

    // Optimistically add user message
    const tempUserMsg: Generation = {
      id: `temp-user-${Date.now()}`,
      projectId,
      turnNumber: 0,
      role: "user",
      prompt,
      specJson: null,
      rawResponse: null,
      promptTokens: null,
      completionTokens: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/projects/${projectId}/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(errData.error || "Generation failed");
      }

      const data = await res.json();
      setCurrentSpec(data.spec);

      // Reload messages from server to get accurate data
      const refreshRes = await fetch(`/api/projects/${projectId}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setMessages(refreshData.generations ?? []);
        setProject(refreshData.project);
      }

      setActivePreviewTab("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsGenerating(false);
    }
  }, [projectId]);

  const handleExportCode = useCallback(async () => {
    if (!currentSpec) return;

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spec: currentSpec,
          format: "page",
          componentName: project?.name?.replace(/\s+/g, "") ?? "GeneratedUI",
        }),
      });

      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      setExportedCode(data.code);
      setActivePreviewTab("code");
    } catch (err) {
      console.error("Export error:", err);
    }
  }, [currentSpec, project?.name]);

  const handleRevert = useCallback(async (generationId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/revert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Revert failed" }));
        throw new Error(errData.error || "Revert failed");
      }

      const data = await res.json();
      setCurrentSpec(data.spec);
      setActivePreviewTab("preview");
      setExportedCode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Revert failed");
    }
  }, [projectId]);

  // Auto-send template prompt if ?template= query param is present
  useEffect(() => {
    if (templateSentRef.current || !project || isGenerating) return;
    const templateId = searchParams.get("template");
    if (!templateId) return;

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    // Only auto-send if project has no existing spec (fresh from template)
    if (project.currentSpecJson || messages.length > 0) return;

    templateSentRef.current = true;
    // Remove the query param from URL without reload
    window.history.replaceState({}, "", `/projects/${projectId}`);
    handleSend(template.prompt);
  }, [project, messages.length, isGenerating, searchParams, projectId, handleSend]);

  if (error && !project) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--entropix-color-status-error)",
        padding: "var(--entropix-spacing-4)",
      }}>
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: "var(--entropix-color-text-secondary)",
      }}>
        Loading...
      </div>
    );
  }

  const { fullscreenPreview, setFullscreenPreview } = useLayout();

  return (
    <div className={`workspace ${fullscreenPreview ? "workspace--fullscreen" : ""}`}>
      <Toolbar
        projectId={projectId}
        projectName={project.name}
        onExport={handleExportCode}
        viewport={viewport}
        onViewportChange={setViewport}
        fullscreen={fullscreenPreview}
        onToggleFullscreen={() => setFullscreenPreview(!fullscreenPreview)}
        brand={brand}
        onBrandChange={setBrand}
        theme={theme}
        onThemeChange={setTheme}
      />

      {!fullscreenPreview && (
        <ChatPanel
          messages={messages}
          isGenerating={isGenerating}
          onSend={handleSend}
          onRevert={handleRevert}
        />
      )}

      <PreviewPanel
        spec={currentSpec}
        activeTab={activePreviewTab}
        onTabChange={setActivePreviewTab}
        exportedCode={exportedCode}
        onExportCode={handleExportCode}
        viewport={viewport}
        isGenerating={isGenerating}
        brand={brand}
        theme={theme}
      />

      {error && (
        <div style={{
          position: "fixed",
          bottom: "var(--entropix-spacing-4)",
          right: "var(--entropix-spacing-4)",
          padding: "var(--entropix-spacing-3) var(--entropix-spacing-4)",
          background: "var(--entropix-color-status-error)",
          color: "white",
          borderRadius: "var(--entropix-radius-md)",
          fontSize: "0.875rem",
          maxWidth: 400,
          zIndex: 50,
          cursor: "pointer",
        }} onClick={() => setError(null)}>
          {error}
        </div>
      )}
    </div>
  );
}
