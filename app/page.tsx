export default function HomePage() {
  return (
    <div className="amrg-page">
      <header className="topbar">
        <div className="container nav">
          <a href="#top" className="brand">
            <div className="brand-mark">
              <img src="/logo.svg" alt="AMRG Logo" style={{ width: 28, height: "auto" }} />
            </div>
            <div className="brand-copy">
              <small>AMRG EXTERIORS</small>
              <span>Tap Card Landing Page</span>
            </div>
          </a>

          <a className="nav-cta" href="tel:6125137534">Call Now</a>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="eyebrow">Good meeting you</div>
              <h1>
                Good meeting you — <span className="accent">don’t wait too long to take a look</span>.
              </h1>
              <p>
                Storm damage isn’t always obvious right away. It’s worth taking a look sooner rather than later — this makes it easy to get started.
              </p>

              <div className="hero-actions">
                <a className="btn btn-primary" href="tel:6125137534">Call Eric</a>
                <a className="btn btn-secondary" href="sms:6125137534?body=Hi%20Eric%2C%20this%20is%20%5Byour%20name%5D.%20I%20wanted%20to%20follow%20up%20about%20my%20home.">Text Eric</a>
                <a className="btn btn-secondary" href="/eric-swanberg.vcf" download>Save Contact</a>
                <a className="btn btn-primary" href="https://www.mcgeerestoration.com" target="_blank" rel="noopener">Start My Inspection</a>
              </div>

              <div className="micro-note">Fastest next step: send a quick text and I’ll take it from there.</div>

              <div className="contact-strip">
                <span>📱 (612) 513-7534</span>
                <span>☎ (952) 426-3736</span>
                <span>📍 Minnetonka, MN</span>
              </div>
            </div>

            <div className="mockup-wrap">
              <div className="card-glow"></div>
              <div className="tap-card">
                <div className="info">
                  <h2>Eric Swanberg</h2>
                  <div className="role">Exterior Renovation Consultant</div>

                  <div className="details">
                    <div><span className="dot">☎</span><span>M: (612) 513-7534<br />O: (952) 426-3736</span></div>
                    <div><span className="dot">✉</span><span>ericswanberg@mcgeerestoration.com</span></div>
                    <div><span className="dot">🌐</span><span>www.mcgeerestoration.com</span></div>
                    <div><span className="dot">📍</span><span>10201 Wayzata Blvd #130<br />Minnetonka, MN 55305</span></div>
                  </div>
                </div>

                <div className="logo-side">
                  <img src="/logo.svg" alt="AMRG Exteriors Logo" className="logo-img" />
                  <div className="tagline">Roofing | Siding | Windows</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container">
          <div className="cta-block" id="contact">
            <div>
              <h3>The sooner we check it, the better.</h3>
              <p>
                We’ll take a look, document anything we find, and walk you through your options — including insurance if it applies.
              </p>
            </div>

            <div className="hero-actions">
              <a className="btn btn-primary" href="tel:6125137534">Call Eric</a>
              <a className="btn btn-secondary" href="sms:6125137534?body=Hi%20Eric%2C%20this%20is%20%5Byour%20name%5D.%20I%20wanted%20to%20follow%20up%20about%20my%20home.">Text Eric</a>
              <a className="btn btn-secondary" href="/eric-swanberg.vcf" download>Save Contact</a>
              <a className="btn btn-secondary" href="https://www.mcgeerestoration.com" target="_blank" rel="noopener">Visit Website</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          AMRG Exteriors • Eric Swanberg • Exterior Renovation Consultant
        </div>
      </footer>
    </div>
  );
}
