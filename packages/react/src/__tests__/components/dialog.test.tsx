import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "../../components/dialog/index.js";

function TestDialog(props: {
  defaultOpen?: boolean;
  closeOnOverlayPress?: boolean;
  closeOnEscape?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}) {
  return (
    <Dialog {...props}>
      <DialogTrigger>Open Dialog</DialogTrigger>
      <DialogOverlay data-testid="overlay" />
      <DialogContent data-testid="dialog-content">
        <DialogTitle>Test Title</DialogTitle>
        <DialogDescription>Test description</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("trigger click opens dialog", () => {
    render(<TestDialog />);

    expect(screen.queryByText("Test Title")).toBeNull();

    fireEvent.click(screen.getByText("Open Dialog"));

    expect(screen.getByText("Test Title")).toBeDefined();
  });

  it("trigger has correct ARIA attributes", () => {
    render(<TestDialog />);
    const trigger = screen.getByText("Open Dialog");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("trigger aria-expanded updates when opened", () => {
    render(<TestDialog />);
    const trigger = screen.getByText("Open Dialog");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("content renders in portal (in document.body)", () => {
    render(<TestDialog defaultOpen />);

    // Content should be in document.body, not in the parent tree
    const content = screen.getByTestId("dialog-content");
    expect(content.parentElement).toBe(document.body);
  });

  it("content has role='dialog' and aria-modal", () => {
    render(<TestDialog defaultOpen />);
    const content = screen.getByRole("dialog");

    expect(content).toHaveAttribute("aria-modal", "true");
  });

  it("ARIA linking: labelledby and describedby point to title and description", () => {
    render(<TestDialog defaultOpen />);
    const content = screen.getByRole("dialog");
    const title = screen.getByText("Test Title");
    const description = screen.getByText("Test description");

    expect(content).toHaveAttribute("aria-labelledby", title.id);
    expect(content).toHaveAttribute("aria-describedby", description.id);
  });

  it("close button closes dialog", () => {
    render(<TestDialog defaultOpen />);

    expect(screen.getByRole("dialog")).toBeDefined();

    fireEvent.click(screen.getByText("Close"));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("close button has aria-label", () => {
    render(<TestDialog defaultOpen />);
    const closeBtn = screen.getByText("Close");
    expect(closeBtn).toHaveAttribute("aria-label", "Close dialog");
  });

  it("Escape key closes dialog", () => {
    render(<TestDialog defaultOpen />);
    const content = screen.getByRole("dialog");

    fireEvent.keyDown(content, { key: "Escape" });

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape does not close when closeOnEscape=false", () => {
    render(<TestDialog defaultOpen closeOnEscape={false} />);
    const content = screen.getByRole("dialog");

    fireEvent.keyDown(content, { key: "Escape" });

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("overlay click closes dialog", () => {
    render(<TestDialog defaultOpen />);

    fireEvent.click(screen.getByTestId("overlay"));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("overlay click does not close when closeOnOverlayPress=false", () => {
    render(<TestDialog defaultOpen closeOnOverlayPress={false} />);

    fireEvent.click(screen.getByTestId("overlay"));

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("overlay has aria-hidden", () => {
    render(<TestDialog defaultOpen />);
    const overlay = screen.getByTestId("overlay");
    expect(overlay).toHaveAttribute("aria-hidden", "true");
  });

  it("calls onOpenChange when state changes", () => {
    const onOpenChange = vi.fn();
    render(<TestDialog onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByText("Open Dialog"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("content has data-state='open' when visible", () => {
    render(<TestDialog defaultOpen />);
    expect(screen.getByTestId("dialog-content")).toHaveAttribute(
      "data-state",
      "open",
    );
  });
});
