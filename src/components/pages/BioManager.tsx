"use client";

import { useState, useEffect, useCallback } from "react";
import { Bio } from "@/lib/types";
import { BIO_PLATFORMS, copyToClipboard } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸",
  Facebook: "👥",
  GitHub: "💻",
  LinkedIn: "💼",
  Twitter: "🐦",
  Business: "💼",
  Gaming: "🎮",
  Portfolio: "🌐",
};

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "#e1306c",
  Facebook: "#1877f2",
  GitHub: "#24292e",
  LinkedIn: "#0077b5",
  Twitter: "#1da1f2",
  Business: "#6366f1",
  Gaming: "#8b5cf6",
  Portfolio: "#667eea",
};

export default function BioManager({ onToast }: Props) {
  const [bios, setBios] = useState<Bio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Bio>>({ platform: "Instagram", content: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetch("/api/bios")
      .then((r) => r.json())
      .then((data) => { setBios(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing({ platform: "Instagram", content: "" });
    setIsEdit(false);
    setShowModal(true);
  };

  const openEdit = (b: Bio) => {
    setEditing(b);
    setIsEdit(true);
    setShowModal(true);
  };

  const save = async () => {
    if (!editing.content?.trim()) { onToast("Bio content is required", "error"); return; }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/bios", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (isEdit) {
      setBios((prev) => prev.map((b) => (b.id === data.id ? data : b)));
      onToast("Bio updated!", "success");
    } else {
      setBios((prev) => [data, ...prev]);
      onToast("Bio added!", "success");
    }
    setShowModal(false);
  };

  const deleteBio = async (id: number) => {
    if (!confirm("Delete this bio?")) return;
    await fetch(`/api/bios?id=${id}`, { method: "DELETE" });
    setBios((prev) => prev.filter((b) => b.id !== id));
    onToast("Bio deleted", "info");
  };

  const toggleFavorite = async (bio: Bio) => {
    const updated = { ...bio, isFavorite: !bio.isFavorite };
    await fetch("/api/bios", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setBios((prev) => prev.map((b) => (b.id === bio.id ? updated : b)));
    onToast(updated.isFavorite ? "Added to favorites!" : "Removed", "info");
  };

  const filtered = bios.filter((b) =>
    filter === "all" ? true : filter === "favorites" ? b.isFavorite : b.platform.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Bio Manager</div>
          <div className="section-subtitle">{bios.length} bios saved</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={openAdd}>+ Add Bio</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "favorites", ...BIO_PLATFORMS].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "favorites" ? "⭐ Favorites" : `${PLATFORM_ICONS[f] || "📝"} ${f}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No bios yet</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Bio</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((bio) => {
            const isExpanded = expandedId === bio.id;
            const color = PLATFORM_COLORS[bio.platform] || "#3b82f6";
            return (
              <div key={bio.id} className="skeu-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `linear-gradient(135deg, ${color}aa, ${color})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                    boxShadow: `0 2px 8px ${color}40`,
                  }}>
                    {PLATFORM_ICONS[bio.platform] || "📝"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>{bio.platform} Bio</div>
                    <div style={{ fontSize: 12, color: "var(--silver-400)" }}>{bio.content.length} characters</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => toggleFavorite(bio)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                      {bio.isFavorite ? "⭐" : "☆"}
                    </button>
                  </div>
                </div>

                {/* Bio preview */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : bio.id)}
                  style={{
                    fontSize: 14, color: "var(--silver-600)", lineHeight: 1.6,
                    padding: "12px 14px",
                    background: "var(--silver-50)",
                    borderRadius: 10,
                    cursor: "pointer",
                    overflow: "hidden",
                    maxHeight: isExpanded ? "none" : "80px",
                    position: "relative",
                    marginBottom: 14,
                    border: "1px solid var(--silver-200)",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {bio.content}
                  {!isExpanded && bio.content.length > 120 && (
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0, height: 40,
                      background: "linear-gradient(to top, var(--silver-50), transparent)",
                    }} />
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button className="skeu-btn skeu-btn-sm skeu-btn-primary"
                    onClick={() => copyToClipboard(bio.content).then(() => onToast("Bio copied!", "success"))}>
                    ⎘ Copy
                  </button>
                  <button className="skeu-btn skeu-btn-sm" onClick={() => setExpandedId(isExpanded ? null : bio.id)}>
                    {isExpanded ? "▲ Less" : "▼ More"}
                  </button>
                  <button className="skeu-btn skeu-btn-sm" onClick={() => openEdit(bio)}>✏️ Edit</button>
                  <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={() => deleteBio(bio.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Bio" : "Add Bio"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Platform</label>
                <select className="skeu-input skeu-select" value={editing.platform || "Instagram"}
                  onChange={(e) => setEditing({ ...editing, platform: e.target.value })}>
                  {BIO_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Bio Content *</label>
                <textarea className="skeu-input skeu-textarea" style={{ minHeight: 160 }}
                  placeholder="Write your bio here..." value={editing.content || ""}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                <div style={{ fontSize: 11, color: "var(--silver-400)", marginTop: 4, textAlign: "right" }}>
                  {(editing.content || "").length} characters
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Add Bio"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
