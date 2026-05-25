"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

interface DocMeta {
  id: string;
  name: string;
  description: string | null;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  updatedAt: string;
}

function fmtBytes(n: number) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / 1024 / 1024).toFixed(2) + " MB";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadDocs() {
    setLoading(true);
    const res = await fetch("/api/documents");
    const data = await res.json();
    setDocs(Array.isArray(data.documents) ? data.documents : []);
    setLoading(false);
  }

  useEffect(() => { loadDocs(); }, []);
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) { setUploadError("Please select a PDF file."); return; }
    if (!uploadName.trim()) { setUploadError("Please enter a document name."); return; }
    if (uploadFile.size > 10 * 1024 * 1024) { setUploadError("File must be under 10 MB."); return; }
    setUploading(true);
    setUploadError("");
    const form = new FormData();
    form.append("file", uploadFile);
    form.append("name", uploadName.trim());
    form.append("description", uploadDesc.trim());
    const res = await fetch("/api/documents", { method: "POST", body: form });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setUploadError(data.error || "Upload failed."); return; }
    setUploadName(""); setUploadDesc(""); setUploadFile(null);
    if (fileRef.current) fileRef.current.value = "";
    showToast("Document uploaded successfully!");
    loadDocs();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Document deleted."); loadDocs(); }
  }

  async function handleSaveEdit(id: string) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc || null }),
    });
    if (res.ok) { showToast("Saved!"); setEditingId(null); loadDocs(); }
  }

  return (
    <AdminShell>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload and manage PDFs — brochures, warranties, spec sheets, anything you want on file or shareable.
          </p>
        </div>

        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-green-500/20 border border-green-500/40 text-green-300 px-4 py-3 rounded-lg text-sm font-medium shadow-lg">
            {toast}
          </div>
        )}
        {/* Upload card */}
        <div className="card mb-8">
          <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
            <span className="text-xl">📤</span> Upload a PDF
          </h2>
          <form onSubmit={handleUpload}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Document name *</label>
                <input className="input" placeholder="e.g. Company Brochure" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input className="input" placeholder="e.g. Updated Jan 2025" value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} />
              </div>
            </div>
            <div
              className="border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
              onClick={() => fileRef.current?.click()}
            >
              {uploadFile ? (
                <div>
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-white font-medium">{uploadFile.name}</p>
                  <p className="text-slate-400 text-sm">{fmtBytes(uploadFile.size)}</p>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-slate-500 text-xs mt-2 hover:text-red-400">
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-3 text-slate-600">📁</div>
                  <p className="text-slate-400 text-sm">Click to select a PDF file</p>
                  <p className="text-slate-600 text-xs mt-1">Max 10 MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setUploadFile(f);
                if (f && !uploadName) setUploadName(f.name.replace(/\.pdf$/i, ""));
              }}
            />
            {uploadError && <p className="text-red-400 text-sm mb-3">{uploadError}</p>}
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload Document"}
            </button>
          </form>
        </div>
        {/* Document list */}
        <div>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            {loading ? "Loading..." : `${docs.length} Document${docs.length !== 1 ? "s" : ""}`}
          </h2>
          {!loading && docs.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-slate-400">No documents yet. Upload your first PDF above.</p>
            </div>
          )}
          <div className="space-y-3">
            {docs.map((doc) => (
              <div key={doc.id} className="card">
                {editingId === doc.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label">Name</label>
                        <input className="input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                      </div>
                      <div>
                        <label className="label">Description</label>
                        <input className="input" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Optional note" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-primary text-sm py-1.5 px-4" onClick={() => handleSaveEdit(doc.id)}>Save</button>
                      <button className="btn-secondary text-sm py-1.5 px-4" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center text-xl flex-shrink-0">📄</div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">{doc.name}</p>
                          <p className="text-slate-500 text-xs">{doc.filename} &middot; {fmtBytes(doc.sizeBytes)} &middot; Uploaded {fmtDate(doc.uploadedAt)}</p>
                          {doc.description && <p className="text-slate-400 text-sm mt-0.5">{doc.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setPreviewId(previewId === doc.id ? null : doc.id)}>
                          {previewId === doc.id ? "Hide" : "Preview"}
                        </button>
                        <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-1.5 px-3">Open</a>
                        <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => { setEditingId(doc.id); setEditName(doc.name); setEditDesc(doc.description ?? ""); }}>Rename</button>
                        <button className="text-sm py-1.5 px-3 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-500/10 transition-colors" onClick={() => handleDelete(doc.id, doc.name)}>Delete</button>
                      </div>
                    </div>
                    {previewId === doc.id && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-slate-700" style={{ height: "600px" }}>
                        <iframe src={`/api/documents/${doc.id}`} className="w-full h-full" title={doc.name} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}