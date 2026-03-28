"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@entropix/react";
import { Button, Input, Textarea } from "@entropix/react";

interface CreateProjectDialogProps {
  onCreated: (project: { id: string; name: string; description: string | null }) => void;
  trigger?: React.ReactNode;
}

export function CreateProjectDialog({ onCreated, trigger }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create project");

      const data = await res.json();
      onCreated(data.project);
      setName("");
      setDescription("");
      setOpen(false);
    } catch (err) {
      console.error("Create project error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? <Button variant="primary">New Project</Button>}
      </span>

      <Dialog isOpen={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Create New Project</DialogTitle>

          <form onSubmit={handleSubmit} className="create-project-form">
            <label>
              Name
              <Input
                placeholder="My UI Project"
                value={name}
                onChange={setName}
                required
              />
            </label>

            <label>
              Description (optional)
              <Textarea
                placeholder="What are you building?"
                value={description}
                onChange={setDescription}
                rows={3}
              />
            </label>

            <div className="create-project-actions">
              <Button
                variant="secondary"
                onPress={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                onPress={() => handleSubmit()}
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
