"use client";

import { useState, useEffect, useCallback } from "react";
import { Document } from "@/lib/types";
import { DOC_TYPES, getDocumentIcon } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const EMPTY: Partial<Document> = {
  name: "",
  type: "pdf",
  url: "",
  content: "",
  tags: [],
};

const TYPE_COLORS: Record<string, string> = {
  resume: "#3b82f6",
  cv: "#8b5cf6",
  certificate: "#f59e0b",
  pdf: "#ef4444",
  image: "#ec4899",
  video: "#6366f1",
  zip: "#10b981",
  other: "#6b7280",
};

export default function DocumentsPage({ onToast }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Document>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const load = useCallback(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => { setDocs(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.name?.trim()) { onToast("Name is required", "error"); return; }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/documents", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const data = await res.json();
    if (isEdit) {
      setDocs((prev) => prev.map((d) => (d.id === data.id ? data : d)));
      onToast("Document updated!", "success");
    } else {
      setDocs((prev) => [data, ...prev]);
      onToast("Document added!", "success");
    }
    setShowModal(false);
  };

  const deleteDoc = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
    onToast("Deleted", "info");
  };

  const filtered = docs.filter((d) => {
    const mf = filter === "all" || d.type === filter || (filter === "favorites" && d.isFavorite);
    const ms = !search || d.name.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Documents</div>
          <div className="section-subtitle">{docs.length} files stored</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="skeu-btn skeu-btn-sm" onClick={() => setView(view === "grid" ? "list" : "grid")}>
            {view === "grid" ? "☰ List" : "⊞ Grid"}
          </button>
          <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
            + Add Document
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "favorites", ...DOC_TYPES].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "favorites" ? "⭐" : `${getDocumentIcon(f)} ${f}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input className="skeu-input" style={{ paddingLeft: 38 }} placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <div className="empty-state-title">No documents yet</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
            + Add Document
          </button>
        </div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 16 }}>
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} onEdit={() => { setEditing(doc); setIsEdit(true); setShowModal(true); }} onDelete={() => deleteDoc(doc.id)} />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((doc) => (
            <DocListItem key={doc.id} doc={doc} onEdit={() => { setEditing(doc); setIsEdit(true); setShowModal(true); }} onDelete={() => deleteDoc(doc.id)} onToast={onToast} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Document" : "Add Document"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Document Name *</label>
                <input className="skeu-input" placeholder="My Resume" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="skeu-input skeu-select" value={editing.type || "pdf"} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{getDocumentIcon(t)} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">File URL</label>
                <input className="skeu-input" placeholder="https://..." value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Notes / Content</label>
                <textarea className="skeu-input skeu-textarea" placeholder="Document notes or description..." value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocCard({ doc, onEdit, onDelete }: { doc: Document; onEdit: () => void; onDelete: () => void }) {
  const color = TYPE_COLORS[doc.type] || "#6b7280";
  return (
    <div className="skeu-card" style={{ padding: "20px", textAlign: "center", cursor: "pointer" }} onClick={onEdit}>
      <div style={{
        width: 60, height: 60, borderRadius: 16, margin: "0 auto 12px",
        background: `linear-gradient(135deg, ${color}aa, ${color})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, boxShadow: `0 4px 12px ${color}30`,
      }}>
        {getDocumentIcon(doc.type)}
      </div>
      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--silver-800)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {doc.name}
      </div>
      <div style={{ fontSize: 11, color: "var(--silver-400)", textTransform: "capitalize", marginBottom: 12 }}>{doc.type}</div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="skeu-btn skeu-btn-sm skeu-btn-primary" onClick={(e) => e.stopPropagation()}>↗</a>}
        <button className="skeu-btn skeu-btn-sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>✏️</button>
        <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>🗑️</button>
      </div>
    </div>
  );
}

function DocListItem({ doc, onEdit, onDelete, onToast }: { doc: Document; onEdit: () => void; onDelete: () => void; onToast: (m: string, t?: "success" | "error" | "info" | "warning") => void }) {
  const color = TYPE_COLORS[doc.type] || "#6b7280";
  return (
    <div className="skeu-card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `linear-gradient(135deg, ${color}aa, ${color})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, boxShadow: `0 2px 8px ${color}30`,
      }}>
        {getDocumentIcon(doc.type)}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--silver-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
        <div style={{ fontSize: 12, color: "var(--silver-400)", textTransform: "capitalize" }}>{doc.type}</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {doc.url && <a href={doc.url} target="_blank" rel="noopener noreferrer" className="skeu-btn skeu-btn-sm skeu-btn-primary">Open ↗</a>}
        <button className="skeu-btn skeu-btn-sm" onClick={onEdit}>✏️</button>
        <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}
