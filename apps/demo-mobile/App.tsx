import React, { useState } from "react";
import { ScrollView, Text, View, useColorScheme } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  EntropixProvider,
  useTheme,
  Button,
  Toggle,
  Switch,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
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
} from "@entropix/react-native";

export default function App() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  return (
    <EntropixProvider mode={isDark ? "dark" : "light"}>
      <SafeAreaProvider style={{ flex: 1 }}>
        <LandingPage isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
      </SafeAreaProvider>
    </EntropixProvider>
  );
}

function LandingPage({
  isDark,
  onToggleTheme,
}: {
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const { tokens: t, baseTokens: bt } = useTheme();

  const [plan, setPlan] = useState("startup");
  const [framework, setFramework] = useState("");

  const textPrimary = t.entropixColorTextPrimary as string;
  const textSecondary = t.entropixColorTextSecondary as string;
  const actionPrimary = t.entropixColorActionPrimaryDefault as string;
  const borderDefault = t.entropixColorBorderDefault as string;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.entropixColorBgPrimary as string }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces
        overScrollMode="always"
      >
        {/* ── Nav ── */}
        <Container maxWidth="xl">
          <Inline justify="between" align="center" style={{ height: 56 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: textPrimary }}>
              <Text style={{ color: actionPrimary }}>{"{"}</Text>
              E
              <Text style={{ color: actionPrimary }}>{"}"}</Text>
              {" "}Entropix
            </Text>
            <Inline gap="xs">
              <Button variant="ghost" size="sm" onPress={onToggleTheme}>
                {isDark ? "Light" : "Dark"}
              </Button>
            </Inline>
          </Inline>
        </Container>

        <Divider />

        {/* ── Hero ── */}
        <Container maxWidth="xl">
          <Stack gap="md" align="center" style={{ paddingVertical: 48 }}>
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: (t.entropixColorActionSecondaryDefault || "#eff6ff") as string,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "500", color: actionPrimary }}>
                📦 Published on npm
              </Text>
            </View>

            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                textAlign: "center",
                letterSpacing: -0.5,
                lineHeight: 38,
                color: textPrimary,
              }}
            >
              Entropix is{"\n"}
              <Text style={{ color: actionPrimary }}>live on npm</Text>
            </Text>

            <Text
              style={{
                fontSize: 15,
                textAlign: "center",
                color: textSecondary,
                lineHeight: 22,
                maxWidth: 360,
              }}
            >
              This app is built using @entropix/react-native@0.1.1 and
              @entropix/tokens@0.1.1 installed from the npm registry.
              No workspace references.
            </Text>

            <View
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: bt.entropixRadiusMd as number,
                backgroundColor: (t.entropixColorBgSecondary || t.entropixColorBgPrimary) as string,
                borderWidth: 1,
                borderColor: borderDefault,
              }}
            >
              <Text style={{ fontFamily: "monospace", fontSize: 13, color: textSecondary }}>
                <Text style={{ color: actionPrimary }}>$ </Text>
                pnpm add @entropix/react-native
              </Text>
            </View>

            <Inline gap="sm" wrap>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                View on npm
              </Button>
            </Inline>
          </Stack>
        </Container>

        <Divider />

        {/* ── Stats ── */}
        <Container maxWidth="xl">
          <View style={{ paddingVertical: 32 }}>
            <Inline justify="around" wrap>
              <StatItem number="4" label="Packages" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="0.1.0" label="Release" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="219" label="Tests" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="0" label="CSS-in-JS" color={actionPrimary} textColor={textSecondary} />
            </Inline>
          </View>
        </Container>

        <Divider />

        {/* ── Packages ── */}
        <Container maxWidth="xl">
          <Stack gap="lg" style={{ paddingVertical: 40 }}>
            <Stack gap="xs">
              <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: actionPrimary }}>
                Packages
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                What you get
              </Text>
              <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 22 }}>
                Four packages from npm — install only what your platform needs.
              </Text>
            </Stack>

            <Stack gap="sm">
              <FeatureCard
                icon="🧠"
                title="@entropix/core"
                desc="Headless hooks for all components. Platform-agnostic behavior, state, and WAI-ARIA accessibility."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🎨"
                title="@entropix/tokens"
                desc="W3C DTCG design tokens compiled to CSS variables and JS objects. Light/dark themes included."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🌐"
                title="@entropix/react"
                desc="Web components with auto-loaded CSS. Import a component, get styled output with zero config."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="📱"
                title="@entropix/react-native"
                desc="iOS & Android components sharing the same headless core. This app uses this package from npm."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="📐"
                title="Layout Primitives"
                desc="Stack, Inline, Container, Divider — responsive layout components with token-driven spacing."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🌗"
                title="Dark Mode"
                desc="Tap the theme toggle above — every component adapts instantly via EntropixProvider."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
            </Stack>
          </Stack>
        </Container>

        <Divider />

        {/* ── Live Demo ── */}
        <Container maxWidth="xl">
          <Stack gap="lg" style={{ paddingVertical: 40 }}>
            <Stack gap="xs">
              <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: actionPrimary }}>
                Production Components
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                All from npm
              </Text>
              <Text style={{ fontSize: 14, color: textSecondary, lineHeight: 20 }}>
                Every component below is imported from the published @entropix/react-native@0.1.1.
              </Text>
            </Stack>

            <Tabs defaultSelectedKey="buttons">
              <TabList>
                <Tab value="buttons">Buttons</Tab>
                <Tab value="controls">Controls</Tab>
                <Tab value="dialogs">Dialogs</Tab>
                <Tab value="forms">Forms</Tab>
              </TabList>

              <TabPanel value="buttons">
                <Stack gap="sm">
                  <Text style={{ fontWeight: "600", color: textPrimary }}>Sizes</Text>
                  <Inline gap="sm" wrap>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="md">Medium</Button>
                    <Button variant="primary" size="lg">Large</Button>
                  </Inline>
                  <Text style={{ fontWeight: "600", color: textPrimary, marginTop: 8 }}>Variants</Text>
                  <Inline gap="sm" wrap>
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="danger">Danger</Button>
                  </Inline>
                  <Text style={{ fontWeight: "600", color: textPrimary, marginTop: 8 }}>States</Text>
                  <Inline gap="sm" wrap>
                    <Button variant="primary" disabled>Disabled</Button>
                    <Button variant="primary" loading>Loading</Button>
                  </Inline>
                </Stack>
              </TabPanel>

              <TabPanel value="controls">
                <Stack gap="md">
                  <Text style={{ fontWeight: "600", color: textPrimary }}>Toggles</Text>
                  <ToggleRow label="Notifications" textColor={textPrimary} />
                  <ToggleRow label="Marketing emails" defaultChecked textColor={textPrimary} />
                  <Divider spacing="sm" />
                  <Text style={{ fontWeight: "600", color: textPrimary }}>Switches</Text>
                  <SwitchRow label="Airplane mode" textColor={textPrimary} />
                  <SwitchRow label="Wi-Fi" defaultChecked textColor={textPrimary} />
                </Stack>
              </TabPanel>

              <TabPanel value="dialogs">
                <Stack gap="sm" align="start">
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Tap to open a fully accessible dialog with the native Modal component.
                  </Text>
                  <Dialog>
                    <DialogTrigger
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: bt.entropixRadiusMd as number,
                        backgroundColor: t.entropixButtonPrimaryBg as string,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: t.entropixButtonPrimaryText as string, fontWeight: "500" }}>
                        Open Dialog
                      </Text>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogClose />
                      <DialogTitle>Delete project?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete the project and all
                        associated data. This action cannot be undone.
                      </DialogDescription>
                      <Inline gap="sm" justify="end" style={{ marginTop: 16 }}>
                        <Button variant="secondary" size="sm">Cancel</Button>
                        <Button variant="danger" size="sm">Delete</Button>
                      </Inline>
                    </DialogContent>
                  </Dialog>
                </Stack>
              </TabPanel>

              <TabPanel value="forms">
                <Stack gap="lg">
                  {/* Inputs */}
                  <Stack gap="sm">
                    <Text style={{ fontWeight: "600", color: textPrimary }}>Inputs</Text>
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
                  </Stack>

                  <Divider />

                  {/* Textarea */}
                  <Stack gap="sm">
                    <Text style={{ fontWeight: "600", color: textPrimary }}>Textarea</Text>
                    <Textarea
                      label="Bio"
                      placeholder="Tell us about yourself"
                      helperText="Max 200 characters"
                      numberOfLines={4}
                    />
                  </Stack>

                  <Divider />

                  {/* Checkboxes */}
                  <Stack gap="sm">
                    <Text style={{ fontWeight: "600", color: textPrimary }}>Checkboxes</Text>
                    <Checkbox>Accept terms and conditions</Checkbox>
                    <Checkbox defaultChecked>Subscribe to newsletter</Checkbox>
                    <Checkbox disabled>Enable notifications</Checkbox>
                  </Stack>

                  <Divider />

                  {/* Radio */}
                  <Stack gap="sm">
                    <Text style={{ fontWeight: "600", color: textPrimary }}>Radio Group</Text>
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
                  <Stack gap="sm">
                    <Text style={{ fontWeight: "600", color: textPrimary }}>Select</Text>
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
              </TabPanel>
            </Tabs>
          </Stack>
        </Container>

        <Divider />

        {/* ── FAQ ── */}
        <Container maxWidth="xl">
          <Stack gap="lg" style={{ paddingVertical: 40 }}>
            <Stack gap="xs" align="center">
              <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: actionPrimary }}>
                Quick Start
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                How to use Entropix
              </Text>
            </Stack>

            <Accordion allowMultiple>
              <AccordionItem value="q1">
                <AccordionTrigger>How do I install for React Native?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Run: pnpm add @entropix/react-native @entropix/tokens{"\n\n"}
                    Then wrap your app with EntropixProvider and start using components.
                    All tokens and themes are included.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How does theming work on native?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Wrap your app with EntropixProvider and pass mode="dark" or
                    mode="light". Use the useTheme() hook to access token values
                    in your components. All Entropix components adapt automatically.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Is this the same API as web?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Yes! Both @entropix/react and @entropix/react-native share the
                    same headless core (@entropix/core). Component APIs, props, and
                    behavior are identical across platforms.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>What&apos;s the architecture?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    @entropix/core — Headless hooks (behavior + accessibility){"\n"}
                    @entropix/tokens — Design tokens (CSS vars + JS objects){"\n"}
                    @entropix/react — Web components (CSS styling){"\n"}
                    @entropix/react-native — Native components (StyleSheet)
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q5" isLast>
                <AccordionTrigger>Is this production-ready?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Entropix 0.1.0 is an initial release with a solid foundation:
                    headless core, W3C tokens, 7 component families, responsive
                    system, and full dark mode. All 219 tests pass.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Stack>
        </Container>

        <Divider />

        {/* ── CTA ── */}
        <Container maxWidth="xl">
          <Stack gap="md" align="center" style={{ paddingVertical: 48 }}>
            <Text style={{ fontSize: 24, fontWeight: "700", textAlign: "center", color: textPrimary }}>
              Start building today
            </Text>
            <Text style={{ fontSize: 16, textAlign: "center", color: textSecondary, lineHeight: 24, maxWidth: 360 }}>
              Install from npm and ship cross-platform UIs in minutes.
            </Text>
            <Inline gap="sm" wrap>
              <Button variant="primary" size="lg">Read the Docs</Button>
              <Button variant="outline" size="lg">View on GitHub</Button>
            </Inline>
          </Stack>
        </Container>

        {/* ── Footer ── */}
        <View style={{ borderTopWidth: 1, borderTopColor: borderDefault, paddingVertical: 20 }}>
          <Container maxWidth="xl">
            <Inline justify="between" wrap>
              <Text style={{ fontSize: 13, color: textSecondary }}>
                Built with @entropix/react-native@0.1.1 from npm
              </Text>
              <Text style={{ fontSize: 13, color: textSecondary }}>MIT License</Text>
            </Inline>
          </Container>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Helper Components ──

