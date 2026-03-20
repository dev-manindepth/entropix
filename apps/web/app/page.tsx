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

export default function LandingPage() {
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
          <div className="hero-badge">Open Source Design System</div>
          <h1>
            Build interfaces that
            <br />
            <span className="gradient">work everywhere</span>
          </h1>
          <p className="hero-sub">
            A cross-platform React design system with headless core architecture.
            One set of tokens, one API — for Web and React Native.
          </p>
          <Inline gap="sm" justify="center" wrap>
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              View on GitHub
            </Button>
          </Inline>
        </section>
      </Container>

      <Divider />

      {/* ── Stats ── */}
      <Container maxWidth="xl">
        <section className="section">
          <div className="stats-grid">
            <div>
              <div className="stat-number">219</div>
              <div className="stat-label">Tests passing</div>
            </div>
            <div>
              <div className="stat-number">26</div>
              <div className="stat-label">Components</div>
            </div>
            <div>
              <div className="stat-number">2</div>
              <div className="stat-label">Platforms</div>
            </div>
            <div>
              <div className="stat-number">0</div>
              <div className="stat-label">Runtime CSS-in-JS</div>
            </div>
          </div>
        </section>
      </Container>

      <Divider />

      {/* ── Features ── */}
      <Container maxWidth="xl">
        <section className="section">
          <Stack gap="xl">
            <div>
              <p className="section-label">Why Entropix</p>
              <h2 className="section-heading">
                Everything you need for cross-platform UI
              </h2>
              <p className="section-desc">
                Built from the ground up with a headless core that separates
                component behavior from platform rendering.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🧩</div>
                <h3>Headless Core</h3>
                <p>
                  All behavior, state, and accessibility lives in{" "}
                  <code className="code-inline">@entropix/core</code> — shared
                  across Web and React Native.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎨</div>
                <h3>W3C Design Tokens</h3>
                <p>
                  Token-driven theming using the DTCG standard. One source of truth
                  compiles to CSS variables and JS objects.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌗</div>
                <h3>Dark Mode Built-in</h3>
                <p>
                  Flip <code className="code-inline">data-theme</code> on web or
                  pass <code className="code-inline">mode="dark"</code> on native.
                  Every component adapts instantly.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">♿</div>
                <h3>Fully Accessible</h3>
                <p>
                  WAI-ARIA patterns built into the headless core. Keyboard
                  navigation, focus trapping, and screen reader support.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📐</div>
                <h3>Responsive System</h3>
                <p>
                  Breakpoint tokens, adaptive layouts, mobile bottom-sheet
                  dialogs, and <code className="code-inline">useBreakpoint()</code>{" "}
                  hooks for both platforms.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🪶</div>
                <h3>Zero Runtime CSS-in-JS</h3>
                <p>
                  Web uses plain CSS with custom properties. No styled-components,
                  no Emotion, no runtime overhead.
                </p>
              </div>
            </div>
          </Stack>
        </section>
      </Container>

      <Divider />

      {/* ── Live Demo: Tabs ── */}
      <Container maxWidth="xl">
        <section className="section">
          <Stack gap="xl">
            <div>
              <p className="section-label">See it in action</p>
              <h2 className="section-heading">Interactive components</h2>
              <p className="section-desc">
                Every component below is built with Entropix. Try clicking,
                toggling, and navigating with your keyboard.
              </p>
            </div>

            <Tabs defaultSelectedKey="buttons">
              <TabList>
                <Tab value="buttons">Buttons</Tab>
                <Tab value="controls">Controls</Tab>
                <Tab value="dialogs">Dialogs</Tab>
              </TabList>

              <TabPanel value="buttons">
                <div className="demo-box">
                  <Stack gap="md">
                    <Inline gap="sm" wrap>
                      <Button variant="primary" size="sm">Small</Button>
                      <Button variant="primary" size="md">Medium</Button>
                      <Button variant="primary" size="lg">Large</Button>
                    </Inline>
                    <Inline gap="sm" wrap>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="danger">Danger</Button>
                    </Inline>
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

              <TabPanel value="dialogs">
                <div className="demo-box">
                  <Stack gap="md" align="start">
                    <p style={{ color: "var(--entropix-color-text-secondary)" }}>
                      On desktop, the dialog appears centered. On mobile
                      (&lt;768px), it becomes a bottom sheet.
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
              <p className="section-label">FAQ</p>
              <h2 className="section-heading">Frequently asked questions</h2>
            </div>

            <Container maxWidth="md" style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Accordion allowMultiple>
                <AccordionItem value="q1">
                  <AccordionTrigger>What platforms does Entropix support?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Entropix currently supports React (Web) via{" "}
                      <code className="code-inline">@entropix/react</code> and
                      React Native (iOS/Android) via{" "}
                      <code className="code-inline">@entropix/react-native</code>.
                      Both share the same headless core and design tokens.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q2">
                  <AccordionTrigger>How does theming work across platforms?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Tokens are defined once in W3C DTCG format and compiled to
                      CSS custom properties for web and JavaScript objects for
                      React Native. On web, set{" "}
                      <code className="code-inline">data-theme=&quot;dark&quot;</code>{" "}
                      to switch themes. On native, pass{" "}
                      <code className="code-inline">mode=&quot;dark&quot;</code> to
                      the EntropixProvider.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q3">
                  <AccordionTrigger>Is it accessible out of the box?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Yes. Every component follows WAI-ARIA patterns with proper
                      roles, states, keyboard navigation, and focus management
                      built into the headless core. Web components support full
                      keyboard interaction, and React Native components map to
                      native accessibility APIs.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q4">
                  <AccordionTrigger>Can I customize the design tokens?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Absolutely. Tokens are organized in layers: primitives
                      (raw values), semantic (purpose-driven), themes
                      (overrides per mode), and component tokens. You can
                      override any layer by adding your own JSON files and
                      rebuilding with Style Dictionary.
                    </p>
                  </AccordionPanel>
                </AccordionItem>
                <AccordionItem value="q5">
                  <AccordionTrigger>What&apos;s the bundle size impact?</AccordionTrigger>
                  <AccordionPanel>
                    <p className="panel-text">
                      Entropix uses plain CSS (no runtime CSS-in-JS) and
                      tree-shakeable ESM exports. You only bundle the components
                      you import. The core hooks package is under 5KB gzipped.
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
          <h2>Ready to build?</h2>
          <p>
            Get started with Entropix in under 5 minutes. Install, import, ship.
          </p>
          <Inline gap="sm" justify="center" wrap>
            <Button variant="primary" size="lg">
              Read the Docs
            </Button>
            <Button variant="outline" size="lg">
              View Components
            </Button>
          </Inline>
        </section>
      </Container>

      {/* ── Footer ── */}
      <footer className="footer">
        <Container maxWidth="xl">
          <Inline justify="between" wrap>
            <span>
              Built with Entropix Design System
            </span>
            <span>MIT License</span>
          </Inline>
        </Container>
      </footer>
    </>
  );
}
