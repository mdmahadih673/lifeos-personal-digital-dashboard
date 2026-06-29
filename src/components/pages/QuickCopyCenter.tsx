"use client";

import { useState, useEffect, useCallback } from "react";
import { QuickCopyItem } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const DEFAULT_ITEMS = [
  { label: "Email", icon: "📧", category: "contact" },
  { label: "Phone", icon: "📞", category: "contact" },
  { label: "Website", icon: "🌐", category: "contact" },
  { label: "Portfolio", icon: "🎨", category: "social" },
  { label: "Bio", icon: "📝", category: "content" },
  { label: "Username", icon: "👤", category: "social" },
  { label: "GitHub", icon: "💻", category: "social" },
  { label: "LinkedIn", icon: "💼", category: "social" },
  { label: "Instagram", icon: "📸", category: "social" },
  { label: "Facebook", icon: "👥", category: "social" },
  { label: "Business Email", icon: "💼", category: "contact" },
  { label: "WhatsApp", icon: "💬", category: "contact" },
];

export default function QuickCopyCenter({ onToast }: Props) {
  const [items, setItems] = useState<QuickCopyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<QuickCopyItem>>({ label: "", value: "", icon: "📋", category: "general" });
  const [isEdit, setIsEdit] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    fetch("/api/quick-copy")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.label?.trim() || !editing.value?.trim()) {
      onToast("Label and value required", "error");
      return;
    }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/quick-copy", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const data = await res.json();
    if (isEdit) {
      setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
      onToast("Updated!", "success");
    } else {
      setItems((prev) => [...prev, data]);
      onToast("Added!", "success");
    }
    setShowModal(false);
  };

  const deleteItem = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/quick-copy?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    onToast("Deleted", "info");
  };

  const handleCopy = async (item: QuickCopyItem) => {
    await copyToClipboard(item.value);
    setCopiedId(item.id);
    onToast(`${item.label} copied!`, "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [...new Set(items.map((i) => i.category || "general"))];
  const filtered = filter === "all" ? items : items.filter((i) => (i.category || "general") === filter);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">⚡ Quick Copy Center</div>
          <div className="section-subtitle">One-click copy for your important info</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing({ label: "", value: "", icon: "📋", category: "general" }); setIsEdit(false); setShowModal(true); }}>
          + Add Item
        </button>
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", ...categories].map((c) => (
          <button key={c} className={`tag ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {/* Add defaults banner if empty */}
      {items.length === 0 && !loading && (
        <div className="skeu-card" style={{ padding: "24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--silver-800)" }}>Set up Quick Copy</div>
          <div style={{ fontSize: 14, color: "var(--silver-400)", marginBottom: 16 }}>Add your frequently used text for one-click copying</div>
          <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing({ label: "", value: "", icon: "📋", category: "general" }); setIsEdit(false); setShowModal(true); }}>
            + Add First Item
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 12 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="skeu-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: copiedId === item.id ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.8)",
              }}
              onClick={() => handleCopy(item)}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: copiedId === item.id
                  ? "linear-gradient(135deg, #4ade80, #16a34a)"
                  : "linear-gradient(135deg, var(--silver-200), var(--silver-100))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
                boxShadow: copiedId === item.id ? "0 2px 8px rgba(22,163,74,0.3)" : "var(--btn-shadow)",
                transition: "all 0.2s ease",
              }}>
                {copiedId === item.id ? "✓" : item.icon || "📋"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--silver-400)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--silver-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.value}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button className="skeu-btn skeu-btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(item); setIsEdit(true); setShowModal(true); }}>✏️</button>
                <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggested items */}
      {items.length === 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--silver-400)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            💡 Suggested Items
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10 }}>
            {DEFAULT_ITEMS.map((di) => (
              <button
                key={di.label}
                className="skeu-btn"
                style={{ padding: "12px 14px", borderRadius: 12, flexDirection: "column", gap: 6, height: "auto" }}
                onClick={() => { setEditing({ label: di.label, value: "", icon: di.icon, category: di.category }); setIsEdit(false); setShowModal(true); }}
              >
                <span style={{ fontSize: 22 }}>{di.icon}</span>
                <span style={{ fontSize: 12 }}>{di.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Item" : "Add Quick Copy Item"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Label *</label>
                  <input className="skeu-input" placeholder="Email" value={editing.label || ""} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon (emoji)</label>
                  <input className="skeu-input" placeholder="📧" value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Value * (text to copy)</label>
                <textarea className="skeu-input skeu-textarea" placeholder="your@email.com" value={editing.value || ""} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="skeu-input" placeholder="contact, social, content..." value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
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