function StatItem({ number, label, color, textColor }: { number: string; label: string; color: string; textColor: string }) {
  return (
    <Stack gap="none" align="center" style={{ minWidth: 70, paddingVertical: 4 }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color, lineHeight: 34 }}>{number}</Text>
      <Text style={{ fontSize: 13, color: textColor }}>{label}</Text>
    </Stack>
  );
}

function FeatureCard({ icon, title, desc, borderColor, textColor, titleColor }: {
  icon: string; title: string; desc: string; borderColor: string; textColor: string; titleColor: string;
}) {
  return (
    <View
      style={{
        padding: 20,
        borderWidth: 1,
        borderColor,
        borderRadius: 12,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 8 }}>{icon}</Text>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4, color: titleColor }}>{title}</Text>
      <Text style={{ fontSize: 14, color: textColor, lineHeight: 20 }}>{desc}</Text>
    </View>
  );
}

function ToggleRow({ label, defaultChecked = false, textColor }: { label: string; defaultChecked?: boolean; textColor: string }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Toggle checked={checked} onChange={setChecked} label={label}>
      {label}
    </Toggle>
  );
}

function SwitchRow({ label, defaultChecked = false, textColor }: { label: string; defaultChecked?: boolean; textColor: string }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <Inline gap="sm">
      <Switch checked={checked} onChange={setChecked} label={label} />
      <Text style={{ color: textColor, fontSize: 14 }}>{label}</Text>
    </Inline>
  );
}
