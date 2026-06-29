"use client";

import { useState, useEffect, useCallback } from "react";
import { SocialAccount } from "@/lib/types";
import { PLATFORMS, copyToClipboard, getPlatformEmoji } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const EMPTY: Partial<SocialAccount> = {
  platform: "instagram",
  username: "",
  displayName: "",
  profileUrl: "",
  bio: "",
  notes: "",
};

export default function SocialManager({ onToast }: Props) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<SocialAccount>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/social")
      .then((r) => r.json())
      .then((data) => { setAccounts(data); setLoading(false); })
      .catch(() => { onToast("Failed to load accounts", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(EMPTY);
    setIsEdit(false);
    setShowModal(true);
  };

  const openEdit = (acc: SocialAccount) => {
    setEditing(acc);
    setIsEdit(true);
    setShowModal(true);
  };

  const save = async () => {
    if (!editing.username?.trim() || !editing.platform) {
      onToast("Platform and username are required", "error");
      return;
    }
    try {
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/social", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (isEdit) {
        setAccounts((prev) => prev.map((a) => (a.id === data.id ? data : a)));
        onToast("Account updated!", "success");
      } else {
        setAccounts((prev) => [data, ...prev]);
        onToast("Account added!", "success");
      }
      setShowModal(false);
    } catch {
      onToast("Failed to save", "error");
    }
  };

  const deleteAcc = async (id: number) => {
    if (!confirm("Delete this account?")) return;
    try {
      await fetch(`/api/social?id=${id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      onToast("Account deleted", "info");
    } catch {
      onToast("Failed to delete", "error");
    }
  };

  const toggleFavorite = async (acc: SocialAccount) => {
    const updated = { ...acc, isFavorite: !acc.isFavorite };
    await fetch("/api/social", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setAccounts((prev) => prev.map((a) => (a.id === acc.id ? updated : a)));
    onToast(updated.isFavorite ? "Added to favorites!" : "Removed from favorites", "info");
  };

  const filteredAccounts = accounts.filter((a) => {
    const matchFilter = filter === "all" || a.platform === filter || (filter === "favorites" && a.isFavorite);
    const matchSearch =
      !search ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      (a.displayName || "").toLowerCase().includes(search.toLowerCase()) ||
      a.platform.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Social Media Manager</div>
          <div className="section-subtitle">{accounts.length} accounts stored</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={openAdd}>
          + Add Account
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "favorites", ...PLATFORMS.slice(0, 8).map((p) => p.value)].map((f) => (
          <button
            key={f}
            className={`tag ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "favorites" ? "⭐ Favorites" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
        <input
          className="skeu-input"
          style={{ paddingLeft: 38 }}
          placeholder="Search accounts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filteredAccounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📱</div>
          <div className="empty-state-title">No accounts found</div>
          <div className="empty-state-text">Add your first social media account</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Account</button>
        </div>
      ) : (
        <div className="grid-auto">
          {filteredAccounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={acc}
              onEdit={openEdit}
              onDelete={deleteAcc}
              onFavorite={toggleFavorite}
              onCopy={(v, l) => copyToClipboard(v).then(() => onToast(`${l} copied!`, "success"))}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Account" : "Add Social Account"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Platform *</label>
                <select
                  className="skeu-input skeu-select"
                  value={editing.platform || "instagram"}
                  onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input
                    className="skeu-input"
                    placeholder="@username"
                    value={editing.username || ""}
                    onChange={(e) => setEditing({ ...editing, username: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    className="skeu-input"
                    placeholder="Your Name"
                    value={editing.displayName || ""}
                    onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Profile URL</label>
                <input
                  className="skeu-input"
                  placeholder="https://..."
                  value={editing.profileUrl || ""}
                  onChange={(e) => setEditing({ ...editing, profileUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Profile Picture URL</label>
                <input
                  className="skeu-input"
                  placeholder="https://..."
                  value={editing.profilePicture || ""}
                  onChange={(e) => setEditing({ ...editing, profilePicture: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  className="skeu-input skeu-textarea"
                  placeholder="Profile bio..."
                  value={editing.bio || ""}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="skeu-input skeu-textarea"
                  placeholder="Private notes..."
                  value={editing.notes || ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>
                  {isEdit ? "Save Changes" : "Add Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AccountCardProps {
  account: SocialAccount;
  onEdit: (a: SocialAccount) => void;
  onDelete: (id: number) => void;
  onFavorite: (a: SocialAccount) => void;
  onCopy: (value: string, label: string) => void;
}

function AccountCard({ account, onEdit, onDelete, onFavorite, onCopy }: AccountCardProps) {
  const emoji = getPlatformEmoji(account.platform);
  const platformClass = `platform-${account.platform}`;

  return (
    <div className="skeu-card" style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div
          className={`app-icon app-icon-sm ${platformClass}`}
          style={{ fontSize: 20, flexShrink: 0 }}
        >
          {emoji}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--silver-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {account.displayName || account.username}
          </div>
          <div style={{ fontSize: 12, color: "var(--silver-400)", textTransform: "capitalize" }}>{account.platform}</div>
        </div>
        <button
          onClick={() => onFavorite(account)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}
        >
          {account.isFavorite ? "⭐" : "☆"}
        </button>
      </div>

      {/* Profile pic */}
      {account.profilePicture && (
        <div style={{ marginBottom: 12 }}>
          <img
            src={account.profilePicture}
            alt={account.username}
            style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      {/* Username */}
      <div style={{ fontSize: 13, color: "var(--silver-600)", marginBottom: 8 }}>
        <span style={{ color: "var(--silver-400)" }}>@</span>{account.username}
      </div>

      {/* Bio */}
      {account.bio && (
        <div style={{
          fontSize: 12, color: "var(--silver-500)", marginBottom: 12,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          lineHeight: 1.4,
        }}>
          {account.bio}
        </div>
      )}

      {/* URL */}
      {account.profileUrl && (
        <div style={{ fontSize: 11, color: "var(--blue-mid)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {account.profileUrl}
        </div>
      )}

      {/* Divider */}
      <div className="divider" />

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {account.profileUrl && (
          <a href={account.profileUrl} target="_blank" rel="noopener noreferrer" className="skeu-btn skeu-btn-sm skeu-btn-primary">
            Open ↗
          </a>
        )}
        <button className="skeu-btn skeu-btn-sm" onClick={() => onCopy(account.username, "Username")}>
          Copy @
        </button>
        {account.profileUrl && (
          <button className="skeu-btn skeu-btn-sm" onClick={() => onCopy(account.profileUrl!, "URL")}>
            Copy URL
          </button>
        )}
        <button className="skeu-btn skeu-btn-sm" onClick={() => onEdit(account)}>✏️</button>
        <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={() => onDelete(account.id)}>🗑️</button>
      </div>
    </div>
  );
}
