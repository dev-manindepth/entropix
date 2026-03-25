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
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioItem,
  Select,
  SelectTrigger,
  SelectContent,
  SelectOption,
  ToastProvider,
  useToastContext,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  DatePicker,
  Calendar,
  Breadcrumb,
  BreadcrumbItem,
  Pagination,
  LocaleProvider,
} from "@entropix/react";
import type { EntropixLocale } from "@entropix/core";
import { DataTable, BarChart, LineChart, AreaChart, PieChart } from "@entropix/data";

type Brand = "default" | "ocean" | "sunset";

const CHART_REVENUE = [
  { label: "Jan", value: 4200 },
  { label: "Feb", value: 3800 },
  { label: "Mar", value: 5100 },
  { label: "Apr", value: 4600 },
  { label: "May", value: 5800 },
  { label: "Jun", value: 6200 },
];

const CHART_MULTI = [
  { name: "Revenue", data: [{ label: "Q1", value: 120 }, { label: "Q2", value: 180 }, { label: "Q3", value: 150 }, { label: "Q4", value: 210 }] },
  { name: "Expenses", data: [{ label: "Q1", value: 90 }, { label: "Q2", value: 130 }, { label: "Q3", value: 110 }, { label: "Q4", value: 160 }] },
];

const CHART_PIE = [
  { label: "Chrome", value: 65 },
  { label: "Safari", value: 18 },
  { label: "Firefox", value: 10 },
  { label: "Other", value: 7 },
];

const SAMPLE_DATA = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active" },
  { id: 3, name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive" },
  { id: 4, name: "Dan Brown", email: "dan@example.com", role: "Editor", status: "Active" },
  { id: 5, name: "Eve Davis", email: "eve@example.com", role: "Admin", status: "Active" },
  { id: 6, name: "Frank Miller", email: "frank@example.com", role: "Viewer", status: "Inactive" },
  { id: 7, name: "Grace Lee", email: "grace@example.com", role: "Editor", status: "Active" },
  { id: 8, name: "Hank Wilson", email: "hank@example.com", role: "Viewer", status: "Active" },
  { id: 9, name: "Iris Chen", email: "iris@example.com", role: "Admin", status: "Active" },
  { id: 10, name: "Jack Taylor", email: "jack@example.com", role: "Editor", status: "Inactive" },
  { id: 11, name: "Kate Adams", email: "kate@example.com", role: "Viewer", status: "Active" },
  { id: 12, name: "Leo Garcia", email: "leo@example.com", role: "Admin", status: "Active" },
];

