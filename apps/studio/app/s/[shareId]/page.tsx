import { getShare } from "@/lib/db/queries";
import type { UISpec } from "@entropix/ai";
import { ShareRenderer } from "./share-renderer";

export default async function SharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const share = await getShare(shareId);

  if (!share) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--entropix-color-text-secondary)",
          fontSize: "1.125rem",
        }}
      >
        Share not found
      </div>
    );
  }

  const spec = JSON.parse(share.specJson) as UISpec;
  const title = share.title ?? "Untitled";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <ShareRenderer spec={spec} title={title} />
      </div>
      <footer
        style={{
          textAlign: "center",
          padding: "var(--entropix-spacing-3)",
          fontSize: "0.75rem",
          color: "var(--entropix-color-text-secondary)",
          borderTop: "1px solid var(--entropix-color-border-default)",
        }}
      >
        Built with Entropix Studio
      </footer>
    </div>
  );
}
