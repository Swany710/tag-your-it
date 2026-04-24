"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import {
  DEFAULT_REP_LANDING_TEMPLATE,
  normalizeRepLandingTemplate,
  type RepLandingTemplateData,
} from "@/lib/repLandingTemplate";

const SAMPLE_REP = {
  name: "Eric Swanberg",
  title: "Exterior Renovation Consultant",
  phone: "(612) 513-7534",
  email: "ericswanberg@mcgeerestoration.com",
};

function fillTemplate(value: string, replacements: Record<string, string>) {
  return value.replace(/{{\s*(firstName|repName|companyName)\s*}}/g, (_, key: string) => {
    return replacements[key] ?? "";
  });
}

export default function RepLandingEditorPage() {
  const [data, setData] = useState<RepLandingTemplateData>(DEFAULT_REP_LANDING_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rep-landing-page")
      .then((r) => r.json())
      .then(({ page }) => {
        setData(normalizeRepLandingTemplate(page));
        setLoading(false);
      })
      .catch(() => {
        setData(DEFAULT_REP_LANDING_TEMPLATE);
        setLoading(false);
      });
  }, []);

  function update(field: keyof RepLandingTemplateData, value: string) {
    setData((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setError("");
  }

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch("/api/rep-landing-page", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const payload = await res.json().catch(() => null);
      setData(normalizeRepLandingTemplate(payload?.page));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const payload = await res.json().catch(() => ({}));
      setError(
        typeof payload.error === "string"
          ? payload.error
          : "Failed to save the rep landing template."
      );
    }

    setSaving(false);
  }

  const companyName = data.companyName || "Company";
  const websiteLabel = data.websiteLabel || data.websiteUrl;
  const firstName = SAMPLE_REP.name.split(" ")[0];
  const previewFormBody = fillTemplate(data.formBody, {
    firstName,
    repName: SAMPLE_REP.name,
    companyName,
  });
  const previewSuccessBody = fillTemplate(data.successBody, {
    firstName,
    repName: SAMPLE_REP.name,
    companyName,
  });

  return (
    <AdminShell>
      <div className="p-8" style={{ maxWidth: "1100px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white">Rep Landing Template</h1>
            <p className="text-slate-400 text-sm mt-1">
              Edit the shared copy and branding used across every <code className="text-orange-400">/r/[repId]</code> landing page.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Each rep still keeps their own name, title, phone, email, company, and booking link.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/admin/reps" className="btn-secondary">
              Open Reps
            </Link>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-primary"
              style={{ minWidth: "110px" }}
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2 mb-5">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="flex flex-col gap-5">
              <div className="card">
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  Branding
                </h3>
                <label className="label">Default company name</label>
                <input className="input" value={data.companyName} onChange={(e) => update("companyName", e.target.value)} />
                <label className="label mt-3">Logo URL (optional)</label>
                <input className="input" type="url" value={data.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} placeholder="https://..." />
                <label className="label mt-3">Service line</label>
                <input className="input" value={data.serviceLine} onChange={(e) => update("serviceLine", e.target.value)} placeholder="Roofing | Siding | Windows" />
                <label className="label mt-3">Website label</label>
                <input className="input" value={data.websiteLabel} onChange={(e) => update("websiteLabel", e.target.value)} placeholder="www.mcgeerestoration.com" />
                <label className="label mt-3">Website URL</label>
                <input className="input" type="url" value={data.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://www.mcgeerestoration.com" />
              </div>

              <div className="card">
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  Hero Copy
                </h3>
                <label className="label">Badge</label>
                <input className="input" value={data.badge} onChange={(e) => update("badge", e.target.value)} placeholder="Good meeting you" />
                <label className="label mt-3">Headline</label>
                <input className="input" value={data.headline} onChange={(e) => update("headline", e.target.value)} />
                <label className="label mt-3">Intro paragraph</label>
                <textarea className="input" rows={4} value={data.intro} onChange={(e) => update("intro", e.target.value)} style={{ resize: "vertical" }} />
                <label className="label mt-3">Primary CTA text</label>
                <input className="input" value={data.primaryCtaText} onChange={(e) => update("primaryCtaText", e.target.value)} placeholder="Start My Inspection" />
                <label className="label mt-3">Micro note</label>
                <input className="input" value={data.microNote} onChange={(e) => update("microNote", e.target.value)} placeholder="Fastest next step..." />
              </div>

              <div className="card">
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  CTA Section
                </h3>
                <label className="label">Section heading</label>
                <input className="input" value={data.ctaHeading} onChange={(e) => update("ctaHeading", e.target.value)} />
                <label className="label mt-3">Section body</label>
                <textarea className="input" rows={4} value={data.ctaBody} onChange={(e) => update("ctaBody", e.target.value)} style={{ resize: "vertical" }} />
              </div>

              <div className="card">
                <h3 className="text-white font-semibold mb-4" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                  Form And Success Copy
                </h3>
                <label className="label">Form heading</label>
                <input className="input" value={data.formHeading} onChange={(e) => update("formHeading", e.target.value)} />
                <label className="label mt-3">Form body</label>
                <textarea className="input" rows={3} value={data.formBody} onChange={(e) => update("formBody", e.target.value)} style={{ resize: "vertical" }} />
                <p className="text-slate-500 text-xs mt-1">
                  Available tokens: <code className="text-orange-400">{"{{firstName}}"}</code>, <code className="text-orange-400">{"{{repName}}"}</code>, <code className="text-orange-400">{"{{companyName}}"}</code>
                </p>
                <label className="label mt-3">Success heading</label>
                <input className="input" value={data.successHeading} onChange={(e) => update("successHeading", e.target.value)} />
                <label className="label mt-3">Success body</label>
                <textarea className="input" rows={3} value={data.successBody} onChange={(e) => update("successBody", e.target.value)} style={{ resize: "vertical" }} />
              </div>
            </div>

            <div className="xl:sticky xl:top-20 self-start">
              <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Preview
                </span>
                <span style={{ fontSize: "11px", color: "#475569" }}>(sample rep data)</span>
              </div>

              <div
                style={{
                  background: "linear-gradient(180deg, #090909 0%, #0f1014 100%)",
                  borderRadius: "20px",
                  padding: "24px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <div style={{ color: "#fbbf24", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700 }}>
                      {companyName}
                    </div>
                    <div style={{ color: "white", fontSize: "20px", fontWeight: 800, marginTop: "6px" }}>{SAMPLE_REP.name}</div>
                    <div style={{ color: "#f59e0b", fontSize: "13px", marginTop: "6px" }}>{SAMPLE_REP.title}</div>
                  </div>
                  <div style={{ width: "72px", height: "72px", borderRadius: "18px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", display: "grid", placeItems: "center", color: "#fbbf24", fontSize: "28px", overflow: "hidden" }}>
                    {data.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={data.logoUrl} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>{companyName.charAt(0)}</span>
                    )}
                  </div>
                </div>

                {data.badge && (
                  <div style={{ display: "inline-flex", padding: "8px 12px", borderRadius: "999px", border: "1px solid rgba(245,158,11,0.24)", background: "rgba(245,158,11,0.08)", color: "#fbbf24", fontSize: "12px", fontWeight: 700, marginBottom: "16px" }}>
                    {data.badge}
                  </div>
                )}

                <div style={{ color: "white", fontSize: "24px", fontWeight: 800, lineHeight: 1.1, marginBottom: "12px" }}>{data.headline}</div>
                <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>{data.intro}</p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
                  <div style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)", color: "#111827", padding: "10px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 800 }}>
                    {data.primaryCtaText}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", color: "white", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "13px", fontWeight: 700 }}>
                    Text {firstName}
                  </div>
                </div>

                {data.microNote && (
                  <div style={{ marginTop: "14px", color: "#fcd34d", fontSize: "13px", fontWeight: 600 }}>{data.microNote}</div>
                )}

                <div style={{ marginTop: "18px", display: "grid", gap: "8px", color: "#cbd5e1", fontSize: "13px" }}>
                  <div>{SAMPLE_REP.phone}</div>
                  <div>{SAMPLE_REP.email}</div>
                  <div>{websiteLabel}</div>
                </div>

                {data.serviceLine && (
                  <div style={{ marginTop: "18px", color: "#fcd34d", fontSize: "13px", fontWeight: 700 }}>{data.serviceLine}</div>
                )}

                <div style={{ marginTop: "22px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px" }}>
                  <div style={{ color: "white", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>{data.ctaHeading}</div>
                  <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>{data.ctaBody}</p>
                </div>

                <div style={{ marginTop: "22px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px" }}>
                  <div style={{ color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{data.formHeading}</div>
                  <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{previewFormBody}</p>
                </div>

                <div style={{ marginTop: "16px", borderRadius: "14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)", padding: "16px" }}>
                  <div style={{ color: "white", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>{data.successHeading}</div>
                  <p style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{previewSuccessBody}</p>
                </div>
              </div>

              <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "10px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <p style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                  Shared template behavior
                </p>
                <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6 }}>
                  Every rep page uses this template, then fills in that rep's own info. Use the Reps page when you want to change who the page belongs to.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
