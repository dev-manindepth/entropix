import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Entropix Deployment",
  description: "A deployed Entropix UI",
};

export default function DeployedLayout({
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
