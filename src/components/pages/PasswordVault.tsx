"use client";

import { useState, useEffect, useCallback } from "react";
import { Password } from "@/lib/types";
import { copyToClipboard, PASSWORD_CATEGORIES } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const EMPTY: Partial<Password> = {
  website: "",
  websiteUrl: "",
  username: "",
  password: "",
  recoveryEmail: "",
  backupCodes: "",
  twoFactorNotes: "",
  category: "general",
};

export default function PasswordVault({ onToast }: Props) {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Password>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [locked, setLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [enteredPin, setEnteredPin] = useState("");
  const [settingPin, setSettingPin] = useState(false);
  const VAULT_PIN = "1234"; // Demo PIN

  const load = useCallback(() => {
    fetch("/api/passwords")
      .then((r) => r.json())
      .then((data) => { setPasswords(data); setLoading(false); })
      .catch(() => { onToast("Failed to load", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const unlock = () => {
    if (enteredPin === VAULT_PIN) {
      setLocked(false);
      setEnteredPin("");
      onToast("Vault unlocked!", "success");
    } else {
      onToast("Wrong PIN", "error");
      setEnteredPin("");
    }
  };

  const save = async () => {
    if (!editing.website?.trim() || !editing.username?.trim() || !editing.password?.trim()) {
      onToast("Website, username and password are required", "error");
      return;
    }
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch("/api/passwords", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (isEdit) {
      setPasswords((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      onToast("Password updated!", "success");
    } else {
      setPasswords((prev) => [data, ...prev]);
      onToast("Password saved!", "success");
    }
    setShowModal(false);
  };

  const deletePassword = async (id: number) => {
    if (!confirm("Delete this password?")) return;
    await fetch(`/api/passwords?id=${id}`, { method: "DELETE" });
    setPasswords((prev) => prev.filter((p) => p.id !== id));
    onToast("Password deleted", "info");
  };

  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = passwords.filter((p) => {
    const mf = filter === "all" || p.category === filter || (filter === "favorites" && p.isFavorite);
    const ms = !search || p.website.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pwd = "";
    for (let i = 0; i < 16; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setEditing((prev) => ({ ...prev, password: pwd }));
    onToast("Password generated!", "info");
  };

  // Lock screen
  if (locked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 24 }}>
        <div className="skeu-card" style={{ padding: "40px", textAlign: "center", maxWidth: 380, width: "100%" }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔐</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--silver-800)" }}>Password Vault</div>
          <div style={{ fontSize: 14, color: "var(--silver-400)", marginBottom: 28 }}>Enter your PIN to unlock the vault<br/><span style={{ fontSize: 12 }}>(Demo PIN: 1234)</span></div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{
                width: 16, height: 16, borderRadius: "50%",
                background: enteredPin.length > i ? "var(--blue-mid)" : "var(--silver-200)",
                border: "2px solid var(--silver-300)",
                transition: "background 0.15s ease",
                boxShadow: enteredPin.length > i ? "0 0 8px rgba(59,130,246,0.4)" : "none",
              }} />
            ))}
          </div>
          <input
            type="password"
            className="skeu-input"
            style={{ textAlign: "center", letterSpacing: 8, fontSize: 20, marginBottom: 16 }}
            placeholder="• • • •"
            maxLength={4}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
            autoFocus
          />
          <button className="skeu-btn skeu-btn-primary" style={{ width: "100%" }} onClick={unlock}>
            🔓 Unlock Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">🔐 Password Vault</div>
          <div className="section-subtitle">{passwords.length} passwords stored</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="skeu-btn" onClick={() => setLocked(true)}>🔒 Lock</button>
          <button className="skeu-btn skeu-btn-primary" onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
            + Add Password
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "favorites", ...PASSWORD_CATEGORIES].map((f) => (
          <button key={f} className={`tag ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "favorites" ? "⭐" : f}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input className="skeu-input" style={{ paddingLeft: 38 }} placeholder="Search passwords..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔐</div>
          <div className="empty-state-title">No passwords yet</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={() => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); }}>
            + Add Password
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((pwd) => (
            <PasswordCard
              key={pwd.id}
              password={pwd}
              revealed={revealedIds.has(pwd.id)}
              onReveal={() => toggleReveal(pwd.id)}
              onEdit={() => { setEditing(pwd); setIsEdit(true); setShowModal(true); }}
              onDelete={() => deletePassword(pwd.id)}
              onCopy={(v, l) => copyToClipboard(v).then(() => onToast(`${l} copied!`, "success"))}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Password" : "Save Password"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Website/App *</label>
                  <input className="skeu-input" placeholder="Google" value={editing.website || ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Website URL</label>
                  <input className="skeu-input" placeholder="https://google.com" value={editing.websiteUrl || ""} onChange={(e) => setEditing({ ...editing, websiteUrl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Username/Email *</label>
                  <input className="skeu-input" placeholder="user@email.com" value={editing.username || ""} onChange={(e) => setEditing({ ...editing, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="skeu-input skeu-select" value={editing.category || "general"} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {PASSWORD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Password *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="skeu-input" placeholder="••••••••••••" value={editing.password || ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} style={{ flex: 1 }} />
                    <button className="skeu-btn skeu-btn-sm" onClick={generatePassword}>Generate</button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Recovery Email</label>
                  <input className="skeu-input" placeholder="recovery@email.com" value={editing.recoveryEmail || ""} onChange={(e) => setEditing({ ...editing, recoveryEmail: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">2FA Notes</label>
                  <input className="skeu-input" placeholder="Authenticator app..." value={editing.twoFactorNotes || ""} onChange={(e) => setEditing({ ...editing, twoFactorNotes: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Backup Codes</label>
                  <textarea className="skeu-input skeu-textarea" placeholder="Backup codes..." value={editing.backupCodes || ""} onChange={(e) => setEditing({ ...editing, backupCodes: e.target.value })} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="skeu-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="skeu-btn skeu-btn-primary" onClick={save}>{isEdit ? "Save" : "Store"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordCard({ password, revealed, onReveal, onEdit, onDelete, onCopy }: {
  password: Password;
  revealed: boolean;
  onReveal: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (v: string, l: string) => void;
}) {
  return (
    <div className="skeu-card" style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #ef4444, #b91c1c)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
          boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
        }}>
          🔐
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>{password.website}</div>
          <div style={{ fontSize: 13, color: "var(--silver-500)" }}>{password.username}</div>
        </div>

        {/* Password display */}
        <div style={{
          fontFamily: "monospace", fontSize: 14,
          color: revealed ? "var(--silver-800)" : "var(--silver-400)",
          background: "var(--silver-100)",
          padding: "6px 12px", borderRadius: 8,
          border: "1px solid var(--silver-200)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
          letterSpacing: revealed ? "normal" : 3,
          minWidth: 120, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {revealed ? password.password : "••••••••••"}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="skeu-btn skeu-btn-sm" onClick={onReveal}>{revealed ? "🙈" : "👁"}</button>
          <button className="skeu-btn skeu-btn-sm skeu-btn-primary" onClick={() => onCopy(password.password, "Password")}>⎘</button>
          <button className="skeu-btn skeu-btn-sm" onClick={() => onCopy(password.username, "Username")}>@ ⎘</button>
          <button className="skeu-btn skeu-btn-sm" onClick={onEdit}>✏️</button>
          <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={onDelete}>🗑️</button>
        </div>
      </div>

      {(password.recoveryEmail || password.twoFactorNotes) && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--silver-100)", display: "flex", gap: 16, flexWrap: "wrap" }}>
          {password.recoveryEmail && (
            <div style={{ fontSize: 12, color: "var(--silver-500)" }}>
              <span style={{ color: "var(--silver-400)" }}>Recovery: </span>{password.recoveryEmail}
            </div>
          )}
          {password.twoFactorNotes && (
            <div style={{ fontSize: 12, color: "var(--silver-500)" }}>
              <span style={{ color: "var(--silver-400)" }}>2FA: </span>{password.twoFactorNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
