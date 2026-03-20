import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  Button,
} from "@entropix/react";

const meta: Meta<typeof Dialog> = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <Button variant="primary" size="md">Open Dialog</Button>
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogDescription>
          Are you sure you want to proceed? This action cannot be undone.
        </DialogDescription>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <DialogClose>
            <Button variant="outline" size="sm">Cancel</Button>
          </DialogClose>
          <DialogClose>
            <Button variant="primary" size="sm">Confirm</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

export const NonDismissable: Story = {
  name: "Non-Dismissable (no overlay close)",
  render: () => (
    <Dialog closeOnOverlayPress={false}>
      <DialogTrigger>
        <Button variant="secondary" size="md">Open Non-Dismissable</Button>
      </DialogTrigger>
      <DialogOverlay />
      <DialogContent>
        <DialogTitle>Important Notice</DialogTitle>
        <DialogDescription>
          You must explicitly close this dialog. Clicking the overlay won't dismiss it.
        </DialogDescription>
        <DialogClose>
          <Button variant="primary" size="sm">Got it</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  ),
};
