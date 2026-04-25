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
  id: 0,
  name: "Eric Swanberg",
  title: "Exterior Renovation Consultant",
  role: "AMRG Exteriors",
  phone: "(612) 513-7534",
  email: "ericswanberg@mcgeerestoration.com",
  photoUrl: "",
};

type RepOption = {
  id: number;
  name: string;
  title: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  isActive: boolean;
};

function fillTemplate(value: string, replacements: Record<string, string>) {
  return value.replace(/{{\s*(firstName|repName|companyName)\s*}}/g, (_, key: string) => {
    return replacements[key] ?? "";
  });
}

export default function RepLandingEditorPage() {
  const [data, setData] = useState<RepLandingTemplateData>(DEFAULT_REP_LANDING_TEMPLATE);
  const [reps, setReps] = useState<RepOption[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<number>(0);
  const [repForm, setRepForm] = useState({
    name: SAMPLE_REP.name,
    title: SAMPLE_REP.title,
    role: SAMPLE_REP.role,
    phone: SAMPLE_REP.phone,
    email: SAMPLE_REP.email,
    photoUrl: SAMPLE_REP.photoUrl,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [repSaving, setRepSaving] = useState(false);
  const [repSaved, setRepSaved] = useState(false);
  const [error, setError] = useState("");
  const [repError, setRepError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/rep-landing-page").then((r) => r.json()),
      fetch("/api/reps").then((r) => r.json()).catch(() => ({ reps: [] })),
    ])
      .then(([templatePayload, repsPayload]) => {
        setData(normalizeRepLandingTemplate(templatePayload?.page));

        const loadedReps = Array.isArray(repsPayload?.reps)
          ? (repsPayload.reps as RepOption[])
          : [];
        setReps(loadedReps);

        const initialRep = loadedReps.find((rep) => rep.isActive) ?? loadedReps[0];
        if (initialRep) {
          setSelectedRepId(initialRep.id);
          setRepForm({
            name: initialRep.name || "",
            title: initialRep.title || "",
            role: initialRep.company || "",
            phone: initialRep.phone || "",
            email: initialRep.email || "",
            photoUrl: initialRep.photoUrl || "",
          });
        }

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

  function updateRepField(
    field: "name" | "title" | "role" | "phone" | "email" | "photoUrl",
    value: string
  ) {
    setRepForm((current) => ({ ...current, [field]: value }));
    setRepSaved(false);
    setRepError("");
  }

  function handleRepSelection(repId: number) {
    setSelectedRepId(repId);
    const rep = reps.find((candidate) => candidate.id === repId);
    if (!rep) return;

    setRepForm({
      name: rep.name || "",
      title: rep.title || "",
      role: rep.company || "",
      phone: rep.phone || "",
      email: rep.email || "",
      photoUrl: rep.photoUrl || "",
    });
    setRepSaved(false);
    setRepError("");
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

  async function handleSaveRep() {
    if (!selectedRepId) {
      setRepError("Create or choose a rep first in the Reps tab.");
      return;
    }

    if (!repForm.name.trim()) {
      setRepError("Rep name is required.");
      return;
    }

    setRepSaving(true);
    setRepError("");

    const res = await fetch(`/api/reps/${selectedRepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: repForm.name.trim(),
        title: repForm.title.trim(),
        company: repForm.role.trim(),
        phone: repForm.phone.trim(),
        email: repForm.email.trim(),
        photoUrl: repForm.photoUrl.trim(),
      }),
    });

    if (res.ok) {
      const payload = await res.json().catch(() => null);
      const rep = payload?.rep;
      if (rep) {
        setReps((current) =>
          current.map((candidate) =>
            candidate.id === rep.id
              ? {
                  ...candidate,
                  name: rep.name ?? "",
                  title: rep.title ?? "",
                  company: rep.company ?? "",
                  phone: rep.phone ?? "",
                  email: rep.email ?? "",
                  photoUrl: rep.photoUrl ?? "",
                }
              : candidate
          )
        );
      }
      setRepSaved(true);
      setTimeout(() => setRepSaved(false), 3000);
    } else {
      const payload = await res.json().catch(() => ({}));
      setRepError(typeof payload.error === "string" ? payload.error : "Failed to save rep info.");
    }

    setRepSaving(false);
  }

  const previewRep = {
    id: selectedRepId || SAMPLE_REP.id,
    name: repForm.name || SAMPLE_REP.name,
    title: repForm.title || SAMPLE_REP.title,
    role: repForm.role || SAMPLE_REP.role,
    phone: repForm.phone || SAMPLE_REP.phone,
    email: repForm.email || SAMPLE_REP.email,
    photoUrl: repForm.photoUrl || SAMPLE_REP.photoUrl,
  };
  const companyName = previewRep.role || data.companyName || "Company";
  const websiteLabel = data.websiteLabel || data.websiteUrl;
  const firstName = previewRep.name.split(" ")[0];
  const previewFormBody = fillTemplate(data.formBody, {
    firstName,
    repName: previewRep.name,
    companyName,
  });
  const previewSuccessBody = fillTemplate(data.successBody, {
    firstName,
    repName: previewRep.name,
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
        {repError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2 mb-5">
            {repError}
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="flex flex-col gap-5">
              <div className="card">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <h3 className="text-white font-semibold" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                    Rep Info
                  </h3>
                  <button onClick={handleSaveRep} disabled={repSaving || loading || !selectedRepId} className="btn-primary text-xs py-1.5 px-3">
                    {repSaving ? "Saving..." : repSaved ? "Saved!" : "Save Rep Info"}
                  </button>
                </div>

                <label className="label">Rep slot</label>
                <select
                  className="input"
                  value={selectedRepId || ""}
                  onChange={(e) => handleRepSelection(Number(e.target.value))}
                >
                  {!selectedRepId && <option value="">Select a rep</option>}
                  {reps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      #{rep.id} · {rep.name} {rep.isActive ? "(active)" : "(inactive)"}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Name</label>
                    <input className="input" value={repForm.name} onChange={(e) => updateRepField("name", e.target.value)} placeholder="Rep name" />
                  </div>
                  <div>
                    <label className="label">Title</label>
                    <input className="input" value={repForm.title} onChange={(e) => updateRepField("title", e.target.value)} placeholder="Exterior Renovation Consultant" />
                  </div>
                </div>

                <label className="label mt-3">Role</label>
                <input className="input" value={repForm.role} onChange={(e) => updateRepField("role", e.target.value)} placeholder="AMRG Exteriors" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={repForm.phone} onChange={(e) => updateRepField("phone", e.target.value)} placeholder="(555) 555-5555" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" value={repForm.email} onChange={(e) => updateRepField("email", e.target.value)} placeholder="name@company.com" />
                  </div>
                </div>

                <label className="label mt-3">Headshot image URL</label>
                <input className="input" type="url" value={repForm.photoUrl} onChange={(e) => updateRepField("photoUrl", e.target.value)} placeholder="https://... (SharePoint URL)" />
                <p className="text-slate-500 text-xs mt-2">
                  This fills each rep's own landing page while the sections below stay reusable as the shared blank template.
                </p>
              </div>

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
                    <div style={{ color: "white", fontSize: "20px", fontWeight: 800, marginTop: "6px" }}>{previewRep.name}</div>
                    <div style={{ color: "#f59e0b", fontSize: "13px", marginTop: "6px" }}>{previewRep.title}</div>
                  </div>
                  <div style={{ width: "72px", height: "72px", borderRadius: "18px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", display: "grid", placeItems: "center", color: "#fbbf24", fontSize: "28px", overflow: "hidden" }}>
                    {previewRep.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewRep.photoUrl} alt={previewRep.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : data.logoUrl ? (
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
                  <div>{previewRep.phone}</div>
                  <div>{previewRep.email}</div>
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
