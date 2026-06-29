"use client";

import { useState, useEffect, useCallback } from "react";
import { FavoriteApp } from "@/lib/types";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const DEFAULT_APPS: Partial<FavoriteApp>[] = [
  { name: "Facebook", url: "https://facebook.com", icon: "👥", color: "#1877f2", category: "social", sortOrder: 1, isQuickLaunch: true },
  { name: "Instagram", url: "https://instagram.com", icon: "📸", color: "#e1306c", category: "social", sortOrder: 2, isQuickLaunch: true },
  { name: "YouTube", url: "https://youtube.com", icon: "▶️", color: "#ff0000", category: "social", sortOrder: 3, isQuickLaunch: true },
  { name: "GitHub", url: "https://github.com", icon: "💻", color: "#24292e", category: "dev", sortOrder: 4, isQuickLaunch: true },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "💼", color: "#0077b5", category: "social", sortOrder: 5, isQuickLaunch: true },
  { name: "WhatsApp", url: "https://web.whatsapp.com", icon: "💬", color: "#25d366", category: "messaging", sortOrder: 6, isQuickLaunch: true },
  { name: "Telegram", url: "https://web.telegram.org", icon: "✈️", color: "#0088cc", category: "messaging", sortOrder: 7, isQuickLaunch: true },
  { name: "Discord", url: "https://discord.com", icon: "🎮", color: "#5865f2", category: "messaging", sortOrder: 8, isQuickLaunch: true },
  { name: "Gmail", url: "https://gmail.com", icon: "📧", color: "#ea4335", category: "productivity", sortOrder: 9, isQuickLaunch: true },
  { name: "Google Drive", url: "https://drive.google.com", icon: "☁️", color: "#4285f4", category: "productivity", sortOrder: 10, isQuickLaunch: true },
  { name: "ChatGPT", url: "https://chatgpt.com", icon: "🤖", color: "#10a37f", category: "ai", sortOrder: 11, isQuickLaunch: true },
  { name: "Portfolio", url: "#", icon: "🌐", color: "#667eea", category: "personal", sortOrder: 12, isQuickLaunch: true },
];

