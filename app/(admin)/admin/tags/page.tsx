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

interface Rep {
  id: number;
  name: string;
  isActive: boolean;
  redirectUrl: string | null;
}

export default function TagsPage() {
  const [tags, setTags]   = useState<Tag[]>([]);
  const [reps, setReps]   = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);

  // New tag form
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ uid: "", label: "", type: "REP", repId: "", notes: "" });
  const [saving, setSaving]   = useState(false);

  // Redirect editing
  const [editingRepId, setEditingRepId]   = useState<number | null>(null);
  const [editUrl, setEditUrl]             = useState("");
  const [savingRedirect, setSavingRedirect] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    Promise.all([
      fetch("/api/tags").then((r) => r.json()),
      fetch("/api/reps").then((r) => r.json()),
    ]).then(([tagData, repData]) => {
      setTags(tagData.tags ?? []);
      setReps((repData.reps ?? []).filter((r: Rep) => r.isActive));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  function tagUrl(tag: Tag) {
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

  async function saveRedirect(repId: number) {
    setSavingRedirect(true);
    const url = editUrl.trim();
    const res = await fetch(`/api/reps/${repId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUrl: url || null }),
    });
    if (res.ok) setReps((rs) => rs.map((r) => r.id === repId ? { ...r, redirectUrl: url || null } : r));
    setSavingRedirect(false);
    setEditingRepId(null);
  }

  async function clearRedirect(repId: number) {
    const res = await fetch(`/api/reps/${repId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUrl: null }),
    });
    if (res.ok) setReps((rs) => rs.map((r) => r.id === repId ? { ...r, redirectUrl: null } : r));
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl mx-auto">

        {/* ── Redirect URLs ───────────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-1">Tag Redirect URLs</h1>
          <p className="text-slate-400 text-sm mb-5">
            Override any rep tap to redirect to a custom URL — promotions, deals, landing pages.
          </p>

          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : (
            <div className="space-y-3">
              {reps.map((rep) => {
                const tapUrl    = `${baseUrl}/r/${rep.id}`;
                const isEditing = editingRepId === rep.id;
                const hasRedirect = !!rep.redirectUrl;

                return (
                  <div key={rep.id} className={`card ${hasRedirect ? "border-orange-500/40" : ""}`}>
                    <div className="flex items-center gap-4 flex-wrap">

                      {/* Rep */}
                      <div className="flex items-center gap-2 min-w-[130px]">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                          {rep.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{rep.name}</p>
                          <p className="text-slate-500 text-xs">Rep #{rep.id}</p>
                        </div>
                      </div>

                      {/* Tap URL */}
                      <div className="flex items-center gap-2">
                        <code className="text-orange-400 text-xs font-mono bg-slate-800 px-2 py-1 rounded">{tapUrl}</code>
                        <button
                          onClick={() => navigator.clipboard.writeText(tapUrl)}
                          className="text-slate-500 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>

                      <span className="text-slate-600">→</span>

                      {/* Destination */}
                      <div className="flex-1 min-w-[180px]">
                        {isEditing ? (
                          <div className="flex gap-2 flex-wrap">
                            <input
                              className="input text-sm flex-1 min-w-[200px]"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="https://... (blank = rep profile)"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveRedirect(rep.id);
                                if (e.key === "Escape") setEditingRepId(null);
                              }}
                            />
                            <button onClick={() => saveRedirect(rep.id)} disabled={savingRedirect} className="btn-primary text-sm">
                              {savingRedirect ? "Saving…" : "Save"}
                            </button>
                            <button onClick={() => setEditingRepId(null)} className="btn-secondary text-sm">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            {hasRedirect ? (
                              <a href={rep.redirectUrl!} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline text-sm font-mono break-all">
                                {rep.redirectUrl}
                              </a>
                            ) : (
                              <span className="text-slate-400 text-sm italic">Rep profile (default)</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${hasRedirect ? "bg-orange-500/15 text-orange-400" : "bg-slate-700 text-slate-400"}`}>
                            {hasRedirect ? "🔀 Redirect" : "✅ Direct"}
                          </span>
                          <button
                            onClick={() => { setEditingRepId(rep.id); setEditUrl(rep.redirectUrl ?? ""); }}
                            className="btn-secondary text-xs"
                          >
                            {hasRedirect ? "Change" : "Set Redirect"}
                          </button>
                          {hasRedirect && (
                            <button
                              onClick={() => clearRedirect(rep.id)}
                              className="text-xs px-2 py-1.5 rounded-lg bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 transition-colors"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {reps.length === 0 && <p className="text-slate-500 text-sm">No active reps found.</p>}
            </div>
          )}
        </div>

        {/* ── Tag Inventory ───────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Tag Inventory</h2>
            <p className="text-slate-400 text-sm mt-0.5">{tags.length} tags registered</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary">+ Register Tag</button>
        </div>

        {showNew && (
          <div className="card mb-5 border-orange-500/50">
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
                <input type="number" className="input" value={form.repId} onChange={(e) => setForm((f) => ({ ...f, repId: e.target.value }))} placeholder="1" min={1} max={25} />
              </div>
              <div className="col-span-2">
                <label className="label">Notes</label>
                <input className="input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="e.g. 3D printed house card, trade show batch" />
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
                  <th className="pb-3 pr-4">Label</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Points To</th>
                  <th className="pb-3 pr-4">URL</th>
                  <th className="pb-3">UID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tags.map((tag) => (
                  <tr key={tag.id} className="text-white">
                    <td className="py-3 pr-4 font-medium">{tag.label ?? "Unlabeled"}</td>
                    <td className="py-3 pr-4">
                      <span className="badge bg-slate-700 text-slate-300">{tag.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{tag.rep?.name ?? tag.job?.homeownerName ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <a href={tagUrl(tag)} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline font-mono text-xs">
                        {tagUrl(tag)}
                      </a>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{tag.uid ?? "—"}</td>
                  </tr>
                ))}
                {tags.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">No tags registered.</td>
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
