"use client";

import { useEffect, useState } from "react";

interface Rep {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  photoUrl: string | null;
  calLink: string | null;
}

type Step = "profile" | "form" | "success";

const css = `
  :root {
    --bg: #0a0a0c;
    --panel: #111216;
    --panel-2: #17191f;
    --text: #f3f5f7;
    --muted: #b7bcc7;
    --accent: #f5a300;
    --accent-2: #ffbf3c;
    --line: rgba(255,255,255,0.08);
    --shadow: 0 20px 60px rgba(0,0,0,0.45);
    --radius: 24px;
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    font-family: Inter, Arial, Helvetica, sans-serif;
    background:
      radial-gradient(circle at top right, rgba(245,163,0,0.14), transparent 28%),
      radial-gradient(circle at bottom left, rgba(255,191,60,0.08), transparent 22%),
      linear-gradient(180deg, #090909 0%, #0f1014 100%);
    color: var(--text);
  }

  a { color: inherit; text-decoration: none; }

  .rli-container {
    width: min(1160px, calc(100% - 32px));
    margin: 0 auto;
  }

  .rli-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(14px);
    background: rgba(9,9,11,0.72);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .rli-nav {
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .rli-brand {
    display: flex;
    align-items: center;
    gap: 14px;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  .rli-brand-mark {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(245,163,0,0.22), rgba(245,163,0,0.06));
    border: 1px solid rgba(245,163,0,0.4);
    display: grid;
    place-items: center;
    color: var(--accent);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
    font-size: 1.15rem;
    overflow: hidden;
  }

  .rli-brand-copy small {
    display: block;
    color: var(--accent);
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    margin-bottom: 3px;
  }

  .rli-brand-copy span { display: block; font-size: 1rem; }

  .rli-nav-cta {
    padding: 12px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: #151515;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(245,163,0,0.24);
    white-space: nowrap;
  }

  .rli-hero { padding: 56px 0 48px; }

  .rli-hero-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 42px;
    align-items: center;
  }

  .rli-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(245,163,0,0.08);
    border: 1px solid rgba(245,163,0,0.22);
    color: var(--accent-2);
    font-size: 0.82rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 18px;
  }

  .rli-h1 {
    margin: 0 0 18px;
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    line-height: 0.97;
    letter-spacing: -0.04em;
  }

  .rli-accent { color: var(--accent); }

  .rli-hero-p {
    margin: 0;
    color: var(--muted);
    font-size: 1.06rem;
    line-height: 1.75;
    max-width: 620px;
  }

  .rli-hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 28px;
  }

  .rli-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 22px;
    border-radius: 16px;
    font-weight: 800;
    font-size: 1rem;
    font-family: inherit;
    transition: transform 0.2s ease, opacity 0.2s ease;
    cursor: pointer;
    border: none;
    text-decoration: none;
  }

  .rli-btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: #141414;
    box-shadow: 0 16px 34px rgba(245,163,0,0.22);
  }

  .rli-btn-secondary {
    border: 1px solid rgba(255,255,255,0.09) !important;
    background: rgba(255,255,255,0.03);
    color: var(--text);
  }

  .rli-btn:hover { transform: translateY(-2px); }
  .rli-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .rli-contact-strip {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    color: var(--muted);
    font-size: 0.95rem;
  }

  .rli-contact-strip span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .rli-micro-note {
    margin-top: 14px;
    color: var(--accent-2);
    font-size: 0.92rem;
    font-weight: 600;
  }

  .rli-mockup-wrap {
    position: relative;
    padding: 24px;
    display: flex;
    justify-content: center;
  }

  .rli-card-glow {
    position: absolute;
    inset: 12% 14%;
    background: radial-gradient(circle, rgba(245,163,0,0.20), transparent 62%);
    filter: blur(28px);
    z-index: 0;
  }

  .rli-tap-card {
    position: relative;
    z-index: 1;
    width: min(100%, 510px);
    aspect-ratio: 1.72 / 1;
    border-radius: 24px;
    overflow: hidden;
    background:
      radial-gradient(circle at 30% 55%, rgba(255,255,255,0.08), transparent 22%),
      linear-gradient(145deg, #222329 0%, #0d0e12 52%, #14151a 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: var(--shadow);
    padding: 24px;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 18px;
    isolation: isolate;
  }

  .rli-tap-card::before {
    content: "";
    position: absolute;
    left: -5%; right: -5%; bottom: 12px; height: 6px;
    background: linear-gradient(90deg, transparent 0%, var(--accent) 22%, var(--accent-2) 50%, var(--accent) 78%, transparent 100%);
    opacity: 0.95;
  }

  .rli-card-info h2 {
    margin: 0;
    font-size: clamp(1.7rem, 3vw, 2.25rem);
    line-height: 1;
  }

  .rli-card-role {
    margin-top: 10px;
    color: var(--accent-2);
    font-weight: 700;
    font-size: 0.96rem;
  }

  .rli-card-details {
    margin-top: 24px;
    display: grid;
    gap: 11px;
    color: #edf1f5;
    font-size: 0.92rem;
  }

  .rli-card-details div {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.45;
  }

  .rli-dot {
    width: 24px; height: 24px; min-width: 24px;
    border-radius: 999px;
    background: rgba(245,163,0,0.14);
    border: 1px solid rgba(245,163,0,0.32);
    color: var(--accent);
    display: grid;
    place-items: center;
    font-size: 0.76rem;
    margin-top: 1px;
  }

  .rli-logo-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-left: 8px;
  }

  .rli-logo-img {
    width: 140px;
    height: auto;
    margin-bottom: 12px;
    filter: drop-shadow(0 10px 25px rgba(245,163,0,0.25));
  }

  .rli-tagline { color: var(--accent-2); font-weight: 700; font-size: 0.95rem; }

  .rli-cta-block {
    margin: 40px 0 60px;
    background:
      radial-gradient(circle at top right, rgba(245,163,0,0.18), transparent 28%),
      linear-gradient(135deg, #15171b 0%, #0d0f13 100%);
    border: 1px solid rgba(245,163,0,0.16);
    border-radius: 32px;
    padding: 34px;
    box-shadow: var(--shadow);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .rli-cta-block h3 { margin: 0 0 8px; font-size: clamp(1.7rem, 3vw, 2.6rem); }
  .rli-cta-block > div > p { margin: 0; color: var(--muted); line-height: 1.7; max-width: 680px; }

  .rli-form-grid { display: grid; gap: 10px; margin-top: 16px; }

  .rli-form-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px 16px;
    color: var(--text);
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }
  .rli-form-input:focus { border-color: rgba(245,163,0,0.4); }
  .rli-form-input::placeholder { color: var(--muted); }

  .rli-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 10px 14px;
    color: #fca5a5;
    font-size: 0.88rem;
    margin-bottom: 12px;
  }

  .rli-success-box { text-align: center; padding: 12px 0; width: 100%; }
  .rli-success-box p { color: var(--muted); line-height: 1.7; margin: 10px 0 0; }

  .rli-footer { padding: 0 0 42px; color: #8d94a0; font-size: 0.92rem; }

  @media (max-width: 980px) {
    .rli-hero-grid { grid-template-columns: 1fr; }
    .rli-tap-card { max-width: 560px; }
  }

  @media (max-width: 720px) {
    .rli-hero { padding-top: 34px; }
    .rli-tap-card {
      grid-template-columns: 1fr;
      aspect-ratio: auto;
      padding-bottom: 86px;
    }
    .rli-logo-side { padding-left: 0; margin-top: 8px; }
    .rli-contact-strip { flex-direction: column; gap: 10px; }
    .rli-cta-block { padding: 26px; }
  }
`;