export default function QuickLaunch({ onToast }: Props) {
  const [apps, setApps] = useState<FavoriteApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<FavoriteApp>>({ name: "", url: "", icon: "🌐", color: "#3b82f6", category: "general" });
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    fetch("/api/apps")
      .then((r) => r.json())
      .then((data) => { setApps(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const seedDefaults = async () => {
    for (const app of DEFAULT_APPS) {
      await fetch("/api/apps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(app) });
    }
    load();
    onToast("Default apps added!", "success");
  };

  const save = async () => {
    if (!editing.name?.trim() || !editing.url?.trim()) { onToast("Name and URL required", "error"); return; }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/apps", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    const data = await res.json();
    if (isEdit) {
      setApps((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      onToast("App updated!", "success");
    } else {
      setApps((prev) => [...prev, data]);
      onToast("App added!", "success");
    }
    setShowModal(false);
  };

  const deleteApp = async (id: number) => {
    if (!confirm("Remove this app?")) return;
    await fetch(`/api/apps?id=${id}`, { method: "DELETE" });
    setApps((prev) => prev.filter((a) => a.id !== id));
    onToast("App removed", "info");
  };

  const openApp = async (app: FavoriteApp) => {
    window.open(app.url, "_blank");
    // Mark as recently used
    await fetch("/api/apps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: app.id, recentlyUsed: true, lastUsed: new Date() }),
    }).catch(() => {});
    setApps((prev) => prev.map((a) => a.id === app.id ? { ...a, recentlyUsed: true } : a));
  };

  const categories = ["all", ...new Set(apps.map((a) => a.category || "general").filter(Boolean))];
  const filtered = filter === "all" ? apps : apps.filter((a) => (a.category || "general") === filter);
  const recent = apps.filter((a) => a.recentlyUsed).slice(0, 6);

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">🚀 Quick Launch</div>
          <div className="section-subtitle">One-click access to your favorite apps</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {apps.length === 0 && (
            <button className="skeu-btn" onClick={seedDefaults}>Load Defaults</button>
          )}
          <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing({ name: "", url: "", icon: "🌐", color: "#3b82f6", category: "general" }); setIsEdit(false); setShowModal(true); }}>
            + Add App
          </button>
        </div>
      </div>

      {/* Recently Used */}
      {recent.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--silver-400)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🕐 Recently Used
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {recent.map((app) => (
              <AppIcon key={app.id} app={app} onOpen={() => openApp(app)} onEdit={() => { setEditing(app); setIsEdit(true); setShowModal(true); }} onDelete={() => deleteApp(app.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map((c) => (
          <button key={c} className={`tag ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>
            {c === "all" ? "All Apps" : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🚀</div>
          <div className="empty-state-title">No apps yet</div>
          <div className="empty-state-text">Add your favorite web apps for quick access</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
            <button className="skeu-btn" onClick={seedDefaults}>Load Defaults</button>
            <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing({ name: "", url: "", icon: "🌐", color: "#3b82f6", category: "general" }); setIsEdit(false); setShowModal(true); }}>+ Add Custom</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px,1fr))", gap: 20 }}>
          {filtered.map((app) => (
            <AppIcon key={app.id} app={app} onOpen={() => openApp(app)} onEdit={() => { setEditing(app); setIsEdit(true); setShowModal(true); }} onDelete={() => deleteApp(app.id)} large />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit App" : "Add App"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">App Name *</label>
                  <input className="skeu-input" placeholder="GitHub" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Icon (emoji)</label>
                  <input className="skeu-input" placeholder="💻" value={editing.icon || ""} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">URL *</label>
                <input className="skeu-input" placeholder="https://github.com" value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="color" value={editing.color || "#3b82f6"} onChange={(e) => setEditing({ ...editing, color: e.target.value })}
                      style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer", padding: 2 }} />
                    <input className="skeu-input" value={editing.color || "#3b82f6"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} style={{ fontFamily: "monospace" }} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="skeu-input" placeholder="social, dev, productivity..." value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                </div>
              </div>
              {/* Preview */}
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "var(--silver-100)", borderRadius: 12 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `linear-gradient(145deg, ${editing.color}dd, ${editing.color})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, boxShadow: `0 4px 12px ${editing.color}40`,
                }}>
                  {editing.icon || "🌐"}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--silver-800)" }}>{editing.name || "App Name"}</div>
                  <div style={{ fontSize: 12, color: "var(--silver-400)" }}>{editing.url || "https://..."}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Add App"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppIcon({ app, onOpen, onEdit, onDelete, large = false }: {
  app: FavoriteApp;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  large?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const size = large ? 72 : 52;
  const borderRadius = large ? 20 : 14;
  const fontSize = large ? 32 : 22;
  const labelSize = large ? 12 : 11;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
      <div
        style={{
          width: size, height: size, borderRadius,
          background: `linear-gradient(145deg, ${app.color}dd, ${app.color})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize, cursor: "pointer",
          boxShadow: `0 4px 12px ${app.color}40, 0 8px 24px ${app.color}20, inset 0 1px 0 rgba(255,255,255,0.3)`,
          border: "1px solid rgba(255,255,255,0.2)",
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          position: "relative",
          overflow: "hidden",
        }}
        onClick={onOpen}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true); }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", background: "rgba(255,255,255,0.2)", borderRadius: `${borderRadius}px ${borderRadius}px 0 0` }} />
        {app.icon}
      </div>
      <span style={{ fontSize: labelSize, color: "var(--silver-500)", fontWeight: 600, textAlign: "center", maxWidth: size + 20, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {app.name}
      </span>
      {showMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 1999 }} onClick={() => setShowMenu(false)} />
          <div className="context-menu" style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", zIndex: 2000 }}>
            <div className="context-menu-item" onClick={() => { onOpen(); setShowMenu(false); }}>↗ Open App</div>
            <div className="context-menu-item" onClick={() => { onEdit(); setShowMenu(false); }}>✏️ Edit</div>
            <div className="context-menu-item danger" onClick={() => { onDelete(); setShowMenu(false); }}>🗑️ Remove</div>
          </div>
        </>
      )}
    </div>
  );
}
