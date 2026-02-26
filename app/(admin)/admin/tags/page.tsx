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
  const [tags, setTags] = useState<Tag[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ uid: "", label: "", type: "REP", repId: "", notes: "" });
  const [saving, setSaving] = useState(false);

  // Redirect URL editing
  const [editingRepId, setEditingRepId] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState("");
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
    });
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

  function startEditRedirect(rep: Rep) {
    setEditingRepId(rep.id);
    setEditUrl(rep.redirectUrl ?? "");
  }

  async function saveRedirect(repId: number) {
    setSavingRedirect(true);
    const url = editUrl.trim();
    const res = await fetch(`/api/reps/${repId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUrl: url || null }),
    });
    if (res.ok) {
      setReps((rs) => rs.map((r) => r.id === repId ? { ...r, redirectUrl: url || null } : r));
    }
    setSavingRedirect(false);
    setEditingRepId(null);
    setEditUrl("");
  }

  async function clearRedirect(repId: number) {
    const res = await fetch(`/api/reps/${repId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUrl: null }),
    });
    if (res.ok) {
      setReps((rs) => rs.map((r) => r.id === repId ? { ...r, redirectUrl: null } : r));
    }
  }

  return (
    <AdminShell>
      <div className="p-8">

        {/* ── Tag Redirect URLs ─────────────────────────────── */}
        <div className="mb-10">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Tag Redirect URLs</h1>
            <p className="text-slate-400 text-sm mt-1">
              Redirect any tap to a custom URL — promotions, deals, landing pages. Clear it to go back to the rep&apos;s profile page.
            </p>
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : (
            <div className="space-y-3">
              {reps.map((rep) => {
                const tapUrl = `${baseUrl}/r/${rep.id}`;
                const isEditing = editingRepId === rep.id;
                const hasRedirect = !!rep.redirectUrl;

                return (
                  <div key={rep.id} className="card" style={{borderColor: hasRedirect ? 'rgba(249,115,22,0.4)' : undefined}}>
                    <div style={{display:'flex', alignItems:'flex-start', gap:'16px', flexWrap:'wrap'}}>

                      {/* Rep info */}
                      <div style={{flex:'0 0 auto', minWidth:'120px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                          <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'rgba(249,115,22,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fb923c', fontWeight:700, fontSize:'13px', flexShrink:0}}>
                            {rep.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{rep.name}</p>
                            <p className="text-slate-500 text-xs">Rep #{rep.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Tap URL (read-only) */}
                      <div style={{flex:'0 0 auto'}}>
                        <p className="text-slate-500 text-xs mb-1">Tap URL (never changes)</p>
                        <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                          <code className="text-orange-400 text-xs font-mono bg-slate-800 px-2 py-1 rounded">{tapUrl}</code>
                          <button
                            onClick={() => navigator.clipboard.writeText(tapUrl)}
                            title="Copy"
                            style={{background:'rgba(100,116,139,0.2)', border:'none', borderRadius:'4px', padding:'4px 6px', cursor:'pointer', color:'#94a3b8', fontSize:'11px'}}
                          >
                            📋
                          </button>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div style={{flex:'0 0 auto', color:'#475569', fontSize:'18px', paddingTop:'18px'}}>→</div>

                      {/* Current destination */}
                      <div style={{flex:'1', minWidth:'200px'}}>
                        <p className="text-slate-500 text-xs mb-1">Currently points to</p>
                        {isEditing ? (
                          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                            <input
                              className="input text-sm"
                              style={{flex:'1', minWidth:'200px'}}
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="https://yoursite.com/deal or leave blank for rep page"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') saveRedirect(rep.id); if (e.key === 'Escape') setEditingRepId(null); }}
                            />
                            <button
                              onClick={() => saveRedirect(rep.id)}
                              disabled={savingRedirect}
                              className="btn-primary text-sm"
                              style={{whiteSpace:'nowrap'}}
                            >
                              {savingRedirect ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingRepId(null)}
                              className="btn-secondary text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap'}}>
                            {hasRedirect ? (
                              <a
                                href={rep.redirectUrl!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:underline text-sm font-mono"
                                style={{wordBreak:'break-all'}}
                              >
                                {rep.redirectUrl}
                              </a>
                            ) : (
                              <span className="text-slate-400 text-sm italic">Rep profile page (default)</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status + Actions */}
                      {!isEditing && (
                        <div style={{flex:'0 0 auto', display:'flex', alignItems:'center', gap:'8px'}}>
                          <span style={{
                            fontSize:'11px', fontWeight:600, padding:'3px 8px', borderRadius:'9999px',
                            background: hasRedirect ? 'rgba(249,115,22,0.15)' : 'rgba(100,116,139,0.2)',
                            color: hasRedirect ? '#fb923c' : '#64748b',
                          }}>
                            {hasRedirect ? '🔀 Redirecting' : '✅ Direct'}
                          </span>
                          <button
                            onClick={() => startEditRedirect(rep)}
                            className="btn-secondary text-xs"
                            style={{padding:'4px 10px'}}
                          >
                            {hasRedirect ? 'Change' : 'Set Redirect'}
                          </button>
                          {hasRedirect && (
                            <button
                              onClick={() => clearRedirect(rep.id)}
                              style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:'6px', padding:'4px 10px', fontSize:'12px', cursor:'pointer'}}
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
              {reps.length === 0 && (
                <p className="text-slate-500 text-sm">No active reps found.</p>
              )}
            </div>
          )}
        </div>

        {/* ── Tag Inventory ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Tag Inventory</h2>
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
