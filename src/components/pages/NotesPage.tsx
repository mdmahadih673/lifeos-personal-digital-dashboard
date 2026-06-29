"use client";

import { useState, useEffect, useCallback } from "react";
import { Note } from "@/lib/types";
import { NOTE_CATEGORIES, copyToClipboard } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const NOTE_COLORS = [
  "#ffffff", "#fef9c3", "#dcfce7", "#dbeafe", "#fce7f3",
  "#ede9fe", "#ffedd5", "#e0f2fe",
];

const EMPTY: Partial<Note> = {
  title: "", content: "", category: "general", isPinned: false, color: "#ffffff",
};

export default function NotesPage({ onToast }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Note>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => { setNotes(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); };
  const openEdit = (n: Note) => { setEditing(n); setIsEdit(true); setShowModal(true); };

  const save = async () => {
    if (!editing.title?.trim()) { onToast("Title is required", "error"); return; }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/notes", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const data = await res.json();
    if (isEdit) {
      setNotes((prev) => prev.map((n) => (n.id === data.id ? data : n)));
      onToast("Note saved!", "success");
    } else {
      setNotes((prev) => [data, ...prev]);
      onToast("Note created!", "success");
    }
    setShowModal(false);
  };

  const deleteNote = async (id: number) => {
    if (!confirm("Delete note?")) return;
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n.id !== id));
    onToast("Note deleted", "info");
  };

  const togglePin = async (note: Note) => {
    const updated = { ...note, isPinned: !note.isPinned };
    await fetch("/api/notes", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)));
    onToast(updated.isPinned ? "Note pinned!" : "Note unpinned", "info");
  };

  const filtered = notes.filter((n) => {
    const mf = filter === "all" ? true : filter === "pinned" ? n.isPinned : filter === "favorites" ? n.isFavorite : n.category === filter;
    const ms = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const pinned = filtered.filter((n) => n.isPinned);
  const unpinned = filtered.filter((n) => !n.isPinned);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Notes</div>
          <div className="section-subtitle">{notes.length} notes · {notes.filter((n) => n.isPinned).length} pinned</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={openAdd}>+ New Note</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "pinned", "favorites", ...NOTE_CATEGORIES].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "pinned" ? "📌 Pinned" : f === "favorites" ? "⭐ Fav" : f.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input className="skeu-input" style={{ paddingLeft: 38 }} placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗒️</div>
          <div className="empty-state-title">No notes found</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ New Note</button>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--silver-400)", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>📌 Pinned</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginBottom: 24 }}>
                {pinned.map((n) => <NoteCard key={n.id} note={n} onEdit={openEdit} onDelete={deleteNote} onPin={togglePin} onCopy={() => copyToClipboard(n.content).then(() => onToast("Copied!", "success"))} />)}
              </div>
            </>
          )}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--silver-400)", marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}>All Notes</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
                {unpinned.map((n) => <NoteCard key={n.id} note={n} onEdit={openEdit} onDelete={deleteNote} onPin={togglePin} onCopy={() => copyToClipboard(n.content).then(() => onToast("Copied!", "success"))} />)}
              </div>
            </>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Note" : "New Note"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="skeu-input" placeholder="Note title..." value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="skeu-input skeu-select" value={editing.category || "general"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {NOTE_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("-", " ")}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>
                    {NOTE_COLORS.map((c) => (
                      <div key={c} className={`color-swatch ${editing.color === c ? "selected" : ""}`}
                        style={{ background: c, border: c === "#ffffff" ? "1px solid var(--silver-300)" : "none" }}
                        onClick={() => setEditing({ ...editing, color: c })} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="skeu-input skeu-textarea" style={{ minHeight: 200 }}
                  placeholder="Write your note..." value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!editing.isPinned} onChange={(e) => setEditing({ ...editing, isPinned: e.target.checked })} />
                  <span style={{ fontSize: 13, color: "var(--silver-600)" }}>📌 Pin this note</span>
                </label>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Create"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onEdit, onDelete, onPin, onCopy }: {
  note: Note;
  onEdit: (n: Note) => void;
  onDelete: (id: number) => void;
  onPin: (n: Note) => void;
  onCopy: () => void;
}) {
  const bgColor = note.color || "#ffffff";
  const isDark = bgColor === "#ffffff";

  return (
    <div
      className={`note-card ${note.isPinned ? "pinned" : ""}`}
      style={{
        background: bgColor,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.8)" : "transparent"}`,
        cursor: "default",
      }}
      onClick={() => onEdit(note)}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--silver-800)", flex: 1, paddingRight: note.isPinned ? 24 : 0 }}>
          {note.title}
        </div>
      </div>
      {note.content && (
        <div style={{
          fontSize: 13, color: "var(--silver-500)", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
          marginBottom: 12,
        }}>
          {note.content}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge badge-gray" style={{ fontSize: 10 }}>{note.category}</span>
        <div style={{ display: "flex", gap: 4 }}>
          <button className="skeu-btn skeu-btn-sm" onClick={(e) => { e.stopPropagation(); onCopy(); }}>⎘</button>
          <button className="skeu-btn skeu-btn-sm" onClick={(e) => { e.stopPropagation(); onPin(note); }}>
            {note.isPinned ? "📌" : "📍"}
          </button>
          <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}>🗑️</button>
        </div>
      </div>
    </div>
  );
}
