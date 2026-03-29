import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Shared UI — Entropix Studio",
  description: "A shared Entropix UI preview",
};

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
