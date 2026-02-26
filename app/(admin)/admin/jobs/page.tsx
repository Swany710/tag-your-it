"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

interface Job {
  id: string;
  jobNumber: string | null;
  homeownerName: string;
  address: string;
  city: string | null;
  state: string | null;
  completionDate: string | null;
  shingleType: string | null;
  shingleColor: string | null;
  warrantyYears: number | null;
  tags: { id: string }[];
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    homeownerName: "", address: "", city: "", state: "", zip: "",
    phone: "", email: "", completionDate: "", shingleType: "",
    shingleColor: "", manufacturer: "", warrantyYears: "", jobNumber: "",
  });

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((d) => { setJobs(d.jobs ?? []); setLoading(false); });
  }, []);

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setJobs((j) => [{ ...data.job, tags: [] }, ...j]);
      setShowNew(false);
      setForm({ homeownerName: "", address: "", city: "", state: "", zip: "", phone: "", email: "", completionDate: "", shingleType: "", shingleColor: "", manufacturer: "", warrantyYears: "", jobNumber: "" });
    }
    setSaving(false);
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Completions</h1>
            <p className="text-slate-400 text-sm mt-1">{jobs.length} jobs recorded · Each gets a permanent NFC plaque</p>
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary">+ Add Job</button>
        </div>

        {showNew && (
          <div className="card mb-6 border-orange-500/50">
            <h3 className="text-white font-semibold mb-5">New Job Completion</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Job Number</label>
                <input className="input" value={form.jobNumber} onChange={(e) => update("jobNumber", e.target.value)} placeholder="JOB-001" />
              </div>
              <div>
                <label className="label">Homeowner Name *</label>
                <input className="input" value={form.homeownerName} onChange={(e) => update("homeownerName", e.target.value)} required />
              </div>
              <div className="col-span-2">
                <label className="label">Property Address *</label>
                <input className="input" value={form.address} onChange={(e) => update("address", e.target.value)} required />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div>
                <label className="label">State</label>
                <input className="input" value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="MN" />
              </div>
              <div>
                <label className="label">Completion Date</label>
                <input type="date" className="input" value={form.completionDate} onChange={(e) => update("completionDate", e.target.value)} />
              </div>
              <div>
                <label className="label">Warranty (years)</label>
                <input type="number" className="input" value={form.warrantyYears} onChange={(e) => update("warrantyYears", e.target.value)} placeholder="25" />
              </div>
              <div>
                <label className="label">Shingle Type</label>
                <input className="input" value={form.shingleType} onChange={(e) => update("shingleType", e.target.value)} placeholder="Architectural" />
              </div>
              <div>
                <label className="label">Shingle Color</label>
                <input className="input" value={form.shingleColor} onChange={(e) => update("shingleColor", e.target.value)} placeholder="Weathered Wood" />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Job"}</button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-slate-400 text-sm">Loading jobs...</div>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <div key={job.id} className="card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0">🏠</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{job.homeownerName}</p>
                    {job.jobNumber && <span className="text-slate-500 text-xs font-mono">#{job.jobNumber}</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{job.address}{job.city ? `, ${job.city}` : ""}{job.state ? ` ${job.state}` : ""}</p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {job.shingleType ?? "—"} · {job.shingleColor ?? "—"} · {job.warrantyYears ? `${job.warrantyYears}yr warranty` : "—"}
                    {job.completionDate ? ` · ${new Date(job.completionDate).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-orange-400 font-mono text-xs">{baseUrl}/job/{job.id}</p>
                  <p className="text-slate-600 text-xs mt-1">{job.tags.length} tag{job.tags.length !== 1 ? "s" : ""} linked</p>
                </div>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-slate-400 mb-2">No jobs yet.</p>
                <p className="text-slate-600 text-sm">Add a job completion record and link it to an NFC plaque.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
