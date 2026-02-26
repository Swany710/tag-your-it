"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

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
  isActive: boolean;
}

export default function EditRepPage() {
  const params = useParams();
  const router = useRouter();
  const [rep, setRep] = useState<Rep | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/reps/${params.id}`)
      .then((r) => r.json())
      .then((d) => setRep(d.rep));
  }, [params.id]);

  function update(key: string, val: string | boolean) {
    setRep((r) => r ? { ...r, [key]: val } : r);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!rep) return;
    setSaving(true);
    setError("");
    setSuccess(false);

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
    if (!rep || !confirm("Deactivate this rep? Their NFC page will show as inactive.")) return;
    const res = await fetch(`/api/reps/${rep.id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/reps");
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (!rep) return (
    <AdminShell>
      <div className="p-8 text-slate-400 text-sm">Loading...</div>
    </AdminShell>
  );

  return (
    <AdminShell>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/reps" className="text-slate-400 hover:text-white">← Reps</Link>
          <h1 className="text-2xl font-bold text-white">Rep #{rep.id} — {rep.name}</h1>
        </div>

        {/* NFC URL pill */}
        <div className="card mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-lg">📡</span>
          </div>
          <div className="flex-1">
            <p className="text-slate-400 text-xs mb-0.5">NFC Tag URL</p>
            <p className="text-white font-mono text-sm">{baseUrl}/r/{rep.id}</p>
          </div>
          <a href={`/r/${rep.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs py-1.5 px-3">Preview ↗</a>
        </div>

        <form onSubmit={handleSave} className="card space-y-5">
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}
          {success && <div className="bg-green-900/50 border border-green-700 text-green-300 text-sm rounded-lg px-3 py-2">Saved successfully.</div>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={rep.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" value={rep.title ?? ""} onChange={(e) => update("title", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" value={rep.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={rep.email ?? ""} onChange={(e) => update("email", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Company</label>
            <input className="input" value={rep.company ?? ""} onChange={(e) => update("company", e.target.value)} />
          </div>

          <div>
            <label className="label">Bio</label>
            <textarea className="input" rows={3} value={rep.bio ?? ""} onChange={(e) => update("bio", e.target.value)} />
          </div>

          <div>
            <label className="label">Photo URL</label>
            <input className="input" value={rep.photoUrl ?? ""} onChange={(e) => update("photoUrl", e.target.value)} />
          </div>

          <div>
            <label className="label">Calendar / Booking Link</label>
            <input className="input" value={rep.calLink ?? ""} onChange={(e) => update("calLink", e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={rep.isActive}
              onChange={(e) => update("isActive", e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <label htmlFor="isActive" className="text-white text-sm">Active (tag is live)</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
            <button type="button" onClick={handleDeactivate} className="btn-danger">Deactivate</button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
