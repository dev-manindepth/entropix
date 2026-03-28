export default function WorkspaceLoading() {
  return (
    <div className="workspace">
      <div className="skeleton skeleton-toolbar" />
      <div className="chat-panel" style={{ borderRight: "1px solid var(--entropix-color-border-default)" }}>
        <div className="skeleton-chat">
          <div className="skeleton skeleton-bubble" />
          <div className="skeleton skeleton-bubble" />
          <div className="skeleton skeleton-bubble" />
        </div>
      </div>
      <div style={{ padding: "var(--entropix-spacing-4)" }}>
        <div className="skeleton skeleton-preview" style={{ height: "100%" }} />
      </div>
    </div>
  );
}
