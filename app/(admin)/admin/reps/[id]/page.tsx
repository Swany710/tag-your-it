"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import RepLandingExperience, { type RepLandingRep } from "@/components/reps/RepLandingExperience";
import {
  DEFAULT_REP_LANDING_TEMPLATE,
  normalizeRepLandingTemplate,
  type RepLandingTemplateData,
} from "@/lib/repLandingTemplate";

type EditableRep = RepLandingRep & {
  isActive: boolean;
};

export default function EditRepPage() {
  const params = useParams();
  const router = useRouter();
  const [rep, setRep] = useState<EditableRep | null>(null);
  const [template, setTemplate] = useState<RepLandingTemplateData>(DEFAULT_REP_LANDING_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    Promise.all([
      fetch(`/api/reps/${params.id}`).then((r) => r.json()),
      fetch("/api/rep-landing-page").then((r) => r.json()).catch(() => ({ page: null })),
    ])
      .then(([repPayload, templatePayload]) => {
        setRep(repPayload.rep ?? null);
        setTemplate(normalizeRepLandingTemplate(templatePayload?.page));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  function update(key: keyof EditableRep, value: string | boolean) {
    setRep((current) => (current ? { ...current, [key]: value } : current));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!rep) return;

    setSaving(true);
    setError("");

    const res = await fetch(`/api/reps/${rep.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rep),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save.");
    }

    setSaving(false);
  }

  async function handleDeactivate() {
    if (!rep || !confirm("Deactivate this rep? Their NFC page will go offline.")) return;
    const res = await fetch(`/api/reps/${rep.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/reps");
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="p-8 text-slate-400 text-sm">Loading...</div>
      </AdminShell>
    );
  }

  if (!rep) {
    return (
      <AdminShell>
        <div className="p-8 text-red-400 text-sm">Rep not found.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/reps" className="text-slate-400 hover:text-white text-sm">
            Back to reps
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-xl font-bold text-white">
            Rep #{rep.id} | {rep.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px] gap-6 items-start">
          <div className="space-y-5">
            <div className="card flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs mb-0.5">NFC Tag URL</p>
                <p className="text-white font-mono text-sm break-all">{baseUrl}/r/{rep.id}</p>
              </div>
              <a
                href={`/r/${rep.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                Open live page
              </a>
            </div>

            <div className="card flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-white text-sm font-medium">Shared landing copy and logo live in the template editor.</p>
                <p className="text-slate-400 text-xs mt-1">
                  Use this page for this rep&apos;s own business card details, then use the template editor for shared hero and CTA copy.
                </p>
              </div>
              <Link href="/admin/rep-landing" className="btn-secondary text-xs">
                Edit template
              </Link>
            </div>

            <form onSubmit={handleSave} className="card space-y-5">
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg px-3 py-2">
                  Saved successfully.
                </div>
              )}

              <div>
                <h3 className="text-white font-semibold mb-4">Personal Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={rep.name} onChange={(e) => update("name", e.target.value)} required />
                  </div>
                  <div>
                    <label className="label">Title</label>
                    <input className="input" value={rep.title ?? ""} onChange={(e) => update("title", e.target.value)} placeholder="Exterior Renovation Consultant" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={rep.company ?? ""} onChange={(e) => update("company", e.target.value)} placeholder="AMRG Exteriors" />
                  </div>
                  <div>
                    <label className="label">Headshot URL</label>
                    <input className="input" value={rep.photoUrl ?? ""} onChange={(e) => update("photoUrl", e.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Bio / Tagline</label>
                  <textarea className="input" rows={3} value={rep.bio ?? ""} onChange={(e) => update("bio", e.target.value)} placeholder="Trusted local rep helping homeowners move quickly after storm damage." />
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4">Business Card Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Mobile Phone</label>
                    <input className="input" value={rep.phone ?? ""} onChange={(e) => update("phone", e.target.value)} placeholder="(612) 555-5555" />
                  </div>
                  <div>
                    <label className="label">Office Phone</label>
                    <input className="input" value={rep.officePhone ?? ""} onChange={(e) => update("officePhone", e.target.value)} placeholder="(952) 555-5555" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={rep.email ?? ""} onChange={(e) => update("email", e.target.value)} placeholder="name@company.com" />
                  </div>
                  <div>
                    <label className="label">Calendar / Booking Link</label>
                    <input className="input" value={rep.calLink ?? ""} onChange={(e) => update("calLink", e.target.value)} placeholder="https://calendly.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="label">Website Label</label>
                    <input className="input" value={rep.websiteLabel ?? ""} onChange={(e) => update("websiteLabel", e.target.value)} placeholder="www.mcgeerestoration.com" />
                  </div>
                  <div>
                    <label className="label">Website URL</label>
                    <input className="input" value={rep.websiteUrl ?? ""} onChange={(e) => update("websiteUrl", e.target.value)} placeholder="https://www.mcgeerestoration.com" />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Office Address</label>
                  <textarea className="input" rows={3} value={rep.address ?? ""} onChange={(e) => update("address", e.target.value)} placeholder={"10201 Wayzata Blvd #130\nMinnetonka, MN 55305"} />
                </div>
              </div>

              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={rep.isActive}
                  onChange={(e) => update("isActive", e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <label htmlFor="isActive" className="text-white text-sm">
                  Active | NFC page is live
                </label>
              </div>

              <div className="flex gap-3 pt-1 flex-wrap">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={handleDeactivate} className="btn-danger">
                  Deactivate
                </button>
              </div>
            </form>
          </div>

          <div className="xl:sticky xl:top-20">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-[0.18em]">Rep landing preview</p>
                <p className="text-slate-500 text-xs mt-1">Live preview of this rep&apos;s landing page with your current edits.</p>
              </div>
              <a
                href={`/r/${rep.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                Open full page
              </a>
            </div>

            <RepLandingExperience rep={rep} template={template} previewMode />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
