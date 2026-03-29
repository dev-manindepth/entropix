"use client";

import { useState } from "react";
import { Button } from "@entropix/react";
import { ShareDialog } from "./share-dialog";

type Viewport = "desktop" | "tablet" | "mobile";

interface ToolbarProps {
  projectId: string;
  projectName: string;
  onExport: () => void;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

const VIEWPORTS: { value: Viewport; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

export function Toolbar({
  projectId,
  projectName,
  onExport,
  viewport,
  onViewportChange,
  fullscreen,
  onToggleFullscreen,
}: ToolbarProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <div className="workspace-toolbar">
      <div className="workspace-toolbar-name">{projectName}</div>

      <div className="workspace-toolbar-actions">
        <div className="workspace-toolbar-viewport">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp.value}
              className={viewport === vp.value ? "active" : ""}
              onClick={() => onViewportChange(vp.value)}
            >
              {vp.label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="sm" onPress={onToggleFullscreen}>
          {fullscreen ? "Exit Fullscreen" : "⛶ Fullscreen"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onPress={() => setIsShareOpen(true)}
        >
          Share
        </Button>

        <Button variant="secondary" size="sm" onPress={onExport}>
          Export Code
        </Button>
      </div>

      <ShareDialog
        projectId={projectId}
        projectName={projectName}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
