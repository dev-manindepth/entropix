"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogOverlay,
  Button,
  Input,
  Stack,
  Inline,
  Divider,
} from "@entropix/react";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState(
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );
  const [isSharing, setIsSharing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"share" | "deploy" | null>(null);

  const handleCreateShare = async () => {
    setIsSharing(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Failed to create share link" }));
        throw new Error(data.error || "Failed to create share link");
      }
      const data = await res.json();
      setShareUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Deployment failed" }));
        throw new Error(data.error || "Deployment failed");
      }
      const data = await res.json();
      setDeployUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deployment failed");
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = async (url: string, type: "share" | "deploy") => {
    await navigator.clipboard.writeText(url);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay />
      <DialogContent style={{ maxWidth: 480, width: "100%" }}>
        <DialogTitle>Share &amp; Deploy</DialogTitle>

        <Stack gap="md" style={{ marginTop: "var(--entropix-spacing-4)" }}>
          {/* Section 1: Share Preview Link */}
          <Stack gap="sm">
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--entropix-color-text-primary)",
              }}
            >
              Share Preview Link
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--entropix-color-text-secondary)",
              }}
            >
              Create a shareable link to the current preview of your UI.
            </p>
            {shareUrl ? (
              <Inline gap="sm" align="center">
                <Input
                  value={shareUrl}
                  readOnly
                  style={{ flex: 1, fontSize: "0.8125rem" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => copyToClipboard(shareUrl, "share")}
                >
                  {copied === "share" ? "Copied!" : "Copy"}
                </Button>
              </Inline>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={handleCreateShare}
                disabled={isSharing}
              >
                {isSharing ? "Creating..." : "Create Share Link"}
              </Button>
            )}
          </Stack>

          <Divider />

          {/* Section 2: Deploy to Subdomain */}
          <Stack gap="sm">
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--entropix-color-text-primary)",
              }}
            >
              Deploy to Subdomain
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--entropix-color-text-secondary)",
              }}
            >
              Publish your UI to a custom subdomain.
            </p>
            {deployUrl ? (
              <Inline gap="sm" align="center">
                <Input
                  value={deployUrl}
                  readOnly
                  style={{ flex: 1, fontSize: "0.8125rem" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => copyToClipboard(deployUrl, "deploy")}
                >
                  {copied === "deploy" ? "Copied!" : "Copy"}
                </Button>
              </Inline>
            ) : (
              <Stack gap="sm">
                <Input
                  value={slug}
                  onChange={(val) => setSlug(val)}
                  placeholder="my-app"
                  style={{ fontSize: "0.8125rem" }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onPress={handleDeploy}
                  disabled={isDeploying || !slug}
                >
                  {isDeploying ? "Deploying..." : "Deploy"}
                </Button>
              </Stack>
            )}
          </Stack>

          {error && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--entropix-color-status-error)",
              }}
            >
              {error}
            </p>
          )}
        </Stack>

        <div style={{ marginTop: "var(--entropix-spacing-4)", textAlign: "right" }}>
          <DialogClose>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
