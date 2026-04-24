"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import Link from "next/link";

interface Stats {
  summary: { taps: number; views: number; submits: number; conversionRate: string };
  dailyChart: { date: string; count: number }[];
}
interface Lead {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  createdAt: string;
  rep: { name: string };
}
interface RepStat {
  id: number;
  name: string;
  isActive: boolean;
  stats: { taps: number; leads: number; conversionRate: string };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [reps, setReps] = useState<RepStat[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [evData, leadData, repData] = await Promise.all([
          getJson<Stats>("/api/events?days=30"),
          getJson<{ leads?: Lead[]; total?: number }>("/api/leads?limit=5"),
          getJson<{ reps?: RepStat[] }>("/api/reps?stats=true"),
        ]);

        if (cancelled) return;

        setStats(evData);
        setRecentLeads(Array.isArray(leadData.leads) ? leadData.leads : []);
        setTotalLeads(typeof leadData.total === "number" ? leadData.total : 0);

        const activeReps = (Array.isArray(repData.reps) ? repData.reps : []).filter(
          (rep) => rep.isActive && rep.stats && rep.stats.taps > 0
        );
        setReps(activeReps);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load admin dashboard.");
          setStats(null);
          setRecentLeads([]);
          setReps([]);
          setTotalLeads(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = stats?.summary;
  const dailyChart = Array.isArray(stats?.dailyChart) ? stats!.dailyChart : [];

  return (
    <AdminShell>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Last 30 days</p>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading stats...</div>
        ) : error ? (
          <div className="card">
            <p className="text-red-300 font-medium mb-2">Admin data could not be loaded.</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <Link href="/admin/login" className="btn-primary inline-block">
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Total Taps" value={summary?.taps ?? 0} color="orange" />
              <KpiCard label="Total Leads" value={totalLeads} color="blue" />
              <KpiCard label="Form Submits" value={summary?.submits ?? 0} color="green" />
              <KpiCard label="Conversion Rate" value={`${summary?.conversionRate ?? 0}%`} color="purple" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Rep Leaderboard</h2>
                  <Link href="/admin/reps" className="text-orange-400 text-sm hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {reps.map((rep, i) => (
                    <div key={rep.id} className="flex items-center gap-3">
                      <span className="text-slate-600 text-sm w-4">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                        {rep.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{rep.name}</p>
                        <p className="text-slate-500 text-xs">{rep.stats.taps} taps · {rep.stats.leads} leads</p>
                      </div>
                      <span className="text-orange-400 text-sm font-bold">{rep.stats.conversionRate}%</span>
                    </div>
                  ))}
                  {reps.length === 0 && (
                    <p className="text-slate-500 text-sm">
                      No taps yet. <Link href="/admin/reps" className="text-orange-400 hover:underline">Configure your reps →</Link>
                    </p>
                  )}
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Recent Leads</h2>
                  <Link href="/admin/leads" className="text-orange-400 text-sm hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-slate-500 text-xs">
                          via {lead.rep?.name ?? "Unknown rep"} · {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusBadge status={lead.status} />
                    </div>
                  ))}
                  {recentLeads.length === 0 && (
                    <p className="text-slate-500 text-sm">No leads yet. Deploy your tags to start collecting.</p>
                  )}
                </div>
              </div>
            </div>

            {dailyChart.length > 0 && (
              <div className="card mb-6">
                <h2 className="font-semibold text-white mb-4">Daily Taps (30 days)</h2>
                <div className="flex items-end gap-1 h-24">
                  {dailyChart.slice(-30).map((d) => {
                    const max = Math.max(...dailyChart.map((x) => x.count), 1);
                    const pct = (d.count / max) * 100;
                    return (
                      <div key={d.date} className="flex-1 relative group">
                        <div
                          className="w-full bg-orange-500/60 hover:bg-orange-500 rounded-t transition-colors"
                          style={{ height: `${pct}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                        />
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
                          {d.date}: {d.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card mb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold text-white">Rep Landing Page Template</h2>
                  <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                    Edit the shared copy and branding for every rep page. Each rep still uses their own name, phone, email, title, company, and booking link.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/admin/rep-landing" className="btn-primary">
                    Edit template
                  </Link>
                  <Link href="/admin/reps" className="btn-secondary">
                    Open reps
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Link href="/admin/reps/new" className="card hover:border-orange-500/50 transition-colors text-center py-5 cursor-pointer">
                <div className="text-2xl mb-2">➕</div>
                <div className="text-sm font-medium text-white">Add Rep</div>
              </Link>
              <Link href="/admin/rep-landing" className="card hover:border-amber-500/50 transition-colors text-center py-5 cursor-pointer">
                <div className="text-2xl mb-2">📱</div>
                <div className="text-sm font-medium text-white">Rep Landing</div>
              </Link>
              <Link href="/admin/leads" className="card hover:border-blue-500/50 transition-colors text-center py-5 cursor-pointer">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-sm font-medium text-white">View Leads</div>
              </Link>
              <Link href="/admin/tags" className="card hover:border-green-500/50 transition-colors text-center py-5 cursor-pointer">
                <div className="text-2xl mb-2">🏷️</div>
                <div className="text-sm font-medium text-white">Manage Tags</div>
              </Link>
              <Link href="/admin/jobs" className="card hover:border-purple-500/50 transition-colors text-center py-5 cursor-pointer">
                <div className="text-2xl mb-2">🏠</div>
                <div className="text-sm font-medium text-white">Job Records</div>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    orange: "text-orange-400",
    blue: "text-blue-400",
    green: "text-green-400",
    purple: "text-purple-400",
  };
  return (
    <div className="card">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    NEW: "badge-new",
    CONTACTED: "badge-contacted",
    INSPECTION_BOOKED: "badge-booked",
    WON: "badge-won",
    LOST: "badge-lost",
  };
  return <span className={`badge ${map[status] ?? "badge-new"}`}>{status.replace(/_/g, " ")}</span>;
}
