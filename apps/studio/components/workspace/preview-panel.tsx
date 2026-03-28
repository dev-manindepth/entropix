"use client";

import { useState, useCallback } from "react";
import { Tabs, TabList, Tab, TabPanel, Button } from "@entropix/react";
import { EntropixRenderer } from "@entropix/ai";
import { COMPONENT_MAP } from "@/lib/components-map";

interface PreviewPanelProps {
  spec: Record<string, unknown> | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  exportedCode: string | null;
  onExportCode: () => void;
  viewport: "desktop" | "tablet" | "mobile";
}

export function PreviewPanel({
  spec,
  activeTab,
  onTabChange,
  exportedCode,
  onExportCode,
  viewport,
}: PreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: noop
    }
  }, []);

  return (
    <div className="preview-panel">
      <Tabs selectedKey={activeTab} onSelectedKeyChange={onTabChange}>
        <TabList>
          <Tab value="preview">Preview</Tab>
          <Tab value="json">JSON</Tab>
          <Tab value="code">Code</Tab>
        </TabList>

        <TabPanel value="preview">
          <div className="preview-panel-content">
            {spec ? (
              <div className={`preview-container preview-container--${viewport}`}>
                <EntropixRenderer
                  spec={spec as any}
                  components={COMPONENT_MAP}
                />
              </div>
            ) : (
              <div className="preview-empty">
                No preview yet. Send a message to generate UI.
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="json">
          <div className="preview-panel-content">
            {spec ? (
              <div className="preview-code">
                <div className="preview-code-copy">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(JSON.stringify(spec, null, 2))}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre>{JSON.stringify(spec, null, 2)}</pre>
              </div>
            ) : (
              <div className="preview-empty">
                No spec generated yet.
              </div>
            )}
          </div>
        </TabPanel>

        <TabPanel value="code">
          <div className="preview-panel-content">
            {exportedCode ? (
              <div className="preview-code">
                <div className="preview-code-copy">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopy(exportedCode)}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre>{exportedCode}</pre>
              </div>
            ) : spec ? (
              <div className="preview-empty">
                <Button variant="primary" onClick={onExportCode}>
                  Export Code
                </Button>
              </div>
            ) : (
              <div className="preview-empty">
                Generate a UI first, then export to code.
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
}