const jaLocale: Partial<EntropixLocale> = {
  locale: "ja-JP",
  direction: "ltr",
  calendar_monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  calendar_dayNames: ["日", "月", "火", "水", "木", "金", "土"],
  calendar_label: "カレンダー",
  calendar_previousMonth: "前月",
  calendar_nextMonth: "翌月",
  calendar_dayLabel: (date: Date) => date.toLocaleDateString("ja-JP", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  datePicker_label: "日付選択",
  datePicker_placeholder: "YYYY/MM/DD",
  pagination_label: "ページネーション",
  pagination_firstPage: "最初のページ",
  pagination_previousPage: "前のページ",
  pagination_nextPage: "次のページ",
  pagination_lastPage: "最後のページ",
  pagination_pageLabel: (page: number) => `${page}ページ`,
  toast_regionLabel: "通知",
  toast_dismiss: "通知を閉じる",
  breadcrumb_label: "パンくずリスト",
  select_placeholder: "選択してください...",
};

export default function DemoLandingPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [brand, setBrand] = useState<Brand>("default");
  const [lang, setLang] = useState<"en" | "ja">("en");
  const [plan, setPlan] = useState("startup");
  const [framework, setFramework] = useState("");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const switchBrand = (newBrand: Brand) => {
    setBrand(newBrand);
    if (newBrand === "default") {
      document.documentElement.removeAttribute("data-brand");
    } else {
      document.documentElement.setAttribute("data-brand", newBrand);
    }
  };

  return (
    <LocaleProvider locale={lang === "ja" ? jaLocale : undefined}>
    <ToastProvider>
    <>
      {/* ── Nav ── */}
      <nav className="nav">
        <Container maxWidth="xl">
          <div className="nav-inner">
            <span className="nav-logo">
              <span>{"{"}</span>E<span>{"}"}</span> Entropix
            </span>
            <Inline gap="sm" wrap>
              <Inline gap="xs">
                <Button
                  variant={brand === "default" ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => switchBrand("default")}
                >
                  Default
                </Button>
                <Button
                  variant={brand === "ocean" ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => switchBrand("ocean")}
                >
                  🌊 Ocean
                </Button>
                <Button
                  variant={brand === "sunset" ? "primary" : "ghost"}
                  size="sm"
                  onPress={() => switchBrand("sunset")}
                >
                  🌅 Sunset
                </Button>
              </Inline>
              <Button variant="ghost" size="sm" onPress={toggleTheme}>
                {theme === "light" ? "🌙 Dark" : "☀️ Light"}
              </Button>
              <Button variant={lang === "ja" ? "primary" : "ghost"} size="sm" onPress={() => setLang(lang === "en" ? "ja" : "en")}>
                {lang === "en" ? "🇯🇵 日本語" : "🇺🇸 EN"}
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
            <code className="code-inline">@entropix/react@0.1.1</code> and{" "}
            <code className="code-inline">@entropix/tokens@0.1.1</code>{" "}
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
                  Headless hooks for Button, Dialog, Tabs, Accordion, Menu, Toggle, Switch,
                  Input, Radio, Select. Platform-agnostic behavior, state, and WAI-ARIA accessibility.
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
                <code className="code-inline">@entropix/react@0.1.1</code> package.
                Fully styled, accessible, and interactive.
              </p>
            </div>

            <Tabs defaultSelectedKey="brands">
              <TabList>
                <Tab value="brands">Brands</Tab>
                <Tab value="buttons">Buttons</Tab>
                <Tab value="controls">Controls</Tab>
                <Tab value="layout">Layout</Tab>
                <Tab value="dialogs">Dialogs</Tab>
                <Tab value="forms">Forms</Tab>
                <Tab value="data">Data</Tab>
                <Tab value="charts">Charts</Tab>
                <Tab value="more">More</Tab>
              </TabList>

              <TabPanel value="brands">
                <div className="demo-box">
                  <Stack gap="lg">
                    <div>
                      <h4 style={{ fontWeight: 600 }}>Multi-Brand Theming</h4>
                      <p style={{ color: "var(--entropix-color-text-secondary)", marginTop: "0.5rem" }}>
                        Switch brands using the nav buttons above. Each brand overrides design tokens
                        (colors, radii, shadows) while sharing the same component code.
                      </p>
                    </div>

                    <div className="demo-grid">
                      <div className="feature-card">
                        <h4 style={{ fontWeight: 600 }}>Current Brand</h4>
                        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--entropix-color-action-primary-default)", marginTop: "0.5rem" }}>
                          {brand === "default" ? "Default (Blue)" : brand === "ocean" ? "🌊 Ocean (Teal)" : "🌅 Sunset (Orange)"}
                        </p>
                      </div>
                      <div className="feature-card">
                        <h4 style={{ fontWeight: 600 }}>Current Theme</h4>
                        <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--entropix-color-action-primary-default)", marginTop: "0.5rem" }}>
                          {theme === "light" ? "☀️ Light" : "🌙 Dark"}
                        </p>
                      </div>
                    </div>

                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Same Components, Different Brands</h4>
                      <Inline gap="sm" wrap>
                        <Button variant="primary">Primary Action</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                      </Inline>
                      <Inline gap="lg" wrap>
                        <Toggle defaultChecked>Toggle</Toggle>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Switch defaultChecked /> Switch
                        </label>
                      </Inline>
                      <Input label="Branded Input" placeholder="Notice the focus color changes per brand" />
                      <Checkbox defaultChecked>Branded checkbox</Checkbox>
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>How it works</h4>
                      <p className="panel-text">
                        Brands use <code className="code-inline">data-brand</code> + <code className="code-inline">data-theme</code> attributes
                        on the root element. CSS variables cascade down — all components automatically adapt.
                      </p>
                      <code className="code-inline" style={{ display: "block", padding: "0.75rem" }}>
                        {'<html data-brand="' + brand + '" data-theme="' + theme + '">'}
                      </code>
                    </Stack>
                  </Stack>
                </div>
              </TabPanel>

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
                        <Toggle>Notifications</Toggle>
                        <Toggle defaultChecked>Marketing emails</Toggle>
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

              <TabPanel value="forms">
                <div className="demo-box">
                  <Stack gap="lg">
                    {/* Inputs */}
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Inputs</h4>
                      <div className="demo-grid">
                        <Input
                          label="Full Name"
                          placeholder="Enter your name"
                          helperText="Your legal name"
                        />
                        <Input
                          label="Email"
                          type="email"
                          placeholder="you@example.com"
                          variant="filled"
                        />
                        <Input
                          label="Username"
                          errorMessage="This field is required"
                        />
                        <Input
                          label="API Key"
                          value="sk-***"
                          disabled
                        />
                      </div>
                      <h4 style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--entropix-color-text-secondary)" }}>
                        Sizes
                      </h4>
                      <Inline gap="sm" wrap>
                        <Input label="Small" size="sm" placeholder="sm" />
                        <Input label="Medium" size="md" placeholder="md" />
                        <Input label="Large" size="lg" placeholder="lg" />
                      </Inline>
                    </Stack>

                    <Divider />

                    {/* Textarea */}
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Textarea</h4>
                      <Textarea
                        label="Bio"
                        placeholder="Tell us about yourself"
                        helperText="Max 200 characters"
                        rows={4}
                      />
                    </Stack>

                    <Divider />

                    {/* Checkboxes */}
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Checkboxes</h4>
                      <Stack gap="sm">
                        <Checkbox>Accept terms and conditions</Checkbox>
                        <Checkbox defaultChecked>Subscribe to newsletter</Checkbox>
                        <Checkbox disabled>Enable notifications</Checkbox>
                      </Stack>
                    </Stack>

                    <Divider />

                    {/* Radio */}
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Radio Group</h4>
                      <RadioGroup
                        label="Select a plan"
                        value={plan}
                        onChange={setPlan}
                      >
                        <RadioItem value="startup">Startup</RadioItem>
                        <RadioItem value="business">Business</RadioItem>
                        <RadioItem value="enterprise">Enterprise</RadioItem>
                      </RadioGroup>
                    </Stack>

                    <Divider />

                    {/* Select */}
                    <Stack gap="md">
                      <h4 style={{ fontWeight: 600 }}>Select</h4>
                      <Select
                        label="Framework"
                        value={framework}
                        onChange={setFramework}
                      >
                        <SelectTrigger placeholder="Choose a framework" />
                        <SelectContent>
                          <SelectOption value="react">React</SelectOption>
                          <SelectOption value="vue">Vue</SelectOption>
                          <SelectOption value="angular">Angular</SelectOption>
                          <SelectOption value="svelte">Svelte</SelectOption>
                        </SelectContent>
                      </Select>
                    </Stack>
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="data">
                <div className="demo-box">
                  <Stack gap="lg">
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>DataTable</h4>
                      <p className="panel-text" style={{ padding: 0 }}>
                        Sortable, filterable, paginated data table with row selection — built from scratch with zero dependencies.
                      </p>
                    </Stack>
                    <DataTable
                      data={SAMPLE_DATA}
                      columns={[
                        { key: "name", header: "Name", sortable: true, filterable: true },
                        { key: "email", header: "Email", sortable: true, filterable: true },
                        { key: "role", header: "Role", sortable: true, filterable: true },
                        { key: "status", header: "Status", sortable: true },
                      ]}
                      selectionMode="multi"
                      pageSize={5}
                      stickyHeader
                      getRowKey={(row) => String(row.id)}
                    />
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="charts">
                <div className="demo-box">
                  <Stack gap="xl">
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Bar Chart</h4>
                      <BarChart data={CHART_REVENUE} height={300} showGrid showTooltip showLegend />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Line Chart (Multi-Series)</h4>
                      <LineChart data={CHART_MULTI} height={300} curved showPoints showGrid showTooltip showLegend />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Area Chart</h4>
                      <AreaChart data={CHART_MULTI} height={300} curved showGrid showTooltip showLegend />
                    </Stack>

                    <Divider />

                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Donut Chart</h4>
                      <PieChart data={CHART_PIE} height={300} innerRadius={0.6} showTooltip showLegend />
                    </Stack>
                  </Stack>
                </div>
              </TabPanel>

              <TabPanel value="more">
                <div className="demo-box">
                  <Stack gap="xl">
                    {/* Breadcrumb */}
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Breadcrumb</h4>
                      <Breadcrumb>
                        <BreadcrumbItem href="#">Home</BreadcrumbItem>
                        <BreadcrumbItem href="#">Shopping</BreadcrumbItem>
                        <BreadcrumbItem href="#">Electronics</BreadcrumbItem>
                        <BreadcrumbItem>Wireless Headphones</BreadcrumbItem>
                      </Breadcrumb>
                    </Stack>

                    <Divider />

                    {/* Pagination */}
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Pagination</h4>
                      <PaginationDemo />
                    </Stack>

                    <Divider />

                    {/* Popover */}
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Popover</h4>
                      <Inline gap="lg" wrap>
                        <Popover>
                          <PopoverTrigger>
                            <Button variant="outline">Click for Popover</Button>
                          </PopoverTrigger>
                          <PopoverContent>
                            <Stack gap="sm" style={{ padding: 8 }}>
                              <p style={{ fontWeight: 600 }}>Settings</p>
                              <p style={{ color: "var(--entropix-color-text-secondary)", fontSize: "0.9rem" }}>
                                Configure your preferences here.
                              </p>
                              <Button variant="primary" size="sm">Save</Button>
                            </Stack>
                          </PopoverContent>
                        </Popover>
                        <Tooltip content="This saves your current progress">
                          <Button variant="secondary">Hover for Tooltip</Button>
                        </Tooltip>
                      </Inline>
                    </Stack>

                    <Divider />

                    {/* DatePicker */}
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>DatePicker & Calendar</h4>
                      <DatePickerDemo />
                    </Stack>

                    <Divider />

                    {/* Toast */}
                    <Stack gap="sm">
                      <h4 style={{ fontWeight: 600 }}>Toast Notifications</h4>
                      <ToastDemo />
                    </Stack>
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
              Built with <code className="code-inline">@entropix/react@0.1.1</code> from npm
            </span>
            <span>MIT License</span>
          </Inline>
        </Container>
      </footer>
    </>
    </ToastProvider>
    </LocaleProvider>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <Stack gap="sm">
      <Pagination totalItems={120} pageSize={10} currentPage={page} onPageChange={setPage} siblingCount={1} />
      <p style={{ color: "var(--entropix-color-text-secondary)", fontSize: "0.85rem" }}>
        Page {page} of 12 (120 total items)
      </p>
    </Stack>
  );
}

function DatePickerDemo() {
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <DatePicker label="Departure Date" placeholder="Select a date" value={date} onChange={setDate} />
      <Stack gap="xs">
        <p style={{ fontWeight: 500 }}>Selected: {date ? date.toLocaleDateString() : "None"}</p>
        <Calendar value={date} onChange={setDate} />
      </Stack>
    </div>
  );
}

function ToastDemo() {
  const toast = useToastContext();
  return (
    <Inline gap="sm" wrap>
      <Button variant="primary" size="sm" onPress={() => toast.add({ message: "Item saved successfully!", type: "success" })}>
        ✓ Success Toast
      </Button>
      <Button variant="danger" size="sm" onPress={() => toast.add({ message: "Something went wrong!", type: "error" })}>
        ✕ Error Toast
      </Button>
      <Button variant="secondary" size="sm" onPress={() => toast.add({ message: "Check your connection", type: "warning" })}>
        ⚠ Warning Toast
      </Button>
      <Button variant="outline" size="sm" onPress={() => toast.add({ message: "New update available", type: "info" })}>
        ℹ Info Toast
      </Button>
    </Inline>
  );
}
