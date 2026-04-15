"use client";

import { useEffect, useMemo, useState } from "react";

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

const TRUST_BADGES = ["GAF Master Elite", "A+ Rated", "Free Inspection"];
const VALUE_POINTS = [
  "Storm damage and insurance claim guidance",
  "Fast roof, siding, and exterior inspections",
  "Clear next steps with no pressure",
];

export default function RepLandingClient({ rep }: { rep: Rep }) {
  const [step, setStep] = useState<Step>("profile");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const businessName = rep.company?.trim() || "McGee Restoration";
  const roleLabel = rep.title?.trim() || "Exterior Restoration Specialist";
  const initials = useMemo(
    () =>
      rep.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    [rep.name]
  );

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
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "VIEW", meta: { section: "inspection-form" } }),
    }).catch(() => {});
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
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${rep.name}`,
      `TITLE:${roleLabel}`,
      rep.phone ? `TEL:${rep.phone}` : "",
      rep.email ? `EMAIL:${rep.email}` : "",
      businessName ? `ORG:${businessName}` : "",
      "END:VCARD",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${rep.name.replace(/ /g, "_")}.vcf`;
    link.click();
    URL.revokeObjectURL(url);

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "CONTACT_SAVE" }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.22),_transparent_30%),radial-gradient(circle_at_top_left,_rgba(249,115,22,0.14),_transparent_28%),linear-gradient(180deg,_#0f172a_0%,_#0b1220_48%,_#111827_100%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(90deg,rgba(245,158,11,0.18),rgba(249,115,22,0.08),transparent)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-10 lg:px-8 lg:py-10">
          <section className="w-full lg:w-[58%]">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Trusted Local Restoration Team
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur md:p-7">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-200/80">{businessName}</p>
                  <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight text-white md:text-5xl">
                    Meet your dedicated restoration rep.
                  </h1>
                  <p className="mt-3 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                    Fast inspections, honest guidance, and a clean path from storm damage to completed work.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {TRUST_BADGES.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-white/10 bg-slate-950/55 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-white/8 bg-[#101826] p-5">
                  <div className="flex items-center gap-4">
                    {rep.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={rep.photoUrl}
                        alt={rep.name}
                        className="h-20 w-20 rounded-2xl border border-amber-300/30 object-cover shadow-lg shadow-black/30"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-500/80 to-orange-700 text-2xl font-black text-white shadow-lg shadow-black/30">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-white">{rep.name}</p>
                      <p className="mt-1 text-sm font-medium text-amber-200">{roleLabel}</p>
                      <p className="mt-1 text-sm text-slate-400">Serving homeowners with roofing, siding, and exterior restoration support.</p>
                    </div>
                  </div>

                  {rep.bio && (
                    <p className="mt-5 text-sm leading-7 text-slate-300">
                      {rep.bio}
                    </p>
                  )}

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {rep.phone && (
                      <a
                        href={`tel:${rep.phone}`}
                        className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/35 hover:bg-amber-300/10"
                      >
                        Call
                      </a>
                    )}
                    {rep.phone && (
                      <a
                        href={`sms:${rep.phone}`}
                        className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/35 hover:bg-amber-300/10"
                      >
                        Text
                      </a>
                    )}
                    {rep.email && (
                      <a
                        href={`mailto:${rep.email}`}
                        className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/35 hover:bg-amber-300/10"
                      >
                        Email
                      </a>
                    )}
                  </div>

                  <button
                    onClick={downloadContact}
                    className="mt-3 w-full rounded-2xl border border-amber-300/40 bg-transparent px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10"
                  >
                    Save Contact Card
                  </button>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(15,23,42,0.3))] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/90">Why Homeowners Choose {businessName}</p>
                  <ul className="mt-4 space-y-3">
                    {VALUE_POINTS.map((point) => (
                      <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                        <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-[11px] font-bold text-amber-200">
                          ✓
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 rounded-2xl border border-white/8 bg-slate-950/55 p-4">
                    <p className="text-lg font-bold text-white">Need a roof inspection or storm assessment?</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Start with a quick conversation and we will help you understand what is going on, what insurance may cover, and what the next step should be.
                    </p>

                    {step === "profile" && (
                      <div className="mt-5 space-y-3">
                        {rep.calLink ? (
                          <a
                            href={rep.calLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 px-4 py-3 text-center text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition hover:brightness-105"
                          >
                            Book Free Inspection
                          </a>
                        ) : (
                          <button
                            onClick={openForm}
                            className="block w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition hover:brightness-105"
                          >
                            Request Free Inspection
                          </button>
                        )}
                        <p className="text-center text-xs text-slate-400">No pressure. Just expert guidance and a fast response.</p>
                      </div>
                    )}

                    {step === "form" && (
                      <div className="mt-5">
                        <div className="mb-4 flex items-center gap-2">
                          <button onClick={() => setStep("profile")} className="text-sm font-medium text-slate-400 transition hover:text-white">
                            Back
                          </button>
                          <span className="text-slate-700">/</span>
                          <p className="text-sm font-semibold text-white">Tell us a little about your property</p>
                        </div>

                        {error && (
                          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-900/30 px-3 py-2 text-xs text-red-200">
                            {error}
                          </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-3">
                          <input
                            className="input text-sm"
                            placeholder="Your name *"
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            required
                            autoFocus
                          />
                          <input
                            className="input text-sm"
                            placeholder="Phone number"
                            type="tel"
                            value={form.phone}
                            onChange={(e) => update("phone", e.target.value)}
                          />
                          <input
                            className="input text-sm"
                            placeholder="Email address"
                            type="email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                          />
                          <input
                            className="input text-sm"
                            placeholder="Property address"
                            value={form.address}
                            onChange={(e) => update("address", e.target.value)}
                          />
                          <textarea
                            className="input resize-none text-sm"
                            rows={3}
                            placeholder="Briefly describe what you are seeing: hail, leaks, missing shingles, siding damage, and so on."
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {submitting ? "Sending Request..." : "Send Inspection Request"}
                          </button>
                        </form>
                      </div>
                    )}

                    {step === "success" && (
                      <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-950/30 p-5 text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">Request Received</p>
                        <h2 className="mt-2 text-2xl font-bold text-white">Thanks. We have you covered.</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {rep.name} will follow up shortly to help schedule your free inspection and walk you through the next steps.
                        </p>
                        {rep.phone && (
                          <a
                            href={`tel:${rep.phone}`}
                            className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-amber-300/35 hover:bg-amber-300/10"
                          >
                            Call {rep.phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="w-full lg:w-[42%]">
            <div className="rounded-[28px] border border-white/10 bg-[#101826]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/90">What To Expect</p>
              <div className="mt-5 space-y-4">
                {[
                  "Reach out directly to your rep by call, text, or email.",
                  "Request an inspection for storm, roof, or exterior concerns.",
                  "Get a clear follow-up plan without chasing multiple contractors.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-sm font-bold text-amber-200">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                <p className="text-sm font-semibold text-white">Working with {rep.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  You are not landing on a generic company card. This page is tied to {rep.name}'s NFC card so your request is tracked directly to their follow-up and performance.
                </p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-slate-600">
              Powered by Tap System
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
