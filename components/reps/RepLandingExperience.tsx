"use client";

import { useEffect, useState } from "react";
import type { RepLandingTemplateData } from "@/lib/repLandingTemplate";

export interface RepLandingRep {
  id: number;
  name: string;
  phone: string | null;
  officePhone: string | null;
  email: string | null;
  title: string | null;
  company: string | null;
  bio: string | null;
  photoUrl: string | null;
  websiteLabel: string | null;
  websiteUrl: string | null;
  address: string | null;
  calLink: string | null;
}

type Step = "profile" | "form" | "success";

const css = `
  .rli-root,
  .rli-root * {
    box-sizing: border-box;
  }

  .rli-root {
    font-family: Inter, Arial, Helvetica, sans-serif;
    background:
      radial-gradient(circle at top right, rgba(245,163,0,0.14), transparent 28%),
      radial-gradient(circle at bottom left, rgba(255,191,60,0.08), transparent 22%),
      linear-gradient(180deg, #090909 0%, #0f1014 100%);
    color: #f3f5f7;
    min-height: 100%;
  }

  .rli-root-preview {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 20px 60px rgba(0,0,0,0.35);
  }

  .rli-root a {
    color: inherit;
    text-decoration: none;
  }

  .rli-container {
    width: min(1160px, calc(100% - 32px));
    margin: 0 auto;
  }

  .rli-topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(14px);
    background: rgba(9, 9, 11, 0.72);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .rli-root-preview .rli-topbar {
    position: relative;
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
    color: #f5a300;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
    font-size: 1.15rem;
    overflow: hidden;
  }

  .rli-brand-copy small {
    display: block;
    color: #f5a300;
    font-size: 0.72rem;
    letter-spacing: 0.18em;
    margin-bottom: 3px;
  }

  .rli-brand-copy span {
    display: block;
    font-size: 1rem;
  }

  .rli-nav-cta {
    padding: 12px 18px;
    border-radius: 999px;
    background: linear-gradient(135deg, #f5a300, #ffbf3c);
    color: #151515;
    font-weight: 800;
    box-shadow: 0 10px 30px rgba(245,163,0,0.24);
    white-space: nowrap;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.95rem;
  }

  .rli-hero {
    padding: 56px 0 48px;
  }

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
    color: #ffbf3c;
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

  .rli-hero-p {
    margin: 0;
    color: #b7bcc7;
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
    background: linear-gradient(135deg, #f5a300, #ffbf3c);
    color: #141414;
    box-shadow: 0 16px 34px rgba(245,163,0,0.22);
  }

  .rli-btn-secondary {
    border: 1px solid rgba(255,255,255,0.09) !important;
    background: rgba(255,255,255,0.03);
    color: #f3f5f7;
  }

  .rli-btn:hover {
    transform: translateY(-2px);
  }

  .rli-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .rli-contact-strip {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    color: #b7bcc7;
    font-size: 0.95rem;
  }

  .rli-contact-strip span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .rli-micro-note {
    margin-top: 14px;
    color: #ffbf3c;
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
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    padding: 24px;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 18px;
    isolation: isolate;
  }

  .rli-tap-card::before {
    content: "";
    position: absolute;
    left: -5%;
    right: -5%;
    bottom: 12px;
    height: 6px;
    background: linear-gradient(90deg, transparent 0%, #f5a300 22%, #ffbf3c 50%, #f5a300 78%, transparent 100%);
    opacity: 0.95;
  }

  .rli-card-info h2 {
    margin: 0;
    font-size: clamp(1.7rem, 3vw, 2.25rem);
    line-height: 1;
  }

  .rli-card-role {
    margin-top: 10px;
    color: #ffbf3c;
    font-weight: 700;
    font-size: 0.96rem;
  }

  .rli-card-bio {
    margin-top: 10px;
    color: #b7bcc7;
    font-size: 0.85rem;
    line-height: 1.55;
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

  .rli-card-details a {
    color: inherit;
    word-break: break-word;
  }

  .rli-card-details span:last-child {
    white-space: pre-line;
  }

  .rli-dot {
    width: 24px;
    height: 24px;
    min-width: 24px;
    border-radius: 999px;
    background: rgba(245,163,0,0.14);
    border: 1px solid rgba(245,163,0,0.32);
    color: #f5a300;
    display: grid;
    place-items: center;
    font-size: 0.68rem;
    margin-top: 1px;
    font-weight: 700;
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

  .rli-photo-chip {
    width: 104px;
    height: 104px;
    border-radius: 22px;
    overflow: hidden;
    border: 1px solid rgba(245,163,0,0.24);
    box-shadow: 0 10px 25px rgba(245,163,0,0.18);
    margin-bottom: 14px;
  }

  .rli-photo-chip img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .rli-tagline {
    color: #ffbf3c;
    font-weight: 700;
    font-size: 0.95rem;
  }

  .rli-cta-block {
    margin: 40px 0 60px;
    background:
      radial-gradient(circle at top right, rgba(245,163,0,0.18), transparent 28%),
      linear-gradient(135deg, #15171b 0%, #0d0f13 100%);
    border: 1px solid rgba(245,163,0,0.16);
    border-radius: 32px;
    padding: 34px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .rli-cta-block h3 {
    margin: 0 0 8px;
    font-size: clamp(1.7rem, 3vw, 2.6rem);
  }

  .rli-cta-block > div > p {
    margin: 0;
    color: #b7bcc7;
    line-height: 1.7;
    max-width: 680px;
  }

  .rli-form-grid {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }

  .rli-form-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 12px 16px;
    color: #f3f5f7;
    font-size: 0.95rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
  }

  .rli-form-input:focus {
    border-color: rgba(245,163,0,0.4);
  }

  .rli-form-input::placeholder {
    color: #b7bcc7;
  }

  .rli-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 10px 14px;
    color: #fca5a5;
    font-size: 0.88rem;
    margin-bottom: 12px;
  }

  .rli-success-box {
    text-align: center;
    padding: 12px 0;
    width: 100%;
  }

  .rli-success-box p {
    color: #b7bcc7;
    line-height: 1.7;
    margin: 10px 0 0;
  }

  .rli-footer {
    padding: 0 0 42px;
    color: #8d94a0;
    font-size: 0.92rem;
  }

  @media (max-width: 980px) {
    .rli-hero-grid {
      grid-template-columns: 1fr;
    }

    .rli-tap-card {
      max-width: 560px;
    }
  }

  @media (max-width: 720px) {
    .rli-hero {
      padding-top: 34px;
    }

    .rli-tap-card {
      grid-template-columns: 1fr;
      aspect-ratio: auto;
      padding-bottom: 86px;
    }

    .rli-logo-side {
      padding-left: 0;
      margin-top: 8px;
    }

    .rli-contact-strip {
      flex-direction: column;
      gap: 10px;
    }

    .rli-cta-block {
      padding: 26px;
    }
  }
`;

