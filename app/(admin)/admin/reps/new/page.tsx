"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

export default function NewRepPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    title: "",
    company: "",
    bio: "",
    photoUrl: "",
    calLink: "",
  });

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/reps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: Number(form.id) }),
    });

    if (res.ok) {
      router.push("/admin/reps");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create rep.");
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/reps" className="text-slate-400 hover:text-white">← Back</Link>
          <h1 className="text-2xl font-bold text-white">New Rep</h1>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Rep ID (number) *</label>
              <input
                type="number"
                className="input"
                value={form.id}
                onChange={(e) => update("id", e.target.value)}
                placeholder="1"
                min={1}
                required
              />
              <p className="text-slate-500 text-xs mt-1">This maps to /r/1 on the NFC tag URL</p>
            </div>
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="John Smith" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="555-555-5555" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="john@company.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Project Manager" />
            </div>
            <div>
              <label className="label">Company</label>
              <input className="input" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Swany Roofing" />
            </div>
          </div>

          <div>
            <label className="label">Bio / Tagline</label>
            <textarea className="input" rows={2} value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="5+ years helping homeowners get fair insurance claims..." />
          </div>

          <div>
            <label className="label">Photo URL</label>
            <input className="input" value={form.photoUrl} onChange={(e) => update("photoUrl", e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="label">Booking / Calendar Link</label>
            <input className="input" value={form.calLink} onChange={(e) => update("calLink", e.target.value)} placeholder="https://calendly.com/..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Creating..." : "Create Rep"}
            </button>
            <Link href="/admin/reps" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
