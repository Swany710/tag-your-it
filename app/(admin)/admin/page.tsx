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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [reps, setReps] = useState<RepStat[]>([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/events?days=30").then((r) => r.json()),
      fetch("/api/leads?limit=5").then((r) => r.json()),
      fetch("/api/reps?stats=true").then((r) => r.json()),
    ]).then(([evData, leadData, repData]) => {
      setStats(evData);
      setRecentLeads(leadData.leads ?? []);
      setTotalLeads(leadData.total ?? 0);
      setReps(repData.reps ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <AdminShell>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Last 30 days</p>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading stats...</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Total Taps" value={stats?.summary.taps ?? 0} color="orange" />
              <KpiCard label="Total Leads" value={totalLeads} color="blue" />
              <KpiCard label="Form Submits" value={stats?.summary.submits ?? 0} color="green" />
              <KpiCard label="Conversion Rate" value={`${stats?.summary.conversionRate ?? 0}%`} color="purple" />
            </div>

            {/* Rep Leaderboard + Recent Leads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Rep Leaderboard */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Rep Performance</h2>
                  <Link href="/admin/reps" className="text-orange-400 text-sm hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {reps.map((rep, i) => (
                    <div key={rep.id} className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">
                        {rep.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{rep.name}</p>
                        <p className="text-slate-500 text-xs">{rep.stats.taps} taps · {rep.stats.leads} leads</p>
                      </div>
                      <span className="text-orange-400 text-sm font-semibold">{rep.stats.conversionRate}%</span>
                    </div>
                  ))}
                  {reps.length === 0 && (
                    <p className="text-slate-500 text-sm">No reps yet. <Link href="/admin/reps" className="text-orange-400 hover:underline">Add one</Link></p>
                  )}
                </div>
              </div>

              {/* Recent Leads */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-white">Recent Leads</h2>
                  <Link href="/admin/leads" className="text-orange-400 text-sm hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {recentLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                        {lead.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{lead.name}</p>
                        <p className="text-slate-500 text-xs">via {lead.rep.name} · {new Date(lead.createdAt).toLocaleDateString()}</p>
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

            {/* Daily tap chart — simple bar */}
            {stats && stats.dailyChart.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Daily Taps (30 days)</h2>
                <div className="flex items-end gap-1 h-24">
                  {stats.dailyChart.slice(-30).map((d) => {
                    const max = Math.max(...stats.dailyChart.map((x) => x.count), 1);
                    const pct = (d.count / max) * 100;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                          className="w-full bg-orange-500/60 hover:bg-orange-500 rounded-t transition-colors cursor-pointer"
                          style={{ height: `${pct}%`, minHeight: d.count > 0 ? "4px" : "0" }}
                        />
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-900 border border-slate-700 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
                          {d.date}: {d.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/admin/reps/new" className="card hover:border-orange-500 transition-colors text-center py-4 cursor-pointer">
                <div className="text-orange-400 text-2xl mb-1">＋</div>
                <div className="text-sm font-medium text-white">Add Rep</div>
              </Link>
              <Link href="/admin/leads" className="card hover:border-orange-500 transition-colors text-center py-4 cursor-pointer">
                <div className="text-blue-400 text-2xl mb-1">📋</div>
                <div className="text-sm font-medium text-white">View Leads</div>
              </Link>
              <Link href="/admin/tags" className="card hover:border-orange-500 transition-colors text-center py-4 cursor-pointer">
                <div className="text-green-400 text-2xl mb-1">🏷️</div>
                <div className="text-sm font-medium text-white">Manage Tags</div>
              </Link>
              <Link href="/admin/jobs" className="card hover:border-orange-500 transition-colors text-center py-4 cursor-pointer">
                <div className="text-purple-400 text-2xl mb-1">🏠</div>
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
  const colorMap: Record<string, string> = {
    orange: "text-orange-400 bg-orange-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    green: "text-green-400 bg-green-400/10",
    purple: "text-purple-400 bg-purple-400/10",
  };

  return (
    <div className="card">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color].split(" ")[0]}`}>{value}</p>
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
  return <span className={`badge ${map[status] ?? "badge-new"}`}>{status.replace("_", " ")}</span>;
}
