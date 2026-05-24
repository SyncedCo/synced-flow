import { createRoot } from 'react-dom/client'

import './synced-fluid.css'

function App() {
  return (
    <main className="sf-section">
      <section className="sf-container sf-stack">
        <p className="sf-badge">Strict fluid starter</p>
        <h1 className="sf-text-display">A reusable styling foundation for practical interfaces.</h1>
        <p className="sf-text-lead sf-prose">
          Synced Fluid gives new projects tokens, layout primitives, and generated utilities without starting from breakpoints.
        </p>
        <div className="sf-cluster">
          <a className="sf-button sf-button--default" href="/">
            Start building
          </a>
          <a className="sf-button sf-button--outline" href="https://github.com/SyncedCo/synced-fluid">
            View package
          </a>
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
