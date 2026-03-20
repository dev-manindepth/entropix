"use client";

import { useState } from "react";
import {
  Button,
  Toggle,
  Switch,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionPanel,
  Container,
  Stack,
  Inline,
  Divider,
} from "@entropix/react";

export default function DemoLandingPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <>
      {/* ── Nav ── */}
      <nav className="nav">
        <Container maxWidth="xl">
          <div className="nav-inner">
            <span className="nav-logo">
              <span>{"{"}</span>E<span>{"}"}</span> Entropix
            </span>
            <Inline gap="sm">
              <Button variant="ghost" size="sm" onPress={toggleTheme}>
                {theme === "light" ? "Dark" : "Light"}
              </Button>
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Inline>
          </div>
        </Container>
      </nav>

      {/* ── Hero ── */}
      <Container maxWidth="xl">
        <section className="hero">
          <div className="hero-badge">📦 Published on npm</div>
          <h1>
            Entropix is
            <br />
            <span className="gradient">live on npm</span>
          </h1>
          <p className="hero-sub">
            This entire page is built using{" "}
            <code className="code-inline">@entropix/react@0.1.0</code> and{" "}
            <code className="code-inline">@entropix/tokens@0.1.0</code>{" "}
            installed from the npm registry. No local workspace references.
          </p>
          <Inline gap="sm" justify="center" wrap>
            <Button variant="primary" size="lg">
              npm install @entropix/react
            </Button>
            <Button variant="outline" size="lg">
              View on npm
            </Button>
          </Inline>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem" }}>
            <div className="install-cmd">
              <span className="prompt">$</span>
              <span>pnpm add @entropix/react @entropix/tokens</span>
            </div>
          </div>
        </section>
      </Container>

      <Divider />

      {/* ── Stats ── */}
      <Container maxWidth="xl">
        <section className="section">
          <div className="stats-grid">
            <div>
              <div className="stat-number">4</div>
              <div className="stat-label">Packages published</div>
            </div>
            <div>
              <div className="stat-number">0.1.0</div>
              <div className="stat-label">First release</div>
            </div>
            <div>
              <div className="stat-number">219</div>
              <div className="stat-label">Tests passing</div>
            </div>
            <div>
              <div className="stat-number">~145 KB</div>
              <div className="stat-label">Total unpacked</div>
            </div>
          </div>
        </section>
      </Container>

      <Divider />

      {/* ── Package Overview ── */}
      <Container maxWidth="xl">
        <section className="section">
          <Stack gap="xl">
            <div>
              <p className="section-label">Packages</p>
              <h2 className="section-heading">What you get</h2>
              <p className="section-desc">
                Four packages that work together — install only what you need for your platform.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>@entropix/core</h3>
                <p>
                  Headless hooks for Button, Dialog, Tabs, Accordion, Menu, Toggle, Switch.
                  Platform-agnostic behavior, state, and WAI-ARIA accessibility.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>@entropix/tokens</h3>
                <p>
                  W3C DTCG design tokens compiled to CSS custom properties and JS objects.
                  Light/dark themes included. Override any layer with Style Dictionary.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌐</div>
                <h3>@entropix/react</h3>
                <p>
                  Web components with auto-loaded CSS styles. Import a component, get styled
                  output with zero config. This page uses this package.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h3>@entropix/react-native</h3>
                <p>
                  iOS & Android components sharing the same headless core.
                  StyleSheet-based styling with token-driven themes via EntropixProvider.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📐</div>
                <h3>Layout Primitives</h3>
                <p>
                  Stack, Inline, Container, Divider — responsive layout components
                  with token-driven spacing. One API across web and native.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌗</div>
                <h3>Dark Mode</h3>
                <p>
                  Click the theme toggle above — every component on this page adapts instantly
                  via <code className="code-inline">data-theme</code> attribute swap.
                </p>
              </div>
            </div>
          </Stack>
        </section>
      </Container>

      <Divider />

      {/* ── Live Component Demo ── */}
      <Container maxWidth="xl">
        <section className="section">
          <Stack gap="xl">
            <div>
              <p className="section-label">Production Components</p>
              <h2 className="section-heading">All from npm — zero local code</h2>
              <p className="section-desc">
                Every component below is imported from the published{" "}
                <code className="code-inline">@entropix/react@0.1.0</code> package.
                Fully styled, accessible, and interactive.
              </p>
            </div>

            <Tabs defaultSelectedKey="buttons">
              <TabList>
                <Tab value="buttons">Buttons</Tab>
                <Tab value="controls">Controls</Tab>
                <Tab value="layout">Layout</Tab>
                <Tab value="dialogs">Dialogs</Tab>
              </TabList>

              <TabPanel value="buttons">
                <div className="demo-box">
                  <Stack gap="md">
                    <h4 style={{ fontWeight: 600 }}>Sizes</h4>
                    <Inline gap="sm" wrap>
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </Inline>

                    <h4 style={{ fontWeight: 600, marginTop: "0.5rem" }}>Variants</h4>
                    <Inline gap="sm" wrap>
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="danger">Danger</Button>
                    </Inline>

                    <h4 style={{ fontWeight: 600, marginTop: "0.5rem" }}>States</h4>
                    <Inline gap="sm" wrap>
                      <Button variant="primary" disabled>Disabled</Button>
                      <Button variant="primary" loading>Loading</Button>
                    </Inline>
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="controls">
                <div className="demo-box">
                  <Stack gap="lg">
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Toggles</h4>
                      <Inline gap="lg" wrap>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Toggle /> Notifications
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Toggle defaultChecked /> Marketing emails
                        </label>
                      </Inline>
                    </Stack>
                    <Divider />
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Switches</h4>
                      <Inline gap="lg" wrap>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Switch /> Airplane mode
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Switch defaultChecked /> Wi-Fi
                        </label>
                      </Inline>
                    </Stack>
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="layout">
                <div className="demo-box">
                  <Stack gap="md">
                    <h4 style={{ fontWeight: 600 }}>Stack (vertical)</h4>
                    <Stack gap="sm">
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Stack item 1
                      </div>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Stack item 2
                      </div>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Stack item 3
                      </div>
                    </Stack>

                    <Divider spacing="sm" />

                    <h4 style={{ fontWeight: 600 }}>Inline (horizontal)</h4>
                    <Inline gap="sm" wrap>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Inline A
                      </div>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Inline B
                      </div>
                      <div style={{ padding: "0.75rem 1rem", background: "var(--entropix-color-action-secondary-default)", borderRadius: "var(--entropix-radius-md)" }}>
                        Inline C
                      </div>
                    </Inline>

                    <Divider spacing="sm" />

                    <h4 style={{ fontWeight: 600 }}>Divider (above &amp; below)</h4>
                    <Divider />
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="dialogs">
                <div className="demo-box">
                  <Stack gap="md" align="start">
                    <p style={{ color: "var(--entropix-color-text-secondary)" }}>
                      Click the button to open a fully accessible dialog.
                      On mobile (&lt;768px), it becomes a bottom sheet.
                    </p>
                    <Dialog>
                      <DialogTrigger>
                        <Button variant="primary">Open Dialog</Button>
                      </DialogTrigger>
                      <DialogOverlay>
                        <DialogContent>
                          <DialogTitle>Delete project?</DialogTitle>
                          <DialogDescription>
                            This will permanently delete the project and all
                            associated data. This action cannot be undone.
                          </DialogDescription>
                          <Inline gap="sm" justify="end" style={{ marginTop: "1rem" }}>
                            <DialogClose>
                              <Button variant="secondary" size="sm">Cancel</Button>
                            </DialogClose>
                            <DialogClose>
                              <Button variant="danger" size="sm">Delete</Button>
                            </DialogClose>
                          </Inline>
                        </DialogContent>
                      </DialogOverlay>
                    </Dialog>
                  </Stack>
                </div>
              </TabPanel>
            </Tabs>
          </Stack>
        </section>
      </Container>

      <Divider />

      {/* ── FAQ ── */}
      <Container maxWidth="xl">
        <section className="section">
          <Stack gap="xl">
            <div style={{ textAlign: "center" }}>
              <p className="section-label">Quick Start</p>
              <h2 className="section-heading">How to use Entropix</h2>
            </div>

            <Container maxWidth="md" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Accordion allowMultiple>
                <AccordionItem value="q1">
                  <AccordionTrigger>How do I install Entropix?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      For web: <code className="code-inline">pnpm add @entropix/react @entropix/tokens</code>
                      <br /><br />
                      For React Native: <code className="code-inline">pnpm add @entropix/react-native @entropix/tokens</code>
                      <br /><br />
                      Both packages are published on npm under the <code className="code-inline">@entropix</code> scope.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>How do I set up theming?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      On web, import the token CSS and theme files in your global CSS:
                      <br /><br />
                      <code className="code-inline">@import &quot;@entropix/tokens/css&quot;;</code><br />
                      <code className="code-inline">@import &quot;@entropix/tokens/themes/light&quot;;</code><br />
                      <code className="code-inline">@import &quot;@entropix/tokens/themes/dark&quot;;</code><br />
                      <code className="code-inline">@import &quot;@entropix/react/styles&quot;;</code>
                      <br /><br />
                      Then toggle themes by setting <code className="code-inline">data-theme=&quot;dark&quot;</code> on
                      your root HTML element.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Do I need to import CSS for each component?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      No! CSS is auto-loaded via side-effect imports. When you{" "}
                      <code className="code-inline">import {"{"} Button {"}"} from &quot;@entropix/react&quot;</code>,
                      the bundler automatically pulls in the Button CSS. Just import{" "}
                      <code className="code-inline">@entropix/react/styles</code> once for the combined stylesheet.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>Is this production-ready?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Entropix 0.1.0 is an initial release with a solid foundation: headless core,
                      W3C tokens, 7 component families, responsive system, and full dark mode.
                      More components will be added in upcoming releases. All 219 tests pass.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q5">
                  <AccordionTrigger>What&apos;s the architecture?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      <strong>@entropix/core</strong> — Headless hooks (behavior + accessibility)<br />
                      <strong>@entropix/tokens</strong> — Design tokens (CSS vars + JS objects)<br />
                      <strong>@entropix/react</strong> — Web components (CSS styling)<br />
                      <strong>@entropix/react-native</strong> — Native components (StyleSheet)<br /><br />
                      Core hooks are shared across platforms. Each platform adapter adds
                      its own rendering layer while keeping behavior identical.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Container>
          </Stack>
        </section>
      </Container>

      <Divider />

      {/* ── CTA ── */}
      <Container maxWidth="xl">
        <section className="cta-section">
          <h2>Start building today</h2>
          <p>
            Install from npm and ship cross-platform UIs in minutes.
          </p>
          <Inline gap="sm" justify="center" wrap>
            <Button variant="primary" size="lg">
              Read the Docs
            </Button>
            <Button variant="outline" size="lg">
              View on GitHub
            </Button>
          </Inline>
        </section>
      </Container>

      {/* ── Footer ── */}
      <footer className="footer">
        <Container maxWidth="xl">
          <Inline justify="between" wrap>
            <span>
              Built with <code className="code-inline">@entropix/react@0.1.0</code> from npm
            </span>
            <span>MIT License</span>
          </Inline>
        </Container>
      </footer>
    </>
  );
}
