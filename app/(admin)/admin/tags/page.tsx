"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface Tag {
  id: string;
  uid: string | null;
  label: string | null;
  type: string;
  isLocked: boolean;
  isActive: boolean;
  notes: string | null;
  repId: number | null;
  jobId: string | null;
  rep: { id: number; name: string } | null;
  job: { id: string; homeownerName: string; address: string } | null;
  createdAt: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ uid: "", label: "", type: "REP", repId: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => { setTags(d.tags ?? []); setLoading(false); });
  }, []);

  function getTagUrl(tag: Tag) {
    if (tag.type === "REP" && tag.repId) return `${baseUrl}/r/${tag.repId}`;
    if (tag.type === "JOB" && tag.jobId) return `${baseUrl}/job/${tag.jobId}`;
    return "—";
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, repId: form.repId ? Number(form.repId) : undefined }),
    });
    if (res.ok) {
      const data = await res.json();
      setTags((ts) => [{ ...data.tag, rep: null, job: null }, ...ts]);
      setShowNew(false);
      setForm({ uid: "", label: "", type: "REP", repId: "", notes: "" });
    }
    setSaving(false);
  }

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Tag Inventory</h1>
            <p className="text-slate-400 text-sm mt-1">{tags.length} tags registered</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary">+ Register Tag</button>
        </div>

        {/* New tag form */}
        {showNew && (
          <div className="card mb-6 border-orange-500">
            <h3 className="text-white font-semibold mb-4">Register New Tag</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tag UID (optional)</label>
                <input className="input" value={form.uid} onChange={(e) => setForm((f) => ({ ...f, uid: e.target.value }))} placeholder="Physical chip UID" />
              </div>
              <div>
                <label className="label">Label</label>
                <input className="input" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Rep 1 House Card" />
              </div>
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  <option value="REP">Rep Card</option>
                  <option value="JOB">Job Completion</option>
                  <option value="TRADESHOW">Trade Show</option>
                  <option value="STATIC">Static Info</option>
                </select>
              </div>
              <div>
                <label className="label">Rep ID (if REP type)</label>
                <input type="number" className="input" value={form.repId} onChange={(e) => setForm((f) => ({ ...f, repId: e.target.value }))} placeholder="1" />
              </div>
              <div className="col-span-2">
                <label className="label">Notes</label>
                <input className="input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Which 3D print, trade show, etc." />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Register"}</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm">Loading tags...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-left border-b border-slate-800">
                  <th className="pb-3 pr-6">Label</th>
                  <th className="pb-3 pr-6">Type</th>
                  <th className="pb-3 pr-6">Points To</th>
                  <th className="pb-3 pr-6">URL</th>
                  <th className="pb-3 pr-6">Status</th>
                  <th className="pb-3">UID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tags.map((tag) => (
                  <tr key={tag.id} className="text-white">
                    <td className="py-3 pr-6 font-medium">{tag.label ?? "Unlabeled"}</td>
                    <td className="py-3 pr-6">
                      <span className="badge bg-slate-700 text-slate-300">{tag.type}</span>
                    </td>
                    <td className="py-3 pr-6 text-slate-400">
                      {tag.rep?.name ?? tag.job?.homeownerName ?? "—"}
                    </td>
                    <td className="py-3 pr-6">
                      <a href={getTagUrl(tag)} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline font-mono text-xs">
                        {getTagUrl(tag)}
                      </a>
                    </td>
                    <td className="py-3 pr-6">
                      <span className={`badge ${tag.isLocked ? "bg-purple-900 text-purple-300" : "bg-yellow-900 text-yellow-300"}`}>
                        {tag.isLocked ? "Locked" : "Unlocked"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{tag.uid ?? "—"}</td>
                  </tr>
                ))}
                {tags.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">No tags registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
