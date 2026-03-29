import { getDeploymentBySlug } from "@/lib/db/queries";
import type { UISpec } from "@entropix/ai";
import { ShareRenderer } from "../../s/[shareId]/share-renderer";

export default async function DeployedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deployment = await getDeploymentBySlug(slug);

  if (!deployment) {
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
        Page not found
      </div>
    );
  }

  const spec = JSON.parse(deployment.specJson) as UISpec;
  const title = deployment.title ?? "Untitled";

  return (
    <div style={{ minHeight: "100vh" }}>
      <ShareRenderer spec={spec} title={title} />
    </div>
  );
}
