"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import RepLandingExperience, { type RepLandingRep } from "@/components/reps/RepLandingExperience";
import {
  DEFAULT_REP_LANDING_TEMPLATE,
  normalizeRepLandingTemplate,
  type RepLandingTemplateData,
} from "@/lib/repLandingTemplate";

const SAMPLE_REP: RepLandingRep = {
  id: 0,
  name: "Eric Swanberg",
  title: "Exterior Renovation Consultant",
  company: "AMRG Exteriors",
  phone: "(612) 513-7534",
  officePhone: "(952) 426-3736",
  email: "ericswanberg@mcgeerestoration.com",
  bio: "",
  photoUrl: "",
  websiteLabel: "www.mcgeerestoration.com",
  websiteUrl: "https://www.mcgeerestoration.com",
  address: "10201 Wayzata Blvd #130\nMinnetonka, MN 55305",
  calLink: "",
};

type RepOption = {
  id: number;
  name: string;
  title: string | null;
  company: string | null;
  phone: string | null;
  officePhone: string | null;
  email: string | null;
  bio: string | null;
  photoUrl: string | null;
  websiteLabel: string | null;
  websiteUrl: string | null;
  address: string | null;
  calLink: string | null;
  isActive: boolean;
};

type RepForm = {
  name: string;
  title: string;
  company: string;
  phone: string;
  officePhone: string;
  email: string;
  bio: string;
  photoUrl: string;
  websiteLabel: string;
  websiteUrl: string;
  address: string;
  calLink: string;
};

function toRepForm(rep?: Partial<RepOption> | null): RepForm {
  return {
    name: rep?.name || SAMPLE_REP.name,
    title: rep?.title || SAMPLE_REP.title || "",
    company: rep?.company || SAMPLE_REP.company || "",
    phone: rep?.phone || SAMPLE_REP.phone || "",
    officePhone: rep?.officePhone || SAMPLE_REP.officePhone || "",
    email: rep?.email || SAMPLE_REP.email || "",
    bio: rep?.bio || SAMPLE_REP.bio || "",
    photoUrl: rep?.photoUrl || SAMPLE_REP.photoUrl || "",
    websiteLabel: rep?.websiteLabel || SAMPLE_REP.websiteLabel || "",
    websiteUrl: rep?.websiteUrl || SAMPLE_REP.websiteUrl || "",
    address: rep?.address || SAMPLE_REP.address || "",
    calLink: rep?.calLink || SAMPLE_REP.calLink || "",
  };
}

