"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface AnalyticsData {
  summary: { taps: number; views: number; submits: number; conversionRate: string };
  byRep: { repId: number; type: string; _count: number }[];
  dailyChart: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/events?days=${days}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [days]);

  // Group byRep data
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
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <p className="text-slate-400 text-sm mt-1">NFC tap performance</p>
          </div>
          <div className="flex gap-2">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${days === d ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-slate-400 text-sm">Loading analytics...</div>
        ) : data ? (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Taps" value={data.summary.taps} sub={`last ${days} days`} />
              <StatCard label="Page Views" value={data.summary.views} sub={`last ${days} days`} />
              <StatCard label="Form Submits" value={data.summary.submits} sub={`last ${days} days`} />
              <StatCard label="Conversion" value={`${data.summary.conversionRate}%`} sub="tap → submit" highlight />
            </div>

            {/* Daily chart */}
            <div className="card mb-6">
              <h2 className="font-semibold text-white mb-4">Daily Taps</h2>
              {data.dailyChart.length === 0 ? (
                <p className="text-slate-500 text-sm">No taps yet in this window.</p>
              ) : (
                <div>
                  <div className="flex items-end gap-0.5 h-32 mb-2">
                    {data.dailyChart.map((d) => {
                      const max = Math.max(...data.dailyChart.map((x) => x.count), 1);
                      const pct = (d.count / max) * 100;
                      return (
                        <div key={d.date} title={`${d.date}: ${d.count} taps`} className="group relative flex-1 flex flex-col items-center">
                          <div
                            className="w-full rounded-t bg-orange-500/70 hover:bg-orange-500 cursor-pointer transition-colors"
                            style={{ height: `${pct}%`, minHeight: d.count > 0 ? "3px" : "0" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>{data.dailyChart[0]?.date}</span>
                    <span>{data.dailyChart[data.dailyChart.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Per-rep breakdown */}
            {repIds.length > 0 && (
              <div className="card">
                <h2 className="font-semibold text-white mb-4">Per-Rep Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400 text-left">
                        <th className="pb-3 pr-6">Rep ID</th>
                        <th className="pb-3 pr-6">Taps</th>
                        <th className="pb-3 pr-6">Views</th>
                        <th className="pb-3 pr-6">Submits</th>
                        <th className="pb-3">Conversion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {repIds.map((repId) => {
                        const r = repMap[repId];
                        const taps = r["TAP"] ?? 0;
                        const views = r["VIEW"] ?? 0;
                        const submits = r["SUBMIT"] ?? 0;
                        const conv = taps > 0 ? ((submits / taps) * 100).toFixed(1) : "0";
                        return (
                          <tr key={repId} className="text-white">
                            <td className="py-3 pr-6 font-mono text-orange-400">Rep #{repId}</td>
                            <td className="py-3 pr-6">{taps}</td>
                            <td className="py-3 pr-6">{views}</td>
                            <td className="py-3 pr-6">{submits}</td>
                            <td className="py-3 font-semibold text-orange-400">{conv}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string | number; sub: string; highlight?: boolean }) {
  return (
    <div className="card">
      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? "text-orange-400" : "text-white"}`}>{value}</p>
      <p className="text-slate-600 text-xs mt-1">{sub}</p>
    </div>
  );
}