function fillTemplate(value: string, replacements: Record<string, string>) {
  return value.replace(/{{\s*(firstName|repName|companyName)\s*}}/g, (_, key: string) => {
    return replacements[key] ?? "";
  });
}

function normalizeMultiline(value: string | null) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function buildSmsHref(firstName: string, phone: string) {
  const body = `Hi ${firstName}, this is [your name]. I wanted to follow up about my home.`;
  return `sms:${phone}?body=${encodeURIComponent(body)}`;
}

export default function RepLandingExperience({
  rep,
  template,
  previewMode = false,
}: {
  rep: RepLandingRep;
  template: RepLandingTemplateData;
  previewMode?: boolean;
}) {
  const [step, setStep] = useState<Step>("profile");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const businessName = rep.company?.trim() || template.companyName;
  const roleLabel = rep.title?.trim() || "Exterior Renovation Consultant";
  const firstName = rep.name.split(" ")[0] || rep.name;
  const websiteUrl = rep.websiteUrl?.trim() || template.websiteUrl;
  const websiteLabel = rep.websiteLabel?.trim() || template.websiteLabel || websiteUrl;
  const logoSrc = template.logoUrl || "/logo.png";
  const address = normalizeMultiline(rep.address);
  const formBody = fillTemplate(template.formBody, {
    firstName,
    repName: rep.name,
    companyName: businessName,
  });
  const successBody = fillTemplate(template.successBody, {
    firstName,
    repName: rep.name,
    companyName: businessName,
  });
  const topPhone = rep.phone?.trim() || rep.officePhone?.trim() || null;
  const phoneBlock =
    rep.phone?.trim() && rep.officePhone?.trim()
      ? `M: ${rep.phone.trim()}\nO: ${rep.officePhone.trim()}`
      : rep.phone?.trim() || rep.officePhone?.trim() || null;

  useEffect(() => {
    if (previewMode) return;

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "TAP", meta: { path: window.location.pathname } }),
    }).catch(() => {});
  }, [previewMode, rep.id]);

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openForm() {
    setStep("form");
    if (previewMode) return;

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

    if (previewMode) {
      setStep("success");
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
    if (previewMode) return;

    const lastName = rep.name.split(" ").slice(1).join(" ");
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${rep.name}`,
      `N:${lastName};${firstName};;;`,
      `ORG:${businessName}`,
      `TITLE:${roleLabel}`,
      rep.phone ? `TEL;TYPE=CELL:${rep.phone}` : "",
      rep.officePhone ? `TEL;TYPE=WORK:${rep.officePhone}` : "",
      rep.email ? `EMAIL:${rep.email}` : "",
      websiteUrl ? `URL:${websiteUrl}` : "",
      address ? `ADR;TYPE=WORK:;;${address.replace(/\n/g, "\\n")};;;;` : "",
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

  return (
    <div className={previewMode ? "rli-root rli-root-preview" : "rli-root"}>
      <style>{css}</style>

      <header className="rli-topbar">
        <div className="rli-container rli-nav">
          <a href="#top" className="rli-brand">
            <div className="rli-brand-mark">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt={`${businessName} logo`} style={{ width: "28px", height: "auto" }} />
            </div>
            <div className="rli-brand-copy">
              <small>{businessName.toUpperCase()}</small>
              <span>Tap Card</span>
            </div>
          </a>

          {topPhone &&
            (previewMode ? (
              <button type="button" className="rli-nav-cta">
                Call Now
              </button>
            ) : (
              <a className="rli-nav-cta" href={`tel:${topPhone}`}>
                Call Now
              </a>
            ))}
        </div>
      </header>

      <main id="top">
        <section className="rli-hero">
          <div className="rli-container rli-hero-grid">
            <div>
              {template.badge && <div className="rli-eyebrow">{template.badge}</div>}
              <h1 className="rli-h1">{template.headline}</h1>
              <p className="rli-hero-p">{template.intro}</p>

              <div className="rli-hero-actions">
                {rep.phone &&
                  (previewMode ? (
                    <button type="button" className="rli-btn rli-btn-primary">
                      Call {firstName}
                    </button>
                  ) : (
                    <a className="rli-btn rli-btn-primary" href={`tel:${rep.phone}`}>
                      Call {firstName}
                    </a>
                  ))}

                {rep.phone &&
                  (previewMode ? (
                    <button type="button" className="rli-btn rli-btn-secondary">
                      Text {firstName}
                    </button>
                  ) : (
                    <a className="rli-btn rli-btn-secondary" href={buildSmsHref(firstName, rep.phone)}>
                      Text {firstName}
                    </a>
                  ))}

                <button type="button" className="rli-btn rli-btn-secondary" onClick={downloadContact}>
                  Save Contact
                </button>

                {rep.calLink && !previewMode ? (
                  <a className="rli-btn rli-btn-primary" href={rep.calLink} target="_blank" rel="noopener noreferrer">
                    {template.primaryCtaText}
                  </a>
                ) : (
                  <button type="button" className="rli-btn rli-btn-primary" onClick={openForm}>
                    {template.primaryCtaText}
                  </button>
                )}
              </div>

              {template.microNote && <div className="rli-micro-note">{template.microNote}</div>}

              <div className="rli-contact-strip">
                {rep.phone && <span>Mobile: {rep.phone}</span>}
                {rep.officePhone && <span>Office: {rep.officePhone}</span>}
                {rep.email && <span>Email: {rep.email}</span>}
              </div>
            </div>

            <div className="rli-mockup-wrap">
              <div className="rli-card-glow" />
              <div className="rli-tap-card">
                <div className="rli-card-info">
                  <h2>{rep.name}</h2>
                  <div className="rli-card-role">{roleLabel}</div>
                  {rep.bio && <div className="rli-card-bio">{rep.bio}</div>}

                  <div className="rli-card-details">
                    {phoneBlock && (
                      <div>
                        <span className="rli-dot">PH</span>
                        <span>{phoneBlock}</span>
                      </div>
                    )}
                    {rep.email && (
                      <div>
                        <span className="rli-dot">@</span>
                        <span>{rep.email}</span>
                      </div>
                    )}
                    {websiteUrl && (
                      <div>
                        <span className="rli-dot">WB</span>
                        {previewMode ? <span>{websiteLabel}</span> : <a href={websiteUrl} target="_blank" rel="noopener noreferrer">{websiteLabel}</a>}
                      </div>
                    )}
                    {address && (
                      <div>
                        <span className="rli-dot">AD</span>
                        <span>{address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rli-logo-side">
                  {rep.photoUrl ? (
                    <div className="rli-photo-chip">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rep.photoUrl} alt={rep.name} />
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoSrc} alt={`${businessName} logo`} className="rli-logo-img" />
                    </>
                  )}
                  {template.serviceLine && <div className="rli-tagline">{template.serviceLine}</div>}
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
                  <h3>{template.ctaHeading}</h3>
                  <p>{template.ctaBody}</p>
                </div>

                <div className="rli-hero-actions">
                  {rep.phone &&
                    (previewMode ? (
                      <button type="button" className="rli-btn rli-btn-primary">
                        Call {firstName}
                      </button>
                    ) : (
                      <a className="rli-btn rli-btn-primary" href={`tel:${rep.phone}`}>
                        Call {firstName}
                      </a>
                    ))}

                  {rep.phone &&
                    (previewMode ? (
                      <button type="button" className="rli-btn rli-btn-secondary">
                        Text {firstName}
                      </button>
                    ) : (
                      <a className="rli-btn rli-btn-secondary" href={buildSmsHref(firstName, rep.phone)}>
                        Text {firstName}
                      </a>
                    ))}

                  <button type="button" className="rli-btn rli-btn-secondary" onClick={downloadContact}>
                    Save Contact
                  </button>

                  {rep.calLink && !previewMode ? (
                    <a className="rli-btn rli-btn-secondary" href={rep.calLink} target="_blank" rel="noopener noreferrer">
                      {template.primaryCtaText}
                    </a>
                  ) : (
                    <button type="button" className="rli-btn rli-btn-primary" onClick={openForm}>
                      {template.primaryCtaText}
                    </button>
                  )}
                </div>
              </>
            )}

            {step === "form" && (
              <div style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setStep("profile")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#b7bcc7",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                  >
                    Back
                  </button>
                </div>

                <h3 style={{ margin: "0 0 6px" }}>{template.formHeading}</h3>
                <p style={{ margin: "0 0 16px", color: "#b7bcc7", lineHeight: 1.7 }}>{formBody}</p>

                {error && <div className="rli-error">{error}</div>}

                <form onSubmit={handleSubmit} className="rli-form-grid">
                  <input className="rli-form-input" placeholder="Your name *" value={form.name} onChange={(e) => update("name", e.target.value)} required autoFocus />
                  <input className="rli-form-input" placeholder="Phone number" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  <input className="rli-form-input" placeholder="Email address" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  <input className="rli-form-input" placeholder="Property address" value={form.address} onChange={(e) => update("address", e.target.value)} />
                  <textarea className="rli-form-input" rows={3} style={{ resize: "none" }} placeholder="Briefly describe what you're seeing: hail, leaks, missing shingles, siding damage, etc." value={form.notes} onChange={(e) => update("notes", e.target.value)} />
                  <button type="submit" disabled={submitting} className="rli-btn rli-btn-primary" style={{ width: "100%" }}>
                    {submitting ? "Sending..." : "Send Inspection Request"}
                  </button>
                </form>
              </div>
            )}

            {step === "success" && (
              <div className="rli-success-box">
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>OK</div>
                <h3 style={{ margin: 0 }}>{template.successHeading}</h3>
                <p>{successBody}</p>
                <div style={{ display: "inline-flex", gap: "12px", marginTop: "18px", flexWrap: "wrap", justifyContent: "center" }}>
                  {rep.phone &&
                    (previewMode ? (
                      <button type="button" className="rli-btn rli-btn-secondary">
                        Call {rep.phone}
                      </button>
                    ) : (
                      <a className="rli-btn rli-btn-secondary" href={`tel:${rep.phone}`}>
                        Call {rep.phone}
                      </a>
                    ))}
                  {previewMode && (
                    <button type="button" className="rli-btn rli-btn-primary" onClick={() => setStep("profile")}>
                      Back to preview
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="rli-footer">
        <div className="rli-container">
          {businessName} | {rep.name} | {roleLabel}
        </div>
      </footer>
    </div>
  );
}
