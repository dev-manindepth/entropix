"use client";

import { useState } from "react";
import { Button } from "@entropix/react";
import { ShareDialog } from "./share-dialog";

type Viewport = "desktop" | "tablet" | "mobile";
type Brand = "default" | "ocean" | "sunset";
type Theme = "light" | "dark";

interface ToolbarProps {
  projectId: string;
  projectName: string;
  onExport: () => void;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  brand?: Brand;
  onBrandChange?: (brand: Brand) => void;
  theme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

const VIEWPORTS: { value: Viewport; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "tablet", label: "Tablet" },
  { value: "mobile", label: "Mobile" },
];

const BRANDS: { value: Brand; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "ocean", label: "Ocean" },
  { value: "sunset", label: "Sunset" },
];

const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function Toolbar({
  projectId,
  projectName,
  onExport,
  viewport,
  onViewportChange,
  fullscreen,
  onToggleFullscreen,
  brand = "default",
  onBrandChange,
  theme = "light",
  onThemeChange,
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

        {onBrandChange && (
          <div className="workspace-toolbar-viewport">
            {BRANDS.map((b) => (
              <button
                key={b.value}
                className={brand === b.value ? "active" : ""}
                onClick={() => onBrandChange(b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}

        {onThemeChange && (
          <div className="workspace-toolbar-viewport">
            {THEMES.map((t) => (
              <button
                key={t.value}
                className={theme === t.value ? "active" : ""}
                onClick={() => onThemeChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

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
