"use client";

import { useState, useEffect, useCallback } from "react";
import { ProfileAsset } from "@/lib/types";
import { ASSET_TYPES } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const TYPE_ICONS: Record<string, string> = {
  photo: "🖼️",
  cover: "🌅",
  logo: "🏷️",
  brand: "⭐",
  qr: "📱",
  watermark: "💧",
  thumbnail: "🎞️",
};

export default function ProfileAssets({ onToast }: Props) {
  const [assets, setAssets] = useState<ProfileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<ProfileAsset>>({ type: "photo", name: "", url: "" });
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<ProfileAsset | null>(null);

  const load = useCallback(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((data) => { setAssets(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.name?.trim() || !editing.url?.trim()) {
      onToast("Name and URL are required", "error");
      return;
    }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/assets", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (isEdit) {
      setAssets((prev) => prev.map((a) => (a.id === data.id ? data : a)));
      onToast("Asset updated!", "success");
    } else {
      setAssets((prev) => [data, ...prev]);
      onToast("Asset added!", "success");
    }
    setShowModal(false);
  };

  const deleteAsset = async (id: number) => {
    if (!confirm("Delete this asset?")) return;
    await fetch(`/api/assets?id=${id}`, { method: "DELETE" });
    setAssets((prev) => prev.filter((a) => a.id !== id));
    onToast("Asset deleted", "info");
    if (selected?.id === id) setSelected(null);
  };

  const toggleFavorite = async (asset: ProfileAsset) => {
    const updated = { ...asset, isFavorite: !asset.isFavorite };
    await fetch("/api/assets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? updated : a)));
  };

  const filtered = assets.filter((a) =>
    filter === "all" ? true : filter === "favorites" ? a.isFavorite : a.type === filter
  );

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Profile Assets</div>
          <div className="section-subtitle">{assets.length} assets stored</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing({ type: "photo", name: "", url: "" }); setIsEdit(false); setShowModal(true); }}>
          + Add Asset
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "favorites", ...ASSET_TYPES].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "favorites" ? "⭐ Favorites" : `${TYPE_ICONS[f] || "📁"} ${f}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖼️</div>
          <div className="empty-state-title">No assets yet</div>
          <div className="empty-state-text">Add your profile photos, logos, and brand images</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing({ type: "photo", name: "", url: "" }); setIsEdit(false); setShowModal(true); }}>
            + Add Asset
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 16 }}>
          {filtered.map((asset) => (
            <div key={asset.id} className="gallery-item" style={{ aspectRatio: "1", position: "relative" }}>
              {/* Image or placeholder */}
              {asset.url && (asset.url.startsWith("http") || asset.url.startsWith("data:")) ? (
                <img src={asset.url} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e2e6ec'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='48' fill='%23a0aab8'%3E" + encodeURIComponent(TYPE_ICONS[asset.type] || "📁") + "%3C/text%3E%3C/svg%3E"; }} />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg, var(--silver-200), var(--silver-100))",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 40 }}>{TYPE_ICONS[asset.type] || "📁"}</span>
                  <span style={{ fontSize: 11, color: "var(--silver-400)", textAlign: "center", padding: "0 8px" }}>{asset.name}</span>
                </div>
              )}

              {/* Overlay */}
              <div className="gallery-item-overlay">
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 12 }}>{asset.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, textTransform: "capitalize" }}>{asset.type}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(asset); }}
                      style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {asset.isFavorite ? "⭐" : "☆"}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setEditing(asset); setIsEdit(true); setShowModal(true); }}
                      style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✏️
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                      style={{ background: "rgba(239,68,68,0.6)", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Favorite badge */}
              {asset.isFavorite && (
                <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.5)", borderRadius: 6, padding: "2px 6px", fontSize: 11, color: "white", backdropFilter: "blur(4px)" }}>
                  ⭐
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Asset" : "Add Asset"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Asset Name *</label>
                <input className="skeu-input" placeholder="My Profile Photo" value={editing.name || ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="skeu-input skeu-select" value={editing.type || "photo"}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                  {ASSET_TYPES.map((t) => <option key={t} value={t}>{TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input className="skeu-input" placeholder="https://example.com/image.jpg" value={editing.url || ""}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
              </div>
              {editing.url && (
                <div style={{ marginBottom: 14, borderRadius: 12, overflow: "hidden", maxHeight: 200 }}>
                  <img src={editing.url} alt="Preview" style={{ width: "100%", objectFit: "cover", maxHeight: 200 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
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
