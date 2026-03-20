import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entropix Demo — Production Package Test",
  description:
    "Testing @entropix/react and @entropix/tokens installed from npm registry.",
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
