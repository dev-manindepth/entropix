export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "dashboard",
    name: "Analytics Dashboard",
    icon: "📊",
    description: "Stats cards, charts, and data overview",
    prompt:
      "Create an analytics dashboard with 4 stat cards (Total Revenue $45,200, Active Users 2,340, New Orders 543, Conversion Rate 3.2%), a bar chart showing monthly revenue for the last 6 months, and a recent orders data table with columns: Order ID, Customer, Amount, Status",
  },
  {
    id: "landing",
    name: "Landing Page",
    icon: "🚀",
    description: "Hero section, features, pricing, CTA",
    prompt:
      "Create a SaaS landing page with: a hero section with headline 'Build faster with AI', subheadline, and two CTA buttons (Get Started, Learn More); a features section with 3 feature cards; a pricing section with 3 tiers (Starter $9/mo, Pro $29/mo, Enterprise Contact us) each with feature lists and CTA buttons; and a footer with links",
  },
  {
    id: "settings",
    name: "Settings Page",
    icon: "⚙️",
    description: "Tabs with profile, notifications, security",
    prompt:
      "Create a settings page with tabs for Profile (name input, email input, bio textarea, save button), Notifications (toggle switches for email notifications, push notifications, marketing emails), and Security (current password input, new password input, confirm password input, update password button)",
  },
  {
    id: "contact",
    name: "Contact Form",
    icon: "✉️",
    description: "Name, email, message with validation",
    prompt:
      "Create a contact form page with a heading 'Get in Touch', a subheading, and a form with: name input (required), email input (required), subject select dropdown (General Inquiry, Bug Report, Feature Request, Partnership), message textarea (required, 5 rows), and a primary Submit button. Add helper text under inputs.",
  },
  {
    id: "ecommerce",
    name: "Product Listing",
    icon: "🛒",
    description: "Product grid with filters and cart",
    prompt:
      "Create a product listing page with: a header with search input and category select (All, Electronics, Clothing, Home); a grid of 6 product cards each with product name, description, price, and Add to Cart button; and pagination at the bottom showing 1 of 5 pages",
  },
  {
    id: "faq",
    name: "FAQ Page",
    icon: "❓",
    description: "Accordion-style frequently asked questions",
    prompt:
      "Create an FAQ page with a heading 'Frequently Asked Questions', a search input to filter questions, and an accordion with 6 questions about a SaaS product: What is the product, How to get started, Pricing plans, Data security, API availability, and Support options. Each answer should be 2-3 sentences.",
  },
];
