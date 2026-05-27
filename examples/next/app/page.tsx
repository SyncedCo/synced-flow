export default function Page() {
  return (
    <main>
      <header className="sf-section sf-section--compact sf-sticky-top sf-bg-background">
        <nav className="sf-container sf-nav" aria-label="Main navigation">
          <a className="sf-nav__link" href="#home">
            Synced Studio
          </a>
          <ul className="sf-nav__list">
            <li>
              <a className="sf-nav__link" href="#work">
                Work
              </a>
            </li>
            <li>
              <a className="sf-nav__link" href="#contact">
                Contact
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <section id="home" className="sf-section">
        <div className="sf-container sf-split">
          <div className="sf-stack">
            <p className="sf-badge">Next.js template</p>
            <h1 className="sf-text-display">Build with fluid tokens from the first screen.</h1>
            <p className="sf-text-lead sf-prose">
              This page composes a sticky nav, split hero, card grid, native disclosure, and contact form with Synced Fluid classes.
            </p>
            <div className="sf-cluster">
              <a className="sf-button sf-button--default" href="#contact">
                Start discovery
              </a>
              <a className="sf-button sf-button--outline" href="#work">
                View work
              </a>
            </div>
          </div>
          <div className="sf-card sf-stack">
            <p className="sf-kicker">Replace this card</p>
            <p className="sf-text-lead">Use this area for a product screenshot, proof points, or a short customer quote.</p>
          </div>
        </div>
      </section>

      <section id="work" className="sf-section">
        <div className="sf-container sf-stack">
          <div className="sf-section-header">
            <p className="sf-kicker">Patterns</p>
            <h2 className="sf-text-h2">Swap sections without writing page CSS.</h2>
          </div>
          <div className="sf-auto-grid">
            {['Hero systems', 'Native overlays', 'Accessible forms'].map((item) => (
              <article className="sf-card sf-card--interactive sf-stack" key={item}>
                <h3 className="sf-text-h4">{item}</h3>
                <p className="sf-text-muted">Replace this section with project content while keeping the class structure.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="sf-section">
        <div className="sf-container sf-split">
          <div className="sf-stack">
            <p className="sf-kicker">Contact</p>
            <h2 className="sf-text-h2">A styled form without custom field CSS.</h2>
            <details className="sf-disclosure">
              <summary>Can this run without JavaScript components?</summary>
              <p>Yes. Synced Fluid styles native HTML and CSS primitives; project JavaScript stays optional.</p>
            </details>
          </div>
          <form className="sf-form sf-card">
            <label className="sf-field">
              <span className="sf-label">Email</span>
              <input className="sf-input" type="email" placeholder="you@example.com" />
            </label>
            <label className="sf-field">
              <span className="sf-label">Message</span>
              <textarea className="sf-textarea" rows={4} placeholder="Tell us what you are building." />
            </label>
            <button className="sf-button sf-button--default" type="submit">
              Send
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
