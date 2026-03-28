"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
