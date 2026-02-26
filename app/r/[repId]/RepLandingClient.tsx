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

export default function RepLandingClient({ rep }: { rep: Rep }) {
  const [step, setStep] = useState<Step>("profile");
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Log tap event when page loads
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, type: "TAP", meta: { path: window.location.pathname } }),
    }).catch(() => {});
  }, [rep.id]);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
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

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repId: rep.id, ...form }),
    });

    if (res.ok) {
      setStep("success");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
    }
    setSubmitting(false);
  }

  const initials = rep.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-950 flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-4">
          {/* Header banner */}
          <div className="h-24 bg-gradient-to-br from-orange-500 to-orange-700 relative">
            <div className="absolute -bottom-8 left-5">
              {rep.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={rep.photoUrl}
                  alt={rep.name}
                  className="w-16 h-16 rounded-xl border-4 border-slate-900 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl border-4 border-slate-900 bg-slate-700 flex items-center justify-center text-white font-bold text-xl">
                  {initials}
                </div>
              )}
            </div>
          </div>

          <div className="pt-12 px-5 pb-5">
            <h1 className="text-white font-bold text-xl">{rep.name}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {rep.title ?? "Roofing Specialist"}
              {rep.company ? ` · ${rep.company}` : ""}
            </p>

            {rep.bio && (
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{rep.bio}</p>
            )}

            {/* Contact actions */}
            <div className="flex gap-2 mt-4">
              {rep.phone && (
                <a
                  href={`tel:${rep.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-sm font-medium transition-colors"
                >
                  📞 Call
                </a>
              )}
              {rep.email && (
                <a
                  href={`mailto:${rep.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-sm font-medium transition-colors"
                >
                  ✉️ Email
                </a>
              )}
              {rep.phone && (
                <a
                  href={`sms:${rep.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-sm font-medium transition-colors"
                >
                  💬 Text
                </a>
              )}
            </div>

            {/* Save contact */}
            <button
              onClick={() => {
                const vcard = [
                  "BEGIN:VCARD",
                  "VERSION:3.0",
                  `FN:${rep.name}`,
                  `TITLE:${rep.title ?? "Roofing Specialist"}`,
                  rep.phone ? `TEL:${rep.phone}` : "",
                  rep.email ? `EMAIL:${rep.email}` : "",
                  rep.company ? `ORG:${rep.company}` : "",
                  "END:VCARD",
                ].filter(Boolean).join("\n");

                const blob = new Blob([vcard], { type: "text/vcard" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${rep.name.replace(/ /g, "_")}.vcf`;
                a.click();
                URL.revokeObjectURL(url);

                fetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ repId: rep.id, type: "CONTACT_SAVE" }),
                }).catch(() => {});
              }}
              className="mt-2 w-full py-2.5 border border-orange-500 text-orange-400 hover:bg-orange-500/10 rounded-xl text-sm font-medium transition-colors"
            >
              💾 Save Contact
            </button>
          </div>
        </div>

        {/* CTA Card */}
        {step === "profile" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🏠</div>
              <h2 className="text-white font-bold">Free Roof Inspection</h2>
              <p className="text-slate-400 text-sm mt-1">Check if your roof qualifies for insurance coverage. No cost, no obligation.</p>
            </div>

            {rep.calLink ? (
              <a
                href={rep.calLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center block py-3"
              >
                Book Free Inspection
              </a>
            ) : (
              <button
                onClick={() => setStep("form")}
                className="btn-primary w-full py-3"
              >
                Request Free Inspection →
              </button>
            )}

            {!rep.calLink && (
              <p className="text-slate-600 text-xs text-center mt-2">We&apos;ll reach out within 24 hours</p>
            )}
          </div>
        )}

        {/* Lead Form */}
        {step === "form" && (
          <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep("profile")} className="text-slate-400 hover:text-white">←</button>
              <h2 className="text-white font-bold">Your Info</h2>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 text-xs rounded-lg px-3 py-2 mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  className="input text-sm"
                  placeholder="Your name *"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <input
                  className="input text-sm"
                  placeholder="Phone number"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
              </div>
              <div>
                <input
                  className="input text-sm"
                  placeholder="Email (optional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div>
                <input
                  className="input text-sm"
                  placeholder="Property address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div>
                <textarea
                  className="input text-sm resize-none"
                  rows={2}
                  placeholder="Any details? (hail damage, age of roof, etc.)"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3" disabled={submitting}>
                {submitting ? "Sending..." : "Request Inspection →"}
              </button>
            </form>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="bg-slate-900 border border-green-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-white font-bold text-lg">Got it!</h2>
            <p className="text-slate-400 text-sm mt-2">
              {rep.name} will reach out to you within 24 hours to schedule your free inspection.
            </p>
            {rep.phone && (
              <a href={`tel:${rep.phone}`} className="btn-secondary mt-4 inline-block">
                Call Now: {rep.phone}
              </a>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs mt-6">
          Powered by Tap System
        </p>
      </div>
    </div>
  );
}
