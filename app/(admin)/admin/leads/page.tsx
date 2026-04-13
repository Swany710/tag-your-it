"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  rep: { id: number; name: string };
}

const STATUSES = ["NEW", "CONTACTED", "INSPECTION_BOOKED", "ESTIMATE_SENT", "WON", "LOST"];

const STATUS_STYLE: Record<string, string> = {
  NEW:               "bg-blue-900/60 text-blue-300",
  CONTACTED:         "bg-yellow-900/60 text-yellow-300",
  INSPECTION_BOOKED: "bg-orange-900/60 text-orange-300",
  ESTIMATE_SENT:     "bg-purple-900/60 text-purple-300",
  WON:               "bg-green-900/60 text-green-300",
  LOST:              "bg-red-900/60 text-red-300",
};

export default function LeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected]   = useState<Lead | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "200" });
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/leads?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setLeads(d.leads ?? []);
        setTotal(d.total ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  async function updateStatus(leadId: string, status: string) {
    setUpdatingId(leadId);
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      setLeads((ls) => ls.map((l) => l.id === leadId ? { ...l, status: data.lead.status } : l));
      if (selected?.id === leadId) setSelected((s) => s ? { ...s, status } : s);
    }
    setUpdatingId(null);
  }

  return (
    <AdminShell>
      <div className="flex h-[calc(100vh-64px)]">

        {/* Lead list */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold text-white">
              Leads <span className="text-slate-500 text-base font-normal">({total})</span>
            </h1>
          </div>

          {/* Status filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setStatusFilter("")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!statusFilter ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              All
            </button>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? "bg-orange-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-slate-400 text-sm">Loading leads...</div>
          ) : (
            <div className="space-y-2">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className={`card cursor-pointer hover:border-slate-600 transition-colors flex items-center gap-4 ${selected?.id === lead.id ? "border-orange-500" : ""}`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{lead.name}</p>
                    <p className="text-slate-500 text-sm truncate">
                      {lead.phone ?? lead.email ?? "No contact"} · via {lead.rep.name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`badge ${STATUS_STYLE[lead.status] ?? STATUS_STYLE.NEW} block mb-1`}>
                      {lead.status.replace(/_/g, " ")}
                    </span>
                    <p className="text-slate-600 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="text-slate-500 text-sm py-8 text-center">No leads found.</div>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-96 border-l border-slate-800 bg-slate-950 overflow-auto p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Lead Detail</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="space-y-5">
              <div>
                <div className="w-14 h-14 rounded-xl bg-slate-700 flex items-center justify-center text-white font-bold text-2xl mb-3">
                  {selected.name.charAt(0)}
                </div>
                <h3 className="text-white font-semibold text-lg">{selected.name}</h3>
                <p className="text-slate-400 text-sm">via {selected.rep.name} · Rep #{selected.rep.id}</p>
              </div>

              <div className="space-y-2 text-sm">
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-slate-300 hover:text-orange-400">
                    📞 {selected.phone}
                  </a>
                )}
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-300 hover:text-orange-400">
                    ✉️ {selected.email}
                  </a>
                )}
                {selected.address && (
                  <p className="text-slate-400">📍 {selected.address}</p>
                )}
              </div>

              {selected.notes && (
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Notes</p>
                  <p className="text-slate-300 text-sm">{selected.notes}</p>
                </div>
              )}

              {/* Status picker */}
              <div>
                <label className="label">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      disabled={updatingId === selected.id}
                      className={`text-xs px-2 py-2 rounded-lg border font-medium transition-colors ${
                        selected.status === s
                          ? "border-orange-500 bg-orange-500/20 text-orange-300"
                          : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-white"
                      }`}
                    >
                      {s.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-slate-600 text-xs">
                Captured {new Date(selected.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
