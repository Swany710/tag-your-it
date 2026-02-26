"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface DealPageData {
  id: number;
  isLive: boolean;
  badge: string;
  headline: string;
  subheadline: string | null;
  body: string | null;
  ctaText: string;
  ctaUrl: string;
  companyName: string;
  logoUrl: string | null;
  updatedAt: string;
}

const DEFAULT: Omit<DealPageData, "id" | "updatedAt"> = {
  isLive: true,
  badge: "Limited Time Offer",
  headline: "Special Offer for You",
  subheadline: "",
  body: "",
  ctaText: "Get a Free Quote",
  ctaUrl: "",
  companyName: "Tag Your It",
  logoUrl: "",
};

export default function DealsEditorPage() {
  const [data, setData] = useState<typeof DEFAULT>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPreviewUrl(window.location.origin + "/deals");
    }
    fetch("/api/deal-page")
      .then((r) => r.json())
      .then(({ page }) => {
        if (page) {
          setData({
            isLive: page.isLive,
            badge: page.badge ?? "",
            headline: page.headline ?? "",
            subheadline: page.subheadline ?? "",
            body: page.body ?? "",
            ctaText: page.ctaText ?? "",
            ctaUrl: page.ctaUrl ?? "",
            companyName: page.companyName ?? "",
            logoUrl: page.logoUrl ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  function update(field: string, value: string | boolean) {
    setData((d) => ({ ...d, [field]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/deal-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        subheadline: data.subheadline || null,
        body: data.body || null,
        logoUrl: data.logoUrl || null,
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  return (
    <AdminShell>
      <div className="p-8" style={{ maxWidth: "900px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
          <div>
            <h1 className="text-2xl font-bold text-white">Deals Page</h1>
            <p className="text-slate-400 text-sm mt-1">
              Edit the page your customers land on when tapping an NFC tag.
              {previewUrl && (
                <>
                  {" "}Live at{" "}
                  <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                    {previewUrl}
                  </a>
                </>
              )}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Live toggle */}
            <button
              onClick={() => update("isLive", !data.isLive)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 14px", borderRadius: "8px", cursor: "pointer",
                border: "1px solid",
                background: data.isLive ? "rgba(34,197,94,0.15)" : "rgba(100,116,139,0.2)",
                borderColor: data.isLive ? "rgba(34,197,94,0.4)" : "rgba(100,116,139,0.3)",
                color: data.isLive ? "#4ade80" : "#64748b",
                fontSize: "13px", fontWeight: 600,
              }}
            >
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: data.isLive ? "#4ade80" : "#475569",
                boxShadow: data.isLive ? "0 0 6px #4ade80" : "none",
              }} />
              {data.isLive ? "Page is Live" : "Page is Hidden"}
            </button>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-primary"
              style={{ minWidth: "100px" }}
            >
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

            {/* LEFT COLUMN — form fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Badge */}
              <div className="card">
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  Badge / Label
                </h3>
                <label className="label">Badge text (shown above headline)</label>
                <input
                  className="input"
                  value={data.badge}
                  onChange={(e) => update("badge", e.target.value)}
                  placeholder="Limited Time Offer"
                />
                <p className="text-slate-500 text-xs mt-1">Leave blank to hide the badge.</p>
              </div>

              {/* Headline */}
              <div className="card">
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "16px" }}>
                  Headline
                </h3>
                <label className="label">Main headline *</label>
                <input
                  className="input"
                  value={data.headline}
                  onChange={(e) => update("headline", e.target.value)}
                  placeholder="20% Off All Roofing This Month"
                />
                <label className="label mt-3">Subheadline (optional)</label>
                <input
                  className="input"
                  value={data.subheadline ?? ""}
                  onChange={(e) => update("subheadline", e.target.value)}
                  placeholder="Valid through end of month. No hidden fees."
                />
              </div>

              {/* Deal details */}
              <div className="card">
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "16px" }}>
                  Deal Details
                </h3>
                <label className="label">Bullet points (one per line)</label>
                <textarea
                  className="input"
                  rows={6}
                  value={data.body ?? ""}
                  onChange={(e) => update("body", e.target.value)}
                  placeholder={"Free inspection with any quote\n20% off labor this month\nFinancing available — 0% for 12 months\nLicensed & insured, 5-star rated"}
                  style={{ resize: "vertical" }}
                />
                <p className="text-slate-500 text-xs mt-1">Each line becomes a ✓ bullet on the page.</p>
              </div>

              {/* CTA */}
              <div className="card">
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "16px" }}>
                  Call to Action Button
                </h3>
                <label className="label">Button text</label>
                <input
                  className="input"
                  value={data.ctaText}
                  onChange={(e) => update("ctaText", e.target.value)}
                  placeholder="Get a Free Quote"
                />
                <label className="label mt-3">Button URL (where it sends them)</label>
                <input
                  className="input"
                  type="url"
                  value={data.ctaUrl}
                  onChange={(e) => update("ctaUrl", e.target.value)}
                  placeholder="https://calendly.com/yourname or tel:5551234567"
                />
                <p className="text-slate-500 text-xs mt-1">Use <code className="text-orange-400">tel:5551234567</code> to open their dialer, or a Calendly/form link.</p>
              </div>

              {/* Branding */}
              <div className="card">
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8", marginBottom: "16px" }}>
                  Branding
                </h3>
                <label className="label">Company name</label>
                <input
                  className="input"
                  value={data.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Tag Your It"
                />
                <label className="label mt-3">Logo URL (optional)</label>
                <input
                  className="input"
                  type="url"
                  value={data.logoUrl ?? ""}
                  onChange={(e) => update("logoUrl", e.target.value)}
                  placeholder="https://... (leave blank to use icon + name)"
                />
              </div>

            </div>

            {/* RIGHT COLUMN — live preview */}
            <div style={{ position: "sticky", top: "80px", alignSelf: "flex-start" }}>
              <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Preview</span>
                <span style={{ fontSize: "11px", color: "#475569" }}>(updates as you type)</span>
              </div>

              {/* Mini preview card */}
              <div style={{
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
                borderRadius: "16px",
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}>

                {/* Company name */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "20px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "linear-gradient(135deg, #f97316, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                      <path d="M8.5 8.5h.01M15.5 8.5h.01M8.5 15.5h7"/>
                    </svg>
                  </div>
                  <span style={{ color: "white", fontSize: "15px", fontWeight: 700 }}>{data.companyName || "Company"}</span>
                </div>

                {/* Badge */}
                {data.badge && (
                  <div style={{ marginBottom: "14px" }}>
                    <span style={{
                      display: "inline-block",
                      background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.4)",
                      color: "#fb923c", fontSize: "10px", fontWeight: 700,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      padding: "4px 12px", borderRadius: "9999px",
                    }}>
                      🔥 {data.badge}
                    </span>
                  </div>
                )}

                {/* Headline */}
                <div style={{ color: "white", fontSize: "18px", fontWeight: 800, lineHeight: 1.2, marginBottom: "8px" }}>
                  {data.headline || <span style={{ color: "#475569" }}>Your headline here</span>}
                </div>

                {/* Subheadline */}
                {data.subheadline && (
                  <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", lineHeight: 1.4 }}>{data.subheadline}</div>
                )}

                {/* Body bullets */}
                {data.body && (
                  <div style={{
                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "14px 16px", marginBottom: "16px", textAlign: "left",
                  }}>
                    {data.body.split("\n").filter(Boolean).map((line, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < data.body!.split("\n").filter(Boolean).length - 1 ? "8px" : 0 }}>
                        <span style={{ color: "#f97316", fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                        <span style={{ color: "#e2e8f0", fontSize: "12px", lineHeight: 1.4 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA button */}
                {data.ctaText && (
                  <div style={{
                    background: "linear-gradient(135deg, #f97316, #ea580c)",
                    color: "white", fontWeight: 700, fontSize: "14px",
                    padding: "12px 24px", borderRadius: "10px",
                    boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
                  }}>
                    {data.ctaText}
                  </div>
                )}

                <div style={{ marginTop: "20px", color: "#334155", fontSize: "11px" }}>
                  Tap-powered by {data.companyName || "your company"}
                </div>
              </div>

              {/* Quick-set redirect hint */}
              {previewUrl && (
                <div style={{
                  marginTop: "16px", padding: "14px 16px", borderRadius: "10px",
                  background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
                }}>
                  <p style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                    💡 To send taps here
                  </p>
                  <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                    Go to the <strong style={{ color: "#e2e8f0" }}>Tags</strong> page → Set Redirect → paste:
                  </p>
                  <code style={{
                    display: "block", marginTop: "6px",
                    background: "rgba(0,0,0,0.3)", padding: "6px 10px", borderRadius: "6px",
                    color: "#fb923c", fontSize: "11px", wordBreak: "break-all",
                  }}>
                    {previewUrl}
                  </code>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </AdminShell>
  );
}