export default function RepLandingClient({ rep }: { rep: Rep }) {
  const [step, setStep] = useState<Step>("profile");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const businessName = rep.company?.trim() || "AMRG Exteriors";
  const roleLabel = rep.title?.trim() || "Exterior Renovation Consultant";
  const firstName = rep.name.split(" ")[0];

  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "TAP", meta: { path: window.location.pathname } }),
    }).catch(() => {});
  }, [rep.id]);

  function update(key: string, val: string) {
    setForm((current) => ({ ...current, [key]: val }));
  }

  function openForm() {
    setStep("form");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      setError("Please enter your name and at least a phone or email.");
      setSubmitting(false);
      return;
    }

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, ...form }),
    });

    if (response.ok) {
      setStep("success");
    } else {
      const data = await response.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
    }

    setSubmitting(false);
  }

  function downloadContact() {
    const lastName = rep.name.split(" ").slice(1).join(" ");
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${rep.name}`,
      `N:${lastName};${firstName};;;`,
      `ORG:${businessName}`,
      `TITLE:${roleLabel}`,
      rep.phone ? `TEL;TYPE=CELL:${rep.phone}` : "",
      rep.email ? `EMAIL:${rep.email}` : "",
      "URL:https://www.mcgeerestoration.com",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rep.name.replace(/ /g, "-")}.vcf`;
    link.click();
    URL.revokeObjectURL(url);

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "CONTACT_SAVE" }),
    }).catch(() => {});
  }

  const smsBody = `Hi%20${encodeURIComponent(firstName)}%2C%20this%20is%20%5Byour%20name%5D.%20I%20wanted%20to%20follow%20up%20about%20my%20home.`;

  return (
    <>
      <style>{css}</style>

      <header className="rli-topbar">
        <div className="rli-container rli-nav">
          <a href="#top" className="rli-brand">
            <div className="rli-brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt={`${businessName} logo`} style={{ width: "28px", height: "auto" }} />
            </div>
            <div className="rli-brand-copy">
              <small>{businessName.toUpperCase()}</small>
              <span>Tap Card</span>
            </div>
          </a>
          {rep.phone && (
            <a className="rli-nav-cta" href={`tel:${rep.phone}`}>Call Now</a>
          )}
        </div>
      </header>

      <main id="top">
        <section className="rli-hero">
          <div className="rli-container rli-hero-grid">
            <div>
              <div className="rli-eyebrow">Good meeting you</div>
              <h1 className="rli-h1">
                Good meeting you —{" "}
                <span className="rli-accent">don&apos;t wait too long to take a look</span>.
              </h1>
              <p className="rli-hero-p">
                Storm damage isn&apos;t always obvious right away. It&apos;s worth taking a look sooner rather than later — this makes it easy to get started.
              </p>

              <div className="rli-hero-actions">
                {rep.phone && (
                  <a className="rli-btn rli-btn-primary" href={`tel:${rep.phone}`}>
                    Call {firstName}
                  </a>
                )}
                {rep.phone && (
                  <a className="rli-btn rli-btn-secondary" href={`sms:${rep.phone}?body=${smsBody}`}>
                    Text {firstName}
                  </a>
                )}
                <button className="rli-btn rli-btn-secondary" onClick={downloadContact}>
                  Save Contact
                </button>
                {rep.calLink ? (
                  <a
                    className="rli-btn rli-btn-primary"
                    href={rep.calLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start My Inspection
                  </a>
                ) : (
                  <button className="rli-btn rli-btn-primary" onClick={openForm}>
                    Start My Inspection
                  </button>
                )}
              </div>

              <div className="rli-micro-note">
                Fastest next step: send a quick text and I&apos;ll take it from there.
              </div>

              <div className="rli-contact-strip">
                {rep.phone && <span>📱 {rep.phone}</span>}
                {rep.email && <span>✉ {rep.email}</span>}
              </div>
            </div>

            <div className="rli-mockup-wrap">
              <div className="rli-card-glow" />
              <div className="rli-tap-card">
                <div className="rli-card-info">
                  <h2>{rep.name}</h2>
                  <div className="rli-card-role">{roleLabel}</div>
                  <div className="rli-card-details">
                    {rep.phone && (
                      <div>
                        <span className="rli-dot">☎</span>
                        <span>{rep.phone}</span>
                      </div>
                    )}
                    {rep.email && (
                      <div>
                        <span className="rli-dot">✉</span>
                        <span>{rep.email}</span>
                      </div>
                    )}
                    <div>
                      <span className="rli-dot">🌐</span>
                      <span>www.mcgeerestoration.com</span>
                    </div>
                  </div>
                </div>
                <div className="rli-logo-side">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt={`${businessName} logo`} className="rli-logo-img" />
                  <div className="rli-tagline">Roofing | Siding | Windows</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rli-container">
          <div className="rli-cta-block" id="contact">
            {step === "profile" && (
              <>
                <div>
                  <h3>The sooner we check it, the better.</h3>
                  <p>
                    We&apos;ll take a look, document anything we find, and walk you through your options — including insurance if it applies.
                  </p>
                </div>
                <div className="rli-hero-actions">
                  {rep.phone && (
                    <a className="rli-btn rli-btn-primary" href={`tel:${rep.phone}`}>
                      Call {firstName}
                    </a>
                  )}
                  {rep.phone && (
                    <a className="rli-btn rli-btn-secondary" href={`sms:${rep.phone}?body=${smsBody}`}>
                      Text {firstName}
                    </a>
                  )}
                  <button className="rli-btn rli-btn-secondary" onClick={downloadContact}>
                    Save Contact
                  </button>
                  {rep.calLink ? (
                    <a
                      className="rli-btn rli-btn-secondary"
                      href={rep.calLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book Inspection
                    </a>
                  ) : (
                    <button className="rli-btn rli-btn-primary" onClick={openForm}>
                      Request Inspection
                    </button>
                  )}
                </div>
              </>
            )}

            {step === "form" && (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <button
                    onClick={() => setStep("profile")}
                    style={{
                      background: "none", border: "none",
                      color: "var(--muted)", cursor: "pointer",
                      fontSize: "0.95rem", fontFamily: "inherit", padding: 0,
                    }}
                  >
                    ← Back
                  </button>
                </div>
                <h3 style={{ margin: "0 0 6px" }}>Request a free inspection</h3>
                <p style={{ margin: "0 0 16px", color: "var(--muted)", lineHeight: 1.7 }}>
                  Tell us a little about your property and {firstName} will get back to you fast.
                </p>
                {error && <div className="rli-error">{error}</div>}
                <form onSubmit={handleSubmit} className="rli-form-grid">
                  <input className="rli-form-input" placeholder="Your name *" value={form.name} onChange={(e) => update("name", e.target.value)} required autoFocus />
                  <input className="rli-form-input" placeholder="Phone number" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  <input className="rli-form-input" placeholder="Email address" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  <input className="rli-form-input" placeholder="Property address" value={form.address} onChange={(e) => update("address", e.target.value)} />
                  <textarea className="rli-form-input" rows={3} style={{ resize: "none" }} placeholder="Briefly describe what you're seeing: hail, leaks, missing shingles, siding damage, etc." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                  <button type="submit" disabled={submitting} className="rli-btn rli-btn-primary" style={{ width: "100%" }}>
                    {submitting ? "Sending…" : "Send Inspection Request"}
                  </button>
                </form>
              </div>
            )}

            {step === "success" && (
              <div className="rli-success-box">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>✓</div>
                <h3 style={{ margin: 0 }}>Request received. You&apos;re in good hands.</h3>
                <p>
                  {rep.name} will follow up shortly to schedule your free inspection and walk you through the next steps.
                </p>
                {rep.phone && (
                  <a className="rli-btn rli-btn-secondary" href={`tel:${rep.phone}`} style={{ display: "inline-flex", marginTop: "18px" }}>
                    Call {rep.phone}
                  </a>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="rli-footer">
        <div className="rli-container">
          {businessName} • {rep.name} • {roleLabel}
        </div>
      </footer>
    </>
  );
}
