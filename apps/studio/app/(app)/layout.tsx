"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutContext } from "@/lib/layout-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);

  return (
    <LayoutContext.Provider value={{
      sidebarOpen,
      toggleSidebar: () => setSidebarOpen(p => !p),
      fullscreenPreview,
      setFullscreenPreview,
    }}>
      <div className={`studio-layout ${sidebarOpen ? "" : "studio-layout--sidebar-collapsed"} ${fullscreenPreview ? "studio-layout--fullscreen" : ""}`}>
        <Sidebar collapsed={!sidebarOpen} onToggle={() => setSidebarOpen(p => !p)} />
        <main className="main-content">{children}</main>
      </div>
    </LayoutContext.Provider>
  );
}
