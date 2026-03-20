import React from "react";
import type { Preview, Decorator } from "@storybook/react";
import "@entropix/tokens/css";
import "@entropix/tokens/themes/light";
import "@entropix/tokens/themes/dark";
import "@entropix/react/styles";

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) || "light";

  return (
    <div
      data-theme={theme}
      style={{
        padding: "2rem",
        minHeight: "100vh",
        background: "var(--entropix-color-bg-primary)",
        color: "var(--entropix-color-text-primary)",
        fontFamily: "var(--entropix-font-family-sans)",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  parameters: {
    controls: { expanded: true },
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default preview;