export default function RepLandingEditorPage() {
  const [data, setData] = useState<RepLandingTemplateData>(DEFAULT_REP_LANDING_TEMPLATE);
  const [reps, setReps] = useState<RepOption[]>([]);
  const [selectedRepId, setSelectedRepId] = useState<number>(0);
  const [repForm, setRepForm] = useState<RepForm>(toRepForm(null));
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
          setRepForm(toRepForm(initialRep));
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

  function updateRepField(field: keyof RepForm, value: string) {
    setRepForm((current) => ({ ...current, [field]: value }));
    setRepSaved(false);
    setRepError("");
  }

  function handleRepSelection(repId: number) {
    setSelectedRepId(repId);
    const rep = reps.find((candidate) => candidate.id === repId);
    setRepForm(toRepForm(rep));
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

    const payload = {
      name: repForm.name.trim(),
      title: repForm.title.trim(),
      company: repForm.company.trim(),
      phone: repForm.phone.trim(),
      officePhone: repForm.officePhone.trim(),
      email: repForm.email.trim(),
      bio: repForm.bio.trim(),
      photoUrl: repForm.photoUrl.trim(),
      websiteLabel: repForm.websiteLabel.trim(),
      websiteUrl: repForm.websiteUrl.trim(),
      address: repForm.address.trim(),
      calLink: repForm.calLink.trim(),
    };

    const res = await fetch(`/api/reps/${selectedRepId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const responsePayload = await res.json().catch(() => null);
      const rep = responsePayload?.rep;
      if (rep) {
        setReps((current) =>
          current.map((candidate) =>
            candidate.id === rep.id
              ? { ...candidate, ...rep }
              : candidate
          )
        );
      }
      setRepSaved(true);
      setTimeout(() => setRepSaved(false), 3000);
    } else {
      const responsePayload = await res.json().catch(() => ({}));
      setRepError(
        typeof responsePayload.error === "string"
          ? responsePayload.error
          : "Failed to save rep info."
      );
    }

    setRepSaving(false);
  }

  const previewRep: RepLandingRep = {
    id: selectedRepId || SAMPLE_REP.id,
    name: repForm.name || SAMPLE_REP.name,
    title: repForm.title || SAMPLE_REP.title,
    company: repForm.company || SAMPLE_REP.company,
    phone: repForm.phone || SAMPLE_REP.phone,
    officePhone: repForm.officePhone || SAMPLE_REP.officePhone,
    email: repForm.email || SAMPLE_REP.email,
    bio: repForm.bio || SAMPLE_REP.bio,
    photoUrl: repForm.photoUrl || SAMPLE_REP.photoUrl,
    websiteLabel: repForm.websiteLabel || SAMPLE_REP.websiteLabel,
    websiteUrl: repForm.websiteUrl || SAMPLE_REP.websiteUrl,
    address: repForm.address || SAMPLE_REP.address,
    calLink: repForm.calLink || SAMPLE_REP.calLink,
  };

  return (
    <AdminShell>
      <div className="p-8" style={{ maxWidth: "1280px" }}>
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
              Each rep keeps their own business card details, and the preview updates with the selected rep.
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
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_500px] gap-6">
            <div className="flex flex-col gap-5">
              <div className="card">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                  <h3 className="text-white font-semibold" style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
                    Rep Business Card
                  </h3>
                  <button onClick={handleSaveRep} disabled={repSaving || loading || !selectedRepId} className="btn-primary text-xs py-1.5 px-3">
                    {repSaving ? "Saving..." : repSaved ? "Saved!" : "Save Rep Info"}
                  </button>
                </div>

                <label className="label">Rep slot</label>
                <select className="input" value={selectedRepId || ""} onChange={(e) => handleRepSelection(Number(e.target.value))}>
                  {!selectedRepId && <option value="">Select a rep</option>}
                  {reps.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      #{rep.id} | {rep.name} {rep.isActive ? "(active)" : "(inactive)"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={repForm.company} onChange={(e) => updateRepField("company", e.target.value)} placeholder="AMRG Exteriors" />
                  </div>
                  <div>
                    <label className="label">Headshot image URL</label>
                    <input className="input" type="url" value={repForm.photoUrl} onChange={(e) => updateRepField("photoUrl", e.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <label className="label mt-3">Bio / Tagline</label>
                <textarea className="input" rows={3} value={repForm.bio} onChange={(e) => updateRepField("bio", e.target.value)} placeholder="Short personal intro or trust-building line." />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Mobile phone</label>
                    <input className="input" value={repForm.phone} onChange={(e) => updateRepField("phone", e.target.value)} placeholder="(555) 555-5555" />
                  </div>
                  <div>
                    <label className="label">Office phone</label>
                    <input className="input" value={repForm.officePhone} onChange={(e) => updateRepField("officePhone", e.target.value)} placeholder="(952) 555-5555" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" value={repForm.email} onChange={(e) => updateRepField("email", e.target.value)} placeholder="name@company.com" />
                  </div>
                  <div>
                    <label className="label">Booking link</label>
                    <input className="input" type="url" value={repForm.calLink} onChange={(e) => updateRepField("calLink", e.target.value)} placeholder="https://calendly.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="label">Website label</label>
                    <input className="input" value={repForm.websiteLabel} onChange={(e) => updateRepField("websiteLabel", e.target.value)} placeholder="www.company.com" />
                  </div>
                  <div>
                    <label className="label">Website URL</label>
                    <input className="input" type="url" value={repForm.websiteUrl} onChange={(e) => updateRepField("websiteUrl", e.target.value)} placeholder="https://www.company.com" />
                  </div>
                </div>

                <label className="label mt-3">Office address</label>
                <textarea className="input" rows={3} value={repForm.address} onChange={(e) => updateRepField("address", e.target.value)} placeholder={"10201 Wayzata Blvd #130\nMinnetonka, MN 55305"} />

                <p className="text-slate-500 text-xs mt-2">
                  This fills each rep&apos;s business card while the sections below stay reusable as the shared template.
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
                <label className="label mt-3">Default website label</label>
                <input className="input" value={data.websiteLabel} onChange={(e) => update("websiteLabel", e.target.value)} placeholder="www.mcgeerestoration.com" />
                <label className="label mt-3">Default website URL</label>
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
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-[0.18em]">Preview</p>
                  <p className="text-slate-500 text-xs mt-1">Shared template plus the selected rep&apos;s business card details.</p>
                </div>
                {selectedRepId ? (
                  <a href={`/r/${selectedRepId}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs">
                    Open live page
                  </a>
                ) : null}
              </div>

              <RepLandingExperience rep={previewRep} template={data} previewMode />

              <div style={{ marginTop: "16px", padding: "14px 16px", borderRadius: "10px", background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                <p style={{ color: "#fb923c", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                  Shared template behavior
                </p>
                <p style={{ color: "#94a3b8", fontSize: "12px", lineHeight: 1.6 }}>
                  Every rep page uses this template, then fills in the selected rep&apos;s own business card info. Use the Reps page for slot activation and tag assignment.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
