"use client";

import { useState, useMemo, useCallback } from "react";
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
} from "@entropix/react";
import { DataTable, BarChart, LineChart, AreaChart, PieChart } from "@entropix/data";
import {
  EntropixRenderer,
  createWebComponentMap,
  validateSpec,
  validateSpecAgainstRegistry,
  defaultRegistry,
} from "@entropix/ai";
import type { UISpec, ValidationResult } from "@entropix/ai";
import type { ComponentMap } from "@entropix/ai";

// ---------------------------------------------------------------------------
// Component map — built once from the real Entropix packages
// ---------------------------------------------------------------------------

import * as EntropixReact from "@entropix/react";
import * as EntropixData from "@entropix/data";

const COMPONENT_MAP: ComponentMap = createWebComponentMap(
  EntropixReact as unknown as Record<string, unknown>,
  EntropixData as unknown as Record<string, unknown>,
);

// ---------------------------------------------------------------------------
// Pre-built example specs
// ---------------------------------------------------------------------------

interface ExampleSpec {
  title: string;
  description: string;
  keywords: string[];
  spec: UISpec;
}

const EXAMPLE_SPECS: ExampleSpec[] = [
  {
    title: "Pricing Table",
    description: "Three-tier pricing cards with features and CTAs",
    keywords: ["pricing", "price", "plan", "tier", "subscription", "billing"],
    spec: {
      version: "1.0",
      meta: {
        title: "Pricing Table",
        description: "Three-tier pricing layout with Basic, Pro, and Enterprise plans",
      },
      root: {
        component: "Container",
        props: { size: "lg" },
        children: [
          {
            component: "Stack",
            props: { gap: "lg" },
            children: [
              {
                component: "Stack",
                props: { gap: "sm" },
                children: [
                  {
                    component: "Container",
                    children: "Choose Your Plan",
                    props: { size: "sm" },
                  },
                ],
              },
              {
                component: "Inline",
                props: { gap: "lg" },
                children: [
                  {
                    component: "Stack",
                    key: "basic",
                    props: { gap: "md" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "sm" },
                        children: [
                          { component: "Button", props: { variant: "outline", size: "sm", disabled: true }, children: "Basic" },
                          { component: "Container", children: "$9/mo" },
                          { component: "Divider" },
                          { component: "Container", children: "5 projects" },
                          { component: "Container", children: "1 GB storage" },
                          { component: "Container", children: "Email support" },
                        ],
                      },
                      { component: "Button", props: { variant: "outline" }, children: "Get Started" },
                    ],
                  },
                  {
                    component: "Stack",
                    key: "pro",
                    props: { gap: "md" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "sm" },
                        children: [
                          { component: "Button", props: { variant: "primary", size: "sm", disabled: true }, children: "Pro" },
                          { component: "Container", children: "$29/mo" },
                          { component: "Divider" },
                          { component: "Container", children: "Unlimited projects" },
                          { component: "Container", children: "10 GB storage" },
                          { component: "Container", children: "Priority support" },
                          { component: "Container", children: "API access" },
                        ],
                      },
                      { component: "Button", props: { variant: "primary" }, children: "Upgrade to Pro" },
                    ],
                  },
                  {
                    component: "Stack",
                    key: "enterprise",
                    props: { gap: "md" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "sm" },
                        children: [
                          { component: "Button", props: { variant: "outline", size: "sm", disabled: true }, children: "Enterprise" },
                          { component: "Container", children: "Custom" },
                          { component: "Divider" },
                          { component: "Container", children: "Everything in Pro" },
                          { component: "Container", children: "Unlimited storage" },
                          { component: "Container", children: "Dedicated support" },
                          { component: "Container", children: "Custom integrations" },
                          { component: "Container", children: "SLA guarantee" },
                        ],
                      },
                      { component: "Button", props: { variant: "outline" }, children: "Contact Sales" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "User Profile",
    description: "Profile card with avatar, info, and settings tabs",
    keywords: ["user", "profile", "account", "avatar", "settings", "bio"],
    spec: {
      version: "1.0",
      meta: {
        title: "User Profile",
        description: "User profile card with editable fields and settings tabs",
      },
      root: {
        component: "Container",
        props: { size: "sm" },
        children: [
          {
            component: "Stack",
            props: { gap: "lg" },
            children: [
              {
                component: "Inline",
                props: { gap: "lg", align: "center" },
                children: [
                  {
                    component: "Button",
                    props: { variant: "outline", size: "lg", disabled: true },
                    children: "JD",
                  },
                  {
                    component: "Stack",
                    props: { gap: "xs" },
                    children: [
                      { component: "Container", children: "Jane Doe" },
                      { component: "Container", children: "jane.doe@example.com" },
                      { component: "Container", children: "Senior Product Designer" },
                    ],
                  },
                ],
              },
              { component: "Divider" },
              {
                component: "Tabs",
                props: { defaultValue: "about" },
                children: [
                  {
                    component: "TabList",
                    children: [
                      { component: "Tab", props: { value: "about" }, children: "About" },
                      { component: "Tab", props: { value: "settings" }, children: "Settings" },
                      { component: "Tab", props: { value: "security" }, children: "Security" },
                    ],
                  },
                  {
                    component: "TabPanel",
                    props: { value: "about" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "md" },
                        children: [
                          {
                            component: "Stack",
                            props: { gap: "xs" },
                            children: [
                              { component: "Container", children: "Bio" },
                              { component: "Container", children: "Passionate about creating intuitive user experiences that delight and inspire." },
                            ],
                          },
                          {
                            component: "Inline",
                            props: { gap: "sm" },
                            children: [
                              { component: "Button", props: { variant: "primary", size: "sm" }, children: "Edit Profile" },
                              { component: "Button", props: { variant: "outline", size: "sm" }, children: "View Public Profile" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    component: "TabPanel",
                    props: { value: "settings" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "md" },
                        children: [
                          { component: "Input", props: { label: "Display Name", defaultValue: "Jane Doe" } },
                          { component: "Input", props: { label: "Email", defaultValue: "jane.doe@example.com" } },
                          { component: "Textarea", props: { label: "Bio", defaultValue: "Passionate about creating intuitive user experiences." } },
                          { component: "Button", props: { variant: "primary" }, children: "Save Changes" },
                        ],
                      },
                    ],
                  },
                  {
                    component: "TabPanel",
                    props: { value: "security" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "md" },
                        children: [
                          { component: "Input", props: { label: "Current Password", type: "password" } },
                          { component: "Input", props: { label: "New Password", type: "password" } },
                          { component: "Input", props: { label: "Confirm Password", type: "password" } },
                          { component: "Button", props: { variant: "primary" }, children: "Update Password" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Dashboard",
    description: "Stats cards, bar chart, and data table",
    keywords: ["dashboard", "stats", "analytics", "metrics", "chart", "table", "overview"],
    spec: {
      version: "1.0",
      meta: {
        title: "Dashboard",
        description: "Analytics dashboard with metrics, chart, and data table",
      },
      root: {
        component: "Container",
        props: { size: "lg" },
        children: [
          {
            component: "Stack",
            props: { gap: "lg" },
            children: [
              { component: "Container", children: "Dashboard Overview" },
              {
                component: "Inline",
                props: { gap: "md" },
                children: [
                  {
                    component: "Stack",
                    key: "metric-1",
                    props: { gap: "xs" },
                    children: [
                      { component: "Container", children: "Total Users" },
                      { component: "Container", children: "12,847" },
                      { component: "Container", children: "+14.2% from last month" },
                    ],
                  },
                  {
                    component: "Stack",
                    key: "metric-2",
                    props: { gap: "xs" },
                    children: [
                      { component: "Container", children: "Revenue" },
                      { component: "Container", children: "$48,352" },
                      { component: "Container", children: "+8.1% from last month" },
                    ],
                  },
                  {
                    component: "Stack",
                    key: "metric-3",
                    props: { gap: "xs" },
                    children: [
                      { component: "Container", children: "Active Sessions" },
                      { component: "Container", children: "3,421" },
                      { component: "Container", children: "+22.5% from last month" },
                    ],
                  },
                  {
                    component: "Stack",
                    key: "metric-4",
                    props: { gap: "xs" },
                    children: [
                      { component: "Container", children: "Conversion Rate" },
                      { component: "Container", children: "3.24%" },
                      { component: "Container", children: "+0.8% from last month" },
                    ],
                  },
                ],
              },
              { component: "Divider" },
              {
                component: "Stack",
                props: { gap: "sm" },
                children: [
                  { component: "Container", children: "Revenue Trend" },
                  {
                    component: "BarChart",
                    props: {
                      data: [
                        { label: "Jan", value: 4200 },
                        { label: "Feb", value: 3800 },
                        { label: "Mar", value: 5100 },
                        { label: "Apr", value: 4600 },
                        { label: "May", value: 5800 },
                        { label: "Jun", value: 6200 },
                      ],
                      height: 250,
                    },
                  },
                ],
              },
              { component: "Divider" },
              {
                component: "Stack",
                props: { gap: "sm" },
                children: [
                  { component: "Container", children: "Recent Orders" },
                  {
                    component: "DataTable",
                    props: {
                      columns: [
                        { key: "id", header: "Order ID", sortable: true },
                        { key: "customer", header: "Customer", sortable: true },
                        { key: "amount", header: "Amount", sortable: true },
                        { key: "status", header: "Status" },
                      ],
                      data: [
                        { id: "#1001", customer: "Alice Johnson", amount: "$245.00", status: "Completed" },
                        { id: "#1002", customer: "Bob Smith", amount: "$189.50", status: "Pending" },
                        { id: "#1003", customer: "Carol White", amount: "$320.00", status: "Completed" },
                        { id: "#1004", customer: "David Lee", amount: "$95.75", status: "Cancelled" },
                        { id: "#1005", customer: "Eva Martinez", amount: "$410.25", status: "Completed" },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Contact Form",
    description: "Form with validation states and submit action",
    keywords: ["contact", "form", "email", "message", "input", "send", "feedback", "support"],
    spec: {
      version: "1.0",
      meta: {
        title: "Contact Form",
        description: "Contact form with name, email, message, and submit button",
      },
      root: {
        component: "Container",
        props: { size: "sm" },
        children: [
          {
            component: "Stack",
            props: { gap: "lg" },
            children: [
              {
                component: "Stack",
                props: { gap: "xs" },
                children: [
                  { component: "Container", children: "Get in Touch" },
                  { component: "Container", children: "We'd love to hear from you. Fill out the form below and we'll get back to you within 24 hours." },
                ],
              },
              { component: "Divider" },
              {
                component: "Stack",
                props: { gap: "md" },
                children: [
                  {
                    component: "Inline",
                    props: { gap: "md" },
                    children: [
                      { component: "Input", key: "first", props: { label: "First Name", placeholder: "John", required: true } },
                      { component: "Input", key: "last", props: { label: "Last Name", placeholder: "Doe", required: true } },
                    ],
                  },
                  { component: "Input", props: { label: "Email Address", placeholder: "john@example.com", type: "email", required: true } },
                  {
                    component: "Select",
                    props: { label: "Subject" },
                    children: [
                      { component: "SelectTrigger", children: "Select a topic" },
                      {
                        component: "SelectContent",
                        children: [
                          { component: "SelectOption", props: { value: "general" }, children: "General Inquiry" },
                          { component: "SelectOption", props: { value: "support" }, children: "Technical Support" },
                          { component: "SelectOption", props: { value: "sales" }, children: "Sales Question" },
                          { component: "SelectOption", props: { value: "feedback" }, children: "Feedback" },
                        ],
                      },
                    ],
                  },
                  { component: "Textarea", props: { label: "Message", placeholder: "Tell us what's on your mind...", rows: 5, required: true } },
                  { component: "Checkbox", props: { label: "I agree to the terms and privacy policy" } },
                  {
                    component: "Inline",
                    props: { gap: "sm" },
                    children: [
                      { component: "Button", props: { variant: "primary" }, children: "Send Message" },
                      { component: "Button", props: { variant: "ghost" }, children: "Cancel" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Flight Search Results",
    description: "List of flight cards with route, time, price, and book button",
    keywords: ["flight", "search", "travel", "airline", "booking", "trip", "airport", "results"],
    spec: {
      version: "1.0",
      meta: {
        title: "Flight Search Results",
        description: "Flight search results with itinerary cards",
      },
      root: {
        component: "Container",
        props: { size: "md" },
        children: [
          {
            component: "Stack",
            props: { gap: "lg" },
            children: [
              {
                component: "Inline",
                props: { gap: "md", align: "center", justify: "between" },
                children: [
                  { component: "Container", children: "SFO to JFK — 5 flights found" },
                  { component: "Button", props: { variant: "outline", size: "sm" }, children: "Filter" },
                ],
              },
              { component: "Divider" },
              {
                component: "Stack",
                props: { gap: "md" },
                children: [
                  {
                    component: "Inline",
                    key: "flight-1",
                    props: { gap: "lg", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "United Airlines" },
                          { component: "Container", children: "UA 1234" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "08:15 AM - 04:42 PM" },
                          { component: "Container", children: "SFO -> JFK | 5h 27m | Nonstop" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$324" },
                          { component: "Button", props: { variant: "primary", size: "sm" }, children: "Book" },
                        ],
                      },
                    ],
                  },
                  { component: "Divider" },
                  {
                    component: "Inline",
                    key: "flight-2",
                    props: { gap: "lg", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "Delta Air Lines" },
                          { component: "Container", children: "DL 5678" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "10:30 AM - 07:15 PM" },
                          { component: "Container", children: "SFO -> JFK | 5h 45m | Nonstop" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$289" },
                          { component: "Button", props: { variant: "primary", size: "sm" }, children: "Book" },
                        ],
                      },
                    ],
                  },
                  { component: "Divider" },
                  {
                    component: "Inline",
                    key: "flight-3",
                    props: { gap: "lg", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "JetBlue" },
                          { component: "Container", children: "B6 2047" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "01:00 PM - 09:32 PM" },
                          { component: "Container", children: "SFO -> JFK | 5h 32m | Nonstop" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$267" },
                          { component: "Button", props: { variant: "primary", size: "sm" }, children: "Book" },
                        ],
                      },
                    ],
                  },
                  { component: "Divider" },
                  {
                    component: "Inline",
                    key: "flight-4",
                    props: { gap: "lg", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "American Airlines" },
                          { component: "Container", children: "AA 9012" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "03:45 PM - 12:10 AM+1" },
                          { component: "Container", children: "SFO -> DFW -> JFK | 8h 25m | 1 stop" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$198" },
                          { component: "Button", props: { variant: "outline", size: "sm" }, children: "Book" },
                        ],
                      },
                    ],
                  },
                  { component: "Divider" },
                  {
                    component: "Inline",
                    key: "flight-5",
                    props: { gap: "lg", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "Alaska Airlines" },
                          { component: "Container", children: "AS 3456" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "06:00 PM - 02:25 AM+1" },
                          { component: "Container", children: "SFO -> SEA -> JFK | 8h 25m | 1 stop" },
                        ],
                      },
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$215" },
                          { component: "Button", props: { variant: "outline", size: "sm" }, children: "Book" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Product Card",
    description: "E-commerce product card with image placeholder, price, rating, and add to cart",
    keywords: ["product", "card", "ecommerce", "shop", "cart", "buy", "item", "store"],
    spec: {
      version: "1.0",
      meta: {
        title: "Product Card",
        description: "E-commerce product card with details and actions",
      },
      root: {
        component: "Container",
        props: { size: "sm" },
        children: [
          {
            component: "Stack",
            props: { gap: "md" },
            children: [
              {
                component: "Button",
                props: { variant: "outline", size: "lg", disabled: true },
                children: "360 x 280 — Product Image",
              },
              {
                component: "Stack",
                props: { gap: "sm" },
                children: [
                  {
                    component: "Inline",
                    props: { gap: "sm", align: "center", justify: "between" },
                    children: [
                      { component: "Container", children: "Premium Wireless Headphones" },
                      { component: "Button", props: { variant: "ghost", size: "sm", disabled: true }, children: "New" },
                    ],
                  },
                  { component: "Container", children: "Immersive sound with active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam cushions." },
                  {
                    component: "Inline",
                    props: { gap: "xs", align: "center" },
                    children: [
                      { component: "Container", children: "4.8 / 5.0" },
                      { component: "Container", children: "(2,341 reviews)" },
                    ],
                  },
                  { component: "Divider" },
                  {
                    component: "Inline",
                    props: { gap: "md", align: "center", justify: "between" },
                    children: [
                      {
                        component: "Stack",
                        props: { gap: "xs" },
                        children: [
                          { component: "Container", children: "$299.99" },
                          { component: "Container", children: "Free shipping" },
                        ],
                      },
                      {
                        component: "Inline",
                        props: { gap: "sm" },
                        children: [
                          { component: "Button", props: { variant: "outline", size: "sm" }, children: "Wishlist" },
                          { component: "Button", props: { variant: "primary" }, children: "Add to Cart" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Keyword matching logic
// ---------------------------------------------------------------------------

function findMatchingSpec(prompt: string): ExampleSpec | null {
  const lower = prompt.toLowerCase().trim();
  if (!lower) return null;

  let bestMatch: ExampleSpec | null = null;
  let bestScore = 0;

  for (const example of EXAMPLE_SPECS) {
    let score = 0;
    for (const keyword of example.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // longer keyword matches score higher
      }
    }
    // Also check title match
    if (lower.includes(example.title.toLowerCase())) {
      score += example.title.length * 2;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = example;
    }
  }

  return bestMatch;
}

// ---------------------------------------------------------------------------
// JSON syntax highlighting (lightweight, no external lib)
// ---------------------------------------------------------------------------

function highlightJSON(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
      (match) => {
        if (match.endsWith(":")) {
          return `<span style="color: #7c3aed">${match}</span>`;
        }
        return `<span style="color: #059669">${match}</span>`;
      },
    )
    .replace(/\b(true|false|null)\b/g, '<span style="color: #d97706">$1</span>')
    .replace(/\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, '<span style="color: #2563eb">$1</span>');
}

// ---------------------------------------------------------------------------
// Playground page
// ---------------------------------------------------------------------------

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [generatedSpec, setGeneratedSpec] = useState<UISpec | null>(null);
  const [matchTitle, setMatchTitle] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const handleGenerate = useCallback(() => {
    setError("");
    setGeneratedSpec(null);
    setMatchTitle("");
    setIsGenerating(true);

    // Simulate AI generation latency
    setTimeout(() => {
      const match = findMatchingSpec(prompt);
      if (!match) {
        setError(
          `No matching template found for "${prompt}". Try one of the example prompts below, such as "pricing table", "dashboard", "contact form", "user profile", "flight search results", or "product card".`,
        );
        setIsGenerating(false);
        return;
      }

      // Validate the spec
      try {
        validateSpec(match.spec);
      } catch (err) {
        setError(`Spec validation failed: ${err instanceof Error ? err.message : String(err)}`);
        setIsGenerating(false);
        return;
      }

      const registryResult = validateSpecAgainstRegistry(match.spec, defaultRegistry);
      if (!registryResult.valid) {
        setError(`Registry validation: ${registryResult.errors.map((e) => e.message).join(", ")}`);
        setIsGenerating(false);
        return;
      }

      setGeneratedSpec(match.spec);
      setMatchTitle(match.title);
      setActiveTab("preview");
      setIsGenerating(false);
    }, 800);
  }, [prompt]);

  const handleExampleClick = useCallback((example: ExampleSpec) => {
    setPrompt(`Create a ${example.title.toLowerCase()}`);
    setError("");
    setGeneratedSpec(null);
    setMatchTitle("");
    setIsGenerating(true);

    setTimeout(() => {
      try {
        validateSpec(example.spec);
      } catch (err) {
        setError(`Spec validation failed: ${err instanceof Error ? err.message : String(err)}`);
        setIsGenerating(false);
        return;
      }
      setGeneratedSpec(example.spec);
      setMatchTitle(example.title);
      setActiveTab("preview");
      setIsGenerating(false);
    }, 600);
  }, []);

  const jsonString = useMemo(
    () => (generatedSpec ? JSON.stringify(generatedSpec, null, 2) : ""),
    [generatedSpec],
  );

  const handleActionEvent = useCallback((action: string, payload?: Record<string, unknown>) => {
    console.log("[Playground Action]", action, payload);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--entropix-color-bg-primary)",
        color: "var(--entropix-color-text-primary)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <nav className="nav">
        <Container maxWidth="lg">
          <div className="nav-inner">
            <span className="nav-logo">
              <span>Entropix</span> AI Playground
            </span>
            <a
              href="/"
              style={{
                color: "var(--entropix-color-action-primary-default)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Back to Demo
            </a>
          </div>
        </Container>
      </nav>

      <Container maxWidth="lg">
        <Stack gap="lg" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
          {/* ── Hero ────────────────────────────────────────────── */}
          <Stack gap="sm">
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              AI Playground
            </h1>
            <p
              style={{
                fontSize: "1.0625rem",
                color: "var(--entropix-color-text-secondary)",
                maxWidth: 600,
                lineHeight: 1.6,
              }}
            >
              Describe the UI you want in natural language and see it rendered
              live with real Entropix components. This demo uses pre-built
              templates matched by keyword.
            </p>
          </Stack>

          {/* ── Prompt Area ────────────────────────────────────── */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: "var(--entropix-radius-lg)",
              border: "1px solid var(--entropix-color-border-default)",
              background: "var(--entropix-color-bg-primary)",
            }}
          >
            <Stack gap="md">
              <Textarea
                label="Describe your UI"
                placeholder='e.g. "Create a pricing table with three tiers: Basic, Pro, and Enterprise"'
                value={prompt}
                onChange={(value: string) => setPrompt(value)}
                rows={3}
              />
              <Inline gap="sm" align="center">
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate UI"}
                </Button>
                {generatedSpec && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setGeneratedSpec(null);
                      setPrompt("");
                      setMatchTitle("");
                      setError("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Inline>
            </Stack>
          </div>

          {/* ── Example Prompts ────────────────────────────────── */}
          <Stack gap="sm">
            <p
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--entropix-color-action-primary-default)",
              }}
            >
              Try these examples
            </p>
            <Inline gap="sm" style={{ flexWrap: "wrap" }}>
              {EXAMPLE_SPECS.map((example) => (
                <Button
                  key={example.title}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(example)}
                >
                  {example.title}
                </Button>
              ))}
            </Inline>
          </Stack>

          {/* ── Error Display ──────────────────────────────────── */}
          {error && (
            <div
              style={{
                padding: "1rem 1.25rem",
                borderRadius: "var(--entropix-radius-md)",
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#991b1b",
                fontSize: "0.9375rem",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* ── Results ────────────────────────────────────────── */}
          {generatedSpec && (
            <Stack gap="md">
              <Inline gap="sm" align="center">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    background: "var(--entropix-color-action-secondary-default)",
                    color: "var(--entropix-color-action-primary-default)",
                  }}
                >
                  Matched: {matchTitle}
                </div>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--entropix-color-text-secondary)",
                  }}
                >
                  {generatedSpec.meta?.description}
                </span>
              </Inline>

              <Tabs
                selectedKey={activeTab}
                onSelectedKeyChange={setActiveTab}
              >
                <TabList>
                  <Tab value="preview">Live Preview</Tab>
                  <Tab value="json">JSON Spec</Tab>
                </TabList>

                <TabPanel value="preview">
                  <div
                    style={{
                      padding: "2rem",
                      borderRadius: "var(--entropix-radius-lg)",
                      border: "1px solid var(--entropix-color-border-default)",
                      background: "var(--entropix-color-bg-primary)",
                      marginTop: "1rem",
                      minHeight: 200,
                    }}
                  >
                    <EntropixRenderer
                      spec={generatedSpec}
                      components={COMPONENT_MAP}
                      onAction={handleActionEvent}
                    />
                  </div>
                </TabPanel>

                <TabPanel value="json">
                  <div
                    style={{
                      marginTop: "1rem",
                      borderRadius: "var(--entropix-radius-lg)",
                      border: "1px solid var(--entropix-color-border-default)",
                      background: "#1e1e2e",
                      overflow: "auto",
                      maxHeight: 600,
                    }}
                  >
                    <pre
                      style={{
                        padding: "1.5rem",
                        margin: 0,
                        fontFamily: "var(--entropix-font-family-mono, monospace)",
                        fontSize: "0.8125rem",
                        lineHeight: 1.6,
                        color: "#cdd6f4",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlightJSON(jsonString),
                      }}
                    />
                  </div>
                </TabPanel>
              </Tabs>
            </Stack>
          )}

          {/* ── How It Works (shown when no result) ───────────── */}
          {!generatedSpec && !error && (
            <>
              <Divider />
              <Stack gap="md">
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  How It Works
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {[
                    {
                      step: "1",
                      title: "Describe",
                      body: "Type a natural language prompt describing the UI you want to create.",
                    },
                    {
                      step: "2",
                      title: "Generate",
                      body: "The AI generates a UISpec — a portable JSON schema describing your components.",
                    },
                    {
                      step: "3",
                      title: "Render",
                      body: "EntropixRenderer maps the spec to real React components and renders them live.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="feature-card"
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--entropix-color-action-primary-default)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {item.step}
                      </div>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: "0.9375rem", color: "var(--entropix-color-text-secondary)", lineHeight: 1.5 }}>
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </Stack>
            </>
          )}

          {/* ── Footer ─────────────────────────────────────────── */}
          <Divider />
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--entropix-color-text-secondary)",
              textAlign: "center",
              padding: "1rem 0",
            }}
          >
            Entropix AI Playground — Built with @entropix/react, @entropix/data,
            and @entropix/ai
          </p>
        </Stack>
      </Container>
    </div>
  );
}
