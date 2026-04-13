"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

interface Rep {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  title: string | null;
  isActive: boolean;
  stats: { taps: number; leads: number; conversionRate: string };
}

export default function RepsPage() {
  const [reps, setReps]       = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"all" | "active" | "inactive">("all");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    fetch("/api/reps?stats=true")
      .then((r) => r.json())
      .then((d) => { setReps(d.reps ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = reps.filter((r) => {
    if (filter === "active")   return r.isActive;
    if (filter === "inactive") return !r.isActive;
    return true;
  });

  const activeCount   = reps.filter((r) => r.isActive).length;
  const inactiveCount = reps.filter((r) => !r.isActive).length;

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reps</h1>
            <p className="text-slate-400 text-sm mt-1">
              {activeCount} active · {inactiveCount} unassigned · {reps.length} total slots
            </p>
          </div>
          <Link href="/admin/reps/new" className="btn-primary">+ Add Rep</Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f
                  ? "bg-orange-500 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading reps...</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((rep) => (
              <div key={rep.id} className="card flex items-center gap-4">

                {/* Avatar + status */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg">
                    {rep.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${rep.isActive ? "bg-green-400" : "bg-slate-600"}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{rep.name}</h3>
                    <span className="text-slate-600 text-xs font-mono">#{rep.id}</span>
                  </div>
                  <p className="text-slate-400 text-sm truncate">
                    {rep.title ?? "Rep"}
                    {rep.email ? ` · ${rep.email}` : ""}
                    {rep.phone ? ` · ${rep.phone}` : ""}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5 font-mono">{baseUrl}/r/{rep.id}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-white font-bold">{rep.stats.taps}</p>
                    <p className="text-slate-500 text-xs">Taps</p>
                  </div>
                  <div>
                    <p className="text-white font-bold">{rep.stats.leads}</p>
                    <p className="text-slate-500 text-xs">Leads</p>
                  </div>
                  <div>
                    <p className="text-orange-400 font-bold">{rep.stats.conversionRate}%</p>
                    <p className="text-slate-500 text-xs">Conv.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`/r/${rep.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Preview
                  </a>
                  <Link href={`/admin/reps/${rep.id}`} className="btn-primary text-xs py-1.5 px-3">
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-slate-400 mb-3">No reps in this filter.</p>
                <Link href="/admin/reps/new" className="btn-primary">Create a Rep</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
