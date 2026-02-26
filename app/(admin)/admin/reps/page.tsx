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
  const [reps, setReps] = useState<Rep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reps?stats=true")
      .then((r) => r.json())
      .then((d) => { setReps(d.reps ?? []); setLoading(false); });
  }, []);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <AdminShell>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reps</h1>
            <p className="text-slate-400 text-sm mt-1">{reps.length} total</p>
          </div>
          <Link href="/admin/reps/new" className="btn-primary">+ Add Rep</Link>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {reps.map((rep) => (
              <div key={rep.id} className="card flex items-center gap-5">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg flex-shrink-0">
                  {rep.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-semibold">{rep.name}</h3>
                    {!rep.isActive && <span className="badge bg-red-900/50 text-red-400">Inactive</span>}
                  </div>
                  <p className="text-slate-400 text-sm">{rep.title ?? "Rep"} {rep.email ? `· ${rep.email}` : ""} {rep.phone ? `· ${rep.phone}` : ""}</p>
                  <p className="text-slate-600 text-xs mt-1 font-mono">{baseUrl}/r/{rep.id}</p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-center">
                  <div>
                    <p className="text-white font-bold text-lg">{rep.stats.taps}</p>
                    <p className="text-slate-500 text-xs">Taps</p>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{rep.stats.leads}</p>
                    <p className="text-slate-500 text-xs">Leads</p>
                  </div>
                  <div>
                    <p className="text-orange-400 font-bold text-lg">{rep.stats.conversionRate}%</p>
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

            {reps.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-slate-400 mb-4">No reps yet.</p>
                <Link href="/admin/reps/new" className="btn-primary">Create First Rep</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
