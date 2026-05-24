export default function Page() {
  return (
    <main className="sf-section">
      <section className="sf-container sf-stack">
        <p className="sf-badge">Next.js starter</p>
        <h1 className="sf-text-display">Build with fluid tokens from the first screen.</h1>
        <p className="sf-text-lead sf-prose">
          This example imports one Synced Fluid CSS entry and generates project utilities from the app folder.
        </p>
        <div className="sf-cluster">
          <a className="sf-button sf-button--default" href="/contact">
            Start discovery
          </a>
          <a className="sf-button sf-button--outline" href="/docs">
            Read docs
          </a>
        </div>
      </section>
    </main>
  )
}
