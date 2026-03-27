"use client";

import { useState, useCallback, useRef } from "react";
import {
  Button,
  Stack,
  Inline,
  Container,
  Divider,
  Input,
  Textarea,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Switch,
  Checkbox,
  RadioGroup,
  RadioItem,
  Select,
  SelectTrigger,
  SelectContent,
  SelectOption,
  Toggle,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  DatePicker,
  Breadcrumb,
  BreadcrumbItem,
  Pagination,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  ToastProvider,
  useToastContext,
} from "@entropix/react";
import { DataTable, BarChart, LineChart, AreaChart, PieChart } from "@entropix/data";
import {
  EntropixRenderer,
  createWebComponentMap,
  defaultRegistry,
} from "@entropix/ai";
import type { UISpec, ComponentMap, ValidationResult } from "@entropix/ai";

import * as EntropixReact from "@entropix/react";
import * as EntropixData from "@entropix/data";

const COMPONENT_MAP: ComponentMap = createWebComponentMap(
  EntropixReact as unknown as Record<string, unknown>,
  EntropixData as unknown as Record<string, unknown>,
);

const SUGGESTIONS = [
  "A contact form with name, email, message fields and a submit button",
  "A pricing table with 3 tiers: Basic ($9/mo), Pro ($29/mo), Enterprise (Contact us)",
  "A settings page with tabs for Profile, Notifications, and Security",
  "A dashboard with 3 stat cards and a bar chart showing monthly revenue",
  "A product card with image placeholder, title, rating, price, and add to cart button",
  "A user profile page with avatar placeholder, bio, social links, and edit button",
  "A FAQ page with 5 accordion items about a SaaS product",
  "A flight booking form with from/to inputs, date picker, passenger count, and search button",
  "A data table showing employees with name, role, department, status columns with sorting and pagination",
  "A notification center with toast triggers for success, error, warning, and info messages",
];

interface GenerationResult {
  spec: UISpec;
  validation: ValidationResult | {
    structural: ValidationResult;
    registry: ValidationResult;
  };
  usage?: { promptTokens: number; completionTokens: number };
  raw?: string;
}

interface HistoryEntry {
  id: number;
  prompt: string;
  result: GenerationResult;
  timestamp: Date;
}

export default function PlaygroundPage() {
  return (
    <ToastProvider>
      <PlaygroundInner />
    </ToastProvider>
  );
}

