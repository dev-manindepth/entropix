import React, { useState } from "react";
import { ScrollView, Text, View, Alert, useColorScheme } from "react-native";
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
                Open Source Design System
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
              Build interfaces that{"\n"}
              <Text style={{ color: actionPrimary }}>work everywhere</Text>
            </Text>

            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                color: textSecondary,
                lineHeight: 24,
                maxWidth: 400,
              }}
            >
              A cross-platform React design system with headless core
              architecture. One set of tokens, one API.
            </Text>

            <Inline gap="sm" wrap>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
              <Button variant="outline" size="lg">
                GitHub
              </Button>
            </Inline>
          </Stack>
        </Container>

        <Divider />

        {/* ── Stats ── */}
        <Container maxWidth="xl">
          <View style={{ paddingVertical: 32 }}>
            <Inline justify="around" wrap>
              <StatItem number="219" label="Tests" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="26" label="Components" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="2" label="Platforms" color={actionPrimary} textColor={textSecondary} />
              <StatItem number="0" label="CSS-in-JS" color={actionPrimary} textColor={textSecondary} />
            </Inline>
          </View>
        </Container>

        <Divider />

        {/* ── Features ── */}
        <Container maxWidth="xl">
          <Stack gap="lg" style={{ paddingVertical: 40 }}>
            <Stack gap="xs">
              <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: actionPrimary }}>
                Why Entropix
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                Cross-platform UI toolkit
              </Text>
              <Text style={{ fontSize: 15, color: textSecondary, lineHeight: 22 }}>
                Built from the ground up with a headless core that separates
                behavior from rendering.
              </Text>
            </Stack>

            <Stack gap="sm">
              <FeatureCard
                icon="🧩"
                title="Headless Core"
                desc="All behavior, state, and accessibility shared across Web and React Native."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🎨"
                title="W3C Design Tokens"
                desc="DTCG-standard tokens compile to CSS variables and JS objects."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🌗"
                title="Dark Mode Built-in"
                desc="Every component adapts instantly with one toggle."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="♿"
                title="Fully Accessible"
                desc="WAI-ARIA patterns, keyboard navigation, focus management, and screen reader support."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="📐"
                title="Responsive System"
                desc="Breakpoint tokens, adaptive layouts, and useBreakpoint() hooks."
                borderColor={borderDefault}
                textColor={textSecondary}
                titleColor={textPrimary}
              />
              <FeatureCard
                icon="🪶"
                title="Zero Runtime CSS-in-JS"
                desc="Plain CSS on web. No styled-components or Emotion overhead."
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
                Live Demo
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                Try the components
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

              <TabPanel value="forms">
                <FormsDemo textPrimary={textPrimary} />
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
            </Tabs>
          </Stack>
        </Container>

        <Divider />

        {/* ── FAQ ── */}
        <Container maxWidth="xl">
          <Stack gap="lg" style={{ paddingVertical: 40 }}>
            <Stack gap="xs" align="center">
              <Text style={{ fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: actionPrimary }}>
                FAQ
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", letterSpacing: -0.3, color: textPrimary }}>
                Common questions
              </Text>
            </Stack>

            <Accordion allowMultiple>
              <AccordionItem value="q1">
                <AccordionTrigger>What platforms are supported?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    React (Web) and React Native (iOS/Android). Both share the
                    same headless core and design tokens for consistent behavior.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>How does theming work?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Tokens compile to CSS variables (web) and JS objects (native).
                    Switch themes with data-theme on web or EntropixProvider mode
                    on native.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>Is accessibility built-in?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Yes. Every component follows WAI-ARIA patterns with proper
                    roles, keyboard navigation, and focus management in the
                    headless core.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>Can I customize the tokens?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Absolutely. Tokens are layered: primitives, semantic, themes,
                    and components. Override any layer and rebuild with Style
                    Dictionary.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem value="q5" isLast>
                <AccordionTrigger>What&apos;s the bundle impact?</AccordionTrigger>
                <AccordionPanel>
                  <Text style={{ color: textSecondary, fontSize: 14, lineHeight: 20 }}>
                    Plain CSS on web (no runtime CSS-in-JS), tree-shakeable ESM
                    exports. Core hooks package is under 5KB gzipped.
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
              Ready to build?
            </Text>
            <Text style={{ fontSize: 16, textAlign: "center", color: textSecondary, lineHeight: 24, maxWidth: 360 }}>
              Get started with Entropix in under 5 minutes. Install, import, ship.
            </Text>
            <Inline gap="sm" wrap>
              <Button variant="primary" size="lg">Read the Docs</Button>
              <Button variant="outline" size="lg">View Components</Button>
            </Inline>
          </Stack>
        </Container>

        {/* ── Footer ── */}
        <View style={{ borderTopWidth: 1, borderTopColor: borderDefault, paddingVertical: 20 }}>
          <Container maxWidth="xl">
            <Inline justify="between" wrap>
              <Text style={{ fontSize: 13, color: textSecondary }}>
                Built with Entropix Design System
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
    <Inline gap="sm">
      <Toggle checked={checked} onChange={setChecked} label={label} />
      <Text style={{ color: textColor, fontSize: 14 }}>{label}</Text>
    </Inline>
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

function FormsDemo({ textPrimary }: { textPrimary: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [plan, setPlan] = useState("");
  const [framework, setFramework] = useState("");

  return (
    <Stack gap="lg">
      {/* Input section */}
      <Stack gap="sm">
        <Text style={{ fontWeight: "600", color: textPrimary }}>Inputs</Text>
        <Input
          label="Full Name"
          placeholder="Enter your name"
          helperText="Your legal name"
          value={name}
          onChange={setName}
        />
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
        />
        <Input
          label="Username"
          errorMessage="This field is required"
          value={username}
          onChange={setUsername}
        />
        <Input
          label="API Key"
          value="sk-***"
          disabled
        />
      </Stack>

      {/* Textarea section */}
      <Stack gap="sm">
        <Text style={{ fontWeight: "600", color: textPrimary }}>Textarea</Text>
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself"
          helperText="Max 200 characters"
          rows={4}
          value={bio}
          onChange={setBio}
        />
      </Stack>

      {/* Checkbox section */}
      <Stack gap="sm">
        <Text style={{ fontWeight: "600", color: textPrimary }}>Checkboxes</Text>
        <Checkbox
          label="Accept terms"
          checked={acceptTerms}
          onChange={setAcceptTerms}
        />
        <Checkbox
          label="Newsletter"
          checked={newsletter}
          onChange={setNewsletter}
        />
        <Checkbox
          label="Notifications"
          checked={notifications}
          onChange={setNotifications}
          disabled
        />
      </Stack>

      {/* Radio section */}
      <Stack gap="sm">
        <Text style={{ fontWeight: "600", color: textPrimary }}>Radio Group</Text>
        <RadioGroup value={plan} onChange={setPlan}>
          <RadioItem value="startup" label="Startup" />
          <RadioItem value="business" label="Business" />
          <RadioItem value="enterprise" label="Enterprise" />
        </RadioGroup>
      </Stack>

      {/* Select section */}
      <Stack gap="sm">
        <Text style={{ fontWeight: "600", color: textPrimary }}>Select</Text>
        <Select value={framework} onChange={setFramework}>
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
  );
}
