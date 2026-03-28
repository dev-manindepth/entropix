"use client";

import { Button } from "@entropix/react";

type Viewport = "desktop" | "tablet" | "mobile";

interface ToolbarProps {
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
  projectName,
  onExport,
  viewport,
  onViewportChange,
  fullscreen,
  onToggleFullscreen,
}: ToolbarProps) {
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

        <Button variant="secondary" size="sm" onPress={onExport}>
          Export Code
        </Button>
      </div>
    </div>
  );
}