function PlaygroundInner() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>("preview");
  const historyCounter = useRef(0);
  const toast = useToastContext();

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.add({ message: "Please enter a prompt", type: "warning" });
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentResult(null);
    setActiveTab("preview");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const result: GenerationResult = await res.json();
      setCurrentResult(result);

      const entry: HistoryEntry = {
        id: ++historyCounter.current,
        prompt: prompt.trim(),
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [entry, ...prev]);

      toast.add({
        message: `Generated in ${result.usage?.promptTokens ?? 0 + (result.usage?.completionTokens ?? 0)} tokens`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
      toast.add({ message: msg, type: "error" });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, toast]);

  const [refineInput, setRefineInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [exportedCode, setExportedCode] = useState<string | null>(null);

  const refine = useCallback(async () => {
    if (!refineInput.trim() || !currentResult) return;
    setIsRefining(true);
    setError(null);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSpec: currentResult.spec,
          instruction: refineInput.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const result: GenerationResult = await res.json();
      setCurrentResult(result);
      const entry: HistoryEntry = {
        id: ++historyCounter.current,
        prompt: `Refine: ${refineInput.trim()}`,
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [entry, ...prev]);
      setRefineInput("");
      setExportedCode(null);
      toast.add({ message: "UI refined successfully", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refinement failed";
      setError(msg);
      toast.add({ message: msg, type: "error" });
    } finally {
      setIsRefining(false);
    }
  }, [refineInput, currentResult, toast]);

  const exportCode = useCallback(async () => {
    if (!currentResult) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec: currentResult.spec, format: "page" }),
      });
      if (!res.ok) throw new Error("Export failed");
      const result = await res.json();
      setExportedCode(result.code);
      setActiveTab("code");
      toast.add({ message: "Code exported", type: "success" });
    } catch {
      toast.add({ message: "Code export failed", type: "error" });
    }
  }, [currentResult, toast]);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.add({ message: "Copied to clipboard", type: "success" });
  }, [toast]);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setPrompt(entry.prompt);
    setCurrentResult(entry.result);
    setError(null);
    setExportedCode(null);
    setActiveTab("preview");
  }, []);

  const componentCount = Object.keys(defaultRegistry.components).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--entropix-color-bg-primary)",
        color: "var(--entropix-color-text-primary)",
      }}
    >
      <Container maxWidth="xl" style={{ paddingTop: 24, paddingBottom: 48 }}>
        <Stack gap="lg">
          {/* ── Header ── */}
          <Stack gap="xs">
            <Inline gap="sm" align="center">
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                Entropix AI Playground
              </h1>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: "var(--entropix-color-action-primary-default)",
                  color: "#fff",
                  fontWeight: 600,
                }}
              >
                LIVE
              </span>
            </Inline>
            <p style={{ color: "var(--entropix-color-text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              Type a prompt, hit Generate, and watch real Entropix components render live.
              {" "}{componentCount} components available in the registry.
            </p>
          </Stack>

          {/* ── Prompt Input ── */}
          <Stack gap="sm">
            <Textarea
              label="Describe the UI you want to generate"
              placeholder="e.g. A settings page with tabs for Profile, Notifications, and Security..."
              value={prompt}
              onChange={(v: string) => setPrompt(v)}
              rows={3}
            />

            {/* Suggestion chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    borderRadius: 16,
                    border: "1px solid var(--entropix-color-border-default)",
                    background: prompt === s ? "var(--entropix-color-action-primary-default)" : "transparent",
                    color: prompt === s ? "#fff" : "var(--entropix-color-text-secondary)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.length > 60 ? s.slice(0, 57) + "..." : s}
                </button>
              ))}
            </div>

            <Inline gap="sm">
              <Button
                variant="primary"
                onPress={generate}
                disabled={isGenerating || !prompt.trim()}
                loading={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate UI"}
              </Button>
              {currentResult && (
                <>
                  <Button variant="secondary" size="sm" onPress={exportCode}>
                    Export Code
                  </Button>
                  <Button variant="ghost" size="sm" onPress={() => { setCurrentResult(null); setError(null); setPrompt(""); setExportedCode(null); }}>
                    Clear
                  </Button>
                </>
              )}
            </Inline>

            {/* Refine input — appears after generation */}
            {currentResult && (
              <Inline gap="sm">
                <div style={{ flex: 1 }}>
                  <Input
                    label=""
                    placeholder="Refine: e.g. 'make the header blue', 'add a sidebar', 'add more fields'..."
                    value={refineInput}
                    onChange={(v: string) => setRefineInput(v)}
                  />
                </div>
                <Button
                  variant="secondary"
                  onPress={refine}
                  disabled={isRefining || !refineInput.trim()}
                  loading={isRefining}
                >
                  {isRefining ? "Refining..." : "Refine"}
                </Button>
              </Inline>
            )}
          </Stack>

          {/* ── Error ── */}
          {error && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid var(--entropix-color-feedback-error, #ef4444)",
                background: "var(--entropix-color-feedback-bg-error, #fef2f2)",
                color: "var(--entropix-color-feedback-error, #ef4444)",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {/* ── Results ── */}
          {currentResult && (
            <Stack gap="md">
              {/* Stats bar */}
              <Inline gap="lg" wrap>
                {currentResult.usage && (
                  <>
                    <Stat label="Prompt Tokens" value={currentResult.usage.promptTokens.toLocaleString()} />
                    <Stat label="Completion Tokens" value={currentResult.usage.completionTokens.toLocaleString()} />
                  </>
                )}
                <Stat
                  label="Validation"
                  value={(() => {
                    const v = currentResult.validation;
                    if ("structural" in v) {
                      return v.structural.valid && v.registry.valid
                        ? "Valid"
                        : `${(v.structural.errors?.length ?? 0) + (v.registry.errors?.length ?? 0)} issues`;
                    }
                    return v.valid ? "Valid" : `${v.errors?.length ?? 0} issues`;
                  })()}
                />
                <Stat
                  label="Components Used"
                  value={String(countNodes(currentResult.spec.root))}
                />
              </Inline>

              {/* Tabs: Preview / JSON / Validation */}
              <Tabs selectedKey={activeTab} onSelectedKeyChange={setActiveTab}>
                <TabList>
                  <Tab value="preview">Preview</Tab>
                  <Tab value="json">JSON Spec</Tab>
                  <Tab value="code">Code</Tab>
                  <Tab value="validation">Validation</Tab>
                </TabList>

                <TabPanel value="preview">
                  <div
                    style={{
                      padding: 24,
                      borderRadius: 8,
                      border: "1px solid var(--entropix-color-border-default)",
                      background: "var(--entropix-color-bg-primary)",
                      minHeight: 200,
                    }}
                  >
                    <EntropixRenderer
                      spec={currentResult.spec}
                      components={COMPONENT_MAP}
                      onAction={(name, payload) => {
                        toast.add({ message: `Action: ${name}(${JSON.stringify(payload ?? {})})`, type: "info" });
                      }}
                    />
                  </div>
                </TabPanel>

                <TabPanel value="json">
                  <pre
                    style={{
                      padding: 16,
                      borderRadius: 8,
                      border: "1px solid var(--entropix-color-border-default)",
                      background: "var(--entropix-color-bg-secondary, var(--entropix-color-gray-50))",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                      overflow: "auto",
                      maxHeight: 600,
                    }}
                  >
                    {JSON.stringify(currentResult.spec, null, 2)}
                  </pre>
                </TabPanel>

                <TabPanel value="code">
                  <Stack gap="sm">
                    {exportedCode ? (
                      <>
                        <Inline gap="sm" justify="end">
                          <Button variant="outline" size="sm" onPress={() => copyToClipboard(exportedCode)}>
                            Copy Code
                          </Button>
                        </Inline>
                        <pre
                          style={{
                            padding: 16,
                            borderRadius: 8,
                            border: "1px solid var(--entropix-color-border-default)",
                            background: "var(--entropix-color-bg-secondary, var(--entropix-color-gray-50))",
                            fontSize: "0.8rem",
                            lineHeight: 1.5,
                            overflow: "auto",
                            maxHeight: 600,
                          }}
                        >
                          {exportedCode}
                        </pre>
                      </>
                    ) : (
                      <div style={{ padding: 24, textAlign: "center", color: "var(--entropix-color-text-secondary)" }}>
                        <p>Click <strong>Export Code</strong> to convert the UISpec to React JSX.</p>
                        <Button variant="primary" size="sm" onPress={exportCode}>Export Code</Button>
                      </div>
                    )}
                  </Stack>
                </TabPanel>

                <TabPanel value="validation">
                  <Stack gap="md" style={{ padding: 16 }}>
                    {"structural" in currentResult.validation ? (
                      <>
                        <ValidationSection
                          title="Structural (Zod)"
                          result={currentResult.validation.structural}
                        />
                        <Divider />
                        <ValidationSection
                          title="Registry (Component-aware)"
                          result={currentResult.validation.registry}
                        />
                      </>
                    ) : (
                      <ValidationSection
                        title="Combined Validation"
                        result={currentResult.validation}
                      />
                    )}
                  </Stack>
                </TabPanel>
              </Tabs>
            </Stack>
          )}

          {/* ── Welcome state ── */}
          {!currentResult && !isGenerating && !error && (
            <Stack gap="lg" style={{ paddingTop: 24 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {[
                  { step: "1", title: "Enter API Key", body: "Paste your Anthropic API key above. It stays in your browser — never stored." },
                  { step: "2", title: "Describe UI", body: "Type a natural language prompt or click a suggestion chip." },
                  { step: "3", title: "Live Render", body: "Claude generates a UISpec, then EntropixRenderer renders real components." },
                ].map((item) => (
                  <div
                    key={item.step}
                    style={{
                      padding: 20,
                      borderRadius: 8,
                      border: "1px solid var(--entropix-color-border-default)",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--entropix-color-action-primary-default)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        marginBottom: 10,
                      }}
                    >
                      {item.step}
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 4 }}>{item.title}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--entropix-color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </Stack>
          )}

          {/* ── History ── */}
          {history.length > 0 && (
            <Stack gap="sm">
              <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Generation History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => loadFromHistory(entry)}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid var(--entropix-color-border-default)",
                      background: "transparent",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: "0.875rem", color: "var(--entropix-color-text-primary)" }}>
                      {entry.prompt.length > 80 ? entry.prompt.slice(0, 77) + "..." : entry.prompt}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--entropix-color-text-secondary)", whiteSpace: "nowrap" }}>
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </Stack>
          )}

          {/* ── Footer ── */}
          <Divider />
          <p style={{ fontSize: "0.8rem", color: "var(--entropix-color-text-secondary)", textAlign: "center" }}>
            Entropix AI Playground — {componentCount} components in registry — Powered by Claude + @entropix/ai
          </p>
        </Stack>
      </Container>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--entropix-color-text-secondary)", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ValidationSection({ title, result }: { title: string; result: ValidationResult }) {
  return (
    <Stack gap="xs">
      <Inline gap="sm" align="center">
        <span style={{ fontSize: "1rem" }}>{result.valid ? "\u2705" : "\u26A0\uFE0F"}</span>
        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{title}</span>
        <span style={{ fontSize: "0.8rem", color: "var(--entropix-color-text-secondary)" }}>
          {result.valid ? "Passed" : `${result.errors?.length ?? 0} issue(s)`}
        </span>
      </Inline>
      {result.errors && result.errors.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 24, fontSize: "0.8rem", color: "var(--entropix-color-text-secondary)" }}>
          {result.errors.map((err, i) => (
            <li key={i}>
              <code style={{ fontSize: "0.75rem" }}>{err.path}</code>: {err.message}
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countNodes(node: any): number {
  if (!node) return 0;
  if (Array.isArray(node)) return node.reduce((sum, n) => sum + countNodes(n), 0);
  if (typeof node === "object" && node.component) {
    let count = 1;
    if (node.children) count += countNodes(node.children);
    return count;
  }
  return 0;
}
