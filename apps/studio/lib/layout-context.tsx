"use client";

import { createContext, useContext } from "react";

interface LayoutContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  fullscreenPreview: boolean;
  setFullscreenPreview: (v: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextValue>({
  sidebarOpen: true,
  toggleSidebar: () => {},
  fullscreenPreview: false,
  setFullscreenPreview: () => {},
});

export function useLayout(): LayoutContextValue {
  return useContext(LayoutContext);
}
