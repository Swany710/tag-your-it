"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface AnalyticsData {
  summary: { taps: number; views: number; submits: number; conversionRate: string };
  byRep: { repId: number; type: string; _count: number }[];
  dailyChart: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData]         = useState<AnalyticsData | null>(null);
  const [days, setDays]         = useState(30);
  const [loading, setLoading]   = useState(true);
  const [resetting, setResetting] = useState(false);

  function loadData(d: number) {
    setLoading(true);
    fetch(`/api/events?days=${d}`)
      .then((r) => r.json())
      .then((payload) => { setData(payload); setLoading(false); })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadData(days); }, [days]);

  async function handleReset() {
    if (!confirm("Reset ALL tracking data?\n\nThis permanently deletes every tap, view, and submit event. This cannot be undone.")) return;
    setResetting(true);
    await fetch("/api/events", { method: "DELETE" });
    setResetting(false);
    loadData(days);
  }

  // Build per-rep map
  const repMap: Record<number, Record<string, number>> = {};
  if (data) {
    for (const item of data.byRep) {
      if (!repMap[item.repId]) repMap[item.repId] = {};
      repMap[item.repId][item.type] = item._count;
    }
  }
  const repIds = Object.keys(repMap).map(Number);

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl mx-auto">

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1c1917" }}>Analytics</h1>
            <p className="text-sm mt-1" style={{ color: "#78716c" }}>NFC tap performance</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {[7, 14, 30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: days === d ? "2px solid #f97316" : "2px solid #d6d0c8",
                    background: days === d ? "#f97316" : "#ffffff",
                    color: days === d ? "#ffffff" : "#57534e",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {d}d
                </button>
              ))}
            </div>
            <button
              onClick={handleReset}
              disabled={resetting || loading}
              style={{
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 700,
                borderRadius: "8px",
                border: "2px solid rgba(239,68,68,0.4)",
                background: "rgba(239,68,68,0.06)",
                color: "#dc2626",
                cursor: "pointer",
                opacity: resetting ? 0.6 : 1,
                transition: "all 0.15s",
              }}
            >
              {resetting ? "Resetting…" : "🗑 Reset Tracking"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm" style={{ color: "#a8a29e" }}>Loading analytics...</div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Taps"        value={data.summary.taps}                  sub={`last ${days}d`} />
              <StatCard label="Page Views"  value={data.summary.views}                 sub={`last ${days}d`} />
              <StatCard label="Submits"     value={data.summary.submits}               sub={`last ${days}d`} />
              <StatCard label="Conversion"  value={`${data.summary.conversionRate}%`}  sub="tap → submit" highlight />
            </div>

            {/* Daily chart */}
            <div className="card mb-6">
              <h2 className="font-semibold mb-4" style={{ color: "#1c1917" }}>Daily Taps</h2>
              {data.dailyChart.length === 0 ? (
                <p className="text-sm" style={{ color: "#a8a29e" }}>No taps recorded in this window.</p>
              ) : (
                <>
                  <div className="flex items-end gap-0.5 mb-2" style={{ height: "128px" }}>
                    {data.dailyChart.map((d) => {
                      const max = Math.max(...data.dailyChart.map((x) => x.count), 1);
                      const pct = (d.count / max) * 100;
                      return (
                        <div key={d.date} title={`${d.date}: ${d.count}`} className="flex-1 relative group">
                          <div
                            className="w-full rounded-t cursor-default transition-colors"
                            style={{ height: `${pct}%`, minHeight: d.count > 0 ? "3px" : "0", background: "rgba(249,115,22,0.65)" }}
                          />
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block text-xs px-2 py-1 rounded whitespace-nowrap z-10" style={{ background: "#1c1917", color: "#ffffff", border: "1px solid #44403c" }}>
                            {d.date}: {d.count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "#a8a29e" }}>
                    <span>{data.dailyChart[0]?.date}</span>
                    <span>{data.dailyChart[data.dailyChart.length - 1]?.date}</span>
                  </div>
                </>
              )}
            </div>

            {/* Per-rep breakdown */}
            {repIds.length > 0 && (
              <div className="card">
                <h2 className="font-semibold mb-4" style={{ color: "#1c1917" }}>Per-Rep Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left" style={{ color: "#78716c", borderBottom: "1px solid #e7e3dc" }}>
                        <th className="pb-3 pr-6">Rep</th>
                        <th className="pb-3 pr-6">Taps</th>
                        <th className="pb-3 pr-6">Views</th>
                        <th className="pb-3 pr-6">Submits</th>
                        <th className="pb-3">Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repIds.map((repId) => {
                        const r       = repMap[repId];
                        const taps    = r["TAP"]    ?? 0;
                        const views   = r["VIEW"]   ?? 0;
                        const submits = r["SUBMIT"] ?? 0;
                        const conv    = taps > 0 ? ((submits / taps) * 100).toFixed(1) : "0";
                        return (
                          <tr key={repId} style={{ borderBottom: "1px solid #ede9e3", color: "#1c1917" }}>
                            <td className="py-3 pr-6 font-mono font-semibold" style={{ color: "#f97316" }}>Rep #{repId}</td>
                            <td className="py-3 pr-6">{taps}</td>
                            <td className="py-3 pr-6">{views}</td>
                            <td className="py-3 pr-6">{submits}</td>
                            <td className="py-3 font-bold" style={{ color: "#f97316" }}>{conv}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500 text-sm">No data available.</p>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub: string; highlight?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#78716c" }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color: highlight ? "#f97316" : "#1c1917" }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: "#a8a29e" }}>{sub}</p>
    </div>
  );
}
