import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entropix — Cross-Platform React Design System",
  description:
    "Build interfaces that work everywhere. A headless-first design system with W3C design tokens, for React and React Native.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
