import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entropix Studio",
  description: "AI-powered UI generation studio built on the Entropix design system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
