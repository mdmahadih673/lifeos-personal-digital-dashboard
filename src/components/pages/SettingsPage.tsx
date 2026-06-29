"use client";

import { useState } from "react";
import { Profile } from "@/lib/types";

interface Props {
  theme: "light" | "dark";
  onThemeChange: (t: "light" | "dark") => void;
  profile: Profile | null;
  onProfileUpdate: (p: Profile) => void;
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const ACCENT_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
];

export default function SettingsPage({ theme, onThemeChange, profile, onProfileUpdate, onToast }: Props) {
  const [editProfile, setEditProfile] = useState<Partial<Profile>>(profile || {});
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editProfile),
      });
      const data = await res.json();
      onProfileUpdate(data);
      onToast("Profile saved!", "success");
    } catch {
      onToast("Failed to save profile", "error");
    }
    setSaving(false);
  };

  const handleAccentColor = (color: string) => {
    document.documentElement.style.setProperty("--accent", color);
    document.documentElement.style.setProperty("--blue-mid", color);
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accentColor: color }),
    }).catch(() => {});
    onToast(`Accent color changed!`, "success");
  };

  const exportData = async () => {
    try {
      const endpoints = ["/api/social", "/api/contacts", "/api/bios", "/api/notes", "/api/todos", "/api/passwords", "/api/quick-copy", "/api/apps"];
      const results = await Promise.all(endpoints.map((e) => fetch(e).then((r) => r.json())));
      const data = {
        exportDate: new Date().toISOString(),
        social: results[0], contacts: results[1], bios: results[2], notes: results[3],
        todos: results[4], passwords: results[5], quickCopy: results[6], apps: results[7],
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lifeos-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onToast("Data exported successfully!", "success");
    } catch {
      onToast("Export failed", "error");
    }
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        onToast("Import feature coming soon! Data preview loaded.", "info");
        console.log("Import data:", data);
      } catch {
        onToast("Invalid JSON file", "error");
      }
    };
    reader.readAsText(file);
  };

  const SECTIONS = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "data", label: "Data & Backup", icon: "💾" },
    { id: "keyboard", label: "Shortcuts", icon: "⌨️" },
    { id: "about", label: "About", icon: "ℹ️" },
  ];

  return (
    <div style={{ display: "flex", gap: 24 }}>
      {/* Settings sidebar */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div className="skeu-card" style={{ padding: "12px" }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, border: "1px solid transparent",
                background: activeSection === s.id ? "rgba(59,130,246,0.1)" : "none",
                borderColor: activeSection === s.id ? "rgba(59,130,246,0.2)" : "transparent",
                cursor: "pointer", fontSize: 13, fontWeight: 500,
                color: activeSection === s.id ? "var(--blue-mid)" : "var(--silver-600)",
                marginBottom: 2, textAlign: "left",
              }}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings content */}
      <div style={{ flex: 1 }}>
        {activeSection === "profile" && (
          <div className="skeu-card" style={{ padding: "28px" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, color: "var(--silver-800)" }}>👤 Profile Settings</div>
            <div className="grid-2">
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Display Name</label>
                <input className="skeu-input" placeholder="Your Name" value={editProfile.name || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Title / Role</label>
                <input className="skeu-input" placeholder="Digital Creator" value={editProfile.title || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="skeu-input" placeholder="New York, USA" value={editProfile.location || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="skeu-input" type="email" placeholder="you@email.com" value={editProfile.email || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="skeu-input" placeholder="+1 (555) 000-0000" value={editProfile.phone || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Website</label>
                <input className="skeu-input" placeholder="https://yoursite.com" value={editProfile.website || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, website: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Avatar URL</label>
                <input className="skeu-input" placeholder="https://..." value={editProfile.avatar || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, avatar: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: "1/-1" }}>
                <label className="form-label">Bio</label>
                <textarea className="skeu-input skeu-textarea" placeholder="Tell the world about yourself..." value={editProfile.bio || ""}
                  onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })} />
              </div>
            </div>
            <button className="skeu-btn skeu-btn-primary" onClick={saveProfile} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Profile"}
            </button>
          </div>
        )}

        {activeSection === "appearance" && (
          <div>
            {/* Theme */}
            <div className="skeu-card" style={{ padding: "28px", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "var(--silver-800)" }}>🌗 Theme</div>
              <div style={{ display: "flex", gap: 14 }}>
                <div
                  onClick={() => onThemeChange("light")}
                  style={{
                    flex: 1, padding: "20px", borderRadius: 14, cursor: "pointer",
                    border: theme === "light" ? "2px solid var(--blue-mid)" : "2px solid var(--silver-200)",
                    background: "linear-gradient(145deg, #ffffff, #f0f2f5)",
                    boxShadow: theme === "light" ? "0 0 0 3px rgba(59,130,246,0.1)" : "var(--card-shadow)",
                    textAlign: "center", transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>☀️</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1a1a1a" }}>Light Mode</div>
                  {theme === "light" && <div style={{ fontSize: 12, color: "var(--blue-mid)", marginTop: 4 }}>✓ Active</div>}
                </div>
                <div
                  onClick={() => onThemeChange("dark")}
                  style={{
                    flex: 1, padding: "20px", borderRadius: 14, cursor: "pointer",
                    border: theme === "dark" ? "2px solid var(--blue-mid)" : "2px solid var(--silver-200)",
                    background: "linear-gradient(145deg, #1e2435, #151b28)",
                    boxShadow: theme === "dark" ? "0 0 0 3px rgba(59,130,246,0.1)" : "var(--card-shadow)",
                    textAlign: "center", transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🌙</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#e2e8f0" }}>Dark Mode</div>
                  {theme === "dark" && <div style={{ fontSize: 12, color: "var(--blue-mid)", marginTop: 4 }}>✓ Active</div>}
                </div>
              </div>
            </div>

            {/* Accent Color */}
            <div className="skeu-card" style={{ padding: "28px" }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "var(--silver-800)" }}>🎨 Accent Color</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {ACCENT_COLORS.map((c) => (
                  <div
                    key={c.value}
                    onClick={() => handleAccentColor(c.value)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `linear-gradient(135deg, ${c.value}cc, ${c.value})`,
                      boxShadow: `0 4px 12px ${c.value}40`,
                      border: profile?.accentColor === c.value ? "3px solid white" : "3px solid transparent",
                      outline: profile?.accentColor === c.value ? `2px solid ${c.value}` : "none",
                      transition: "all 0.2s ease",
                    }} />
                    <span style={{ fontSize: 11, color: "var(--silver-500)", fontWeight: 600 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "data" && (
          <div className="skeu-card" style={{ padding: "28px" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, color: "var(--silver-800)" }}>💾 Data & Backup</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "20px", background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.04))", borderRadius: 14, border: "1px solid rgba(34,197,94,0.2)" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)", marginBottom: 6 }}>📤 Export Data</div>
                <div style={{ fontSize: 13, color: "var(--silver-500)", marginBottom: 14 }}>Download all your data as a JSON backup file</div>
                <button className="skeu-btn skeu-btn-success" onClick={exportData}>
                  ⬇️ Export as JSON
                </button>
              </div>

              <div style={{ padding: "20px", background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04))", borderRadius: 14, border: "1px solid rgba(59,130,246,0.2)" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)", marginBottom: 6 }}>📥 Import Data</div>
                <div style={{ fontSize: 13, color: "var(--silver-500)", marginBottom: 14 }}>Restore from a previously exported JSON file</div>
                <label className="skeu-btn skeu-btn-primary" style={{ display: "inline-flex", cursor: "pointer" }}>
                  ⬆️ Import JSON
                  <input type="file" accept=".json" onChange={importData} style={{ display: "none" }} />
                </label>
              </div>

              <div style={{ padding: "20px", background: "linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.04))", borderRadius: 14, border: "1px solid rgba(249,115,22,0.2)" }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)", marginBottom: 6 }}>☁️ Cloud Sync</div>
                <div style={{ fontSize: 13, color: "var(--silver-500)", marginBottom: 14 }}>Firebase integration ready — connect your account</div>
                <button className="skeu-btn" onClick={() => onToast("Firebase sync coming soon!", "info")}>
                  🔥 Connect Firebase
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "keyboard" && (
          <div className="skeu-card" style={{ padding: "28px" }}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 24, color: "var(--silver-800)" }}>⌨️ Keyboard Shortcuts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["⌘ K", "Global Search"],
                ["⌘ D", "Go to Dashboard"],
                ["⌘ N", "New Note / Item"],
                ["⌘ ,", "Open Settings"],
                ["⌘ Shift D", "Toggle Dark Mode"],
                ["Escape", "Close Modal"],
                ["Enter", "Confirm Action"],
                ["⌘ E", "Export Data"],
              ].map(([shortcut, desc]) => (
                <div key={shortcut} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--silver-50)", borderRadius: 10, border: "1px solid var(--silver-200)" }}>
                  <span style={{ fontSize: 14, color: "var(--silver-600)" }}>{desc}</span>
                  <kbd style={{ fontFamily: "monospace", fontSize: 12, padding: "4px 10px", background: "var(--silver-200)", borderRadius: 6, color: "var(--silver-700)", boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 0 rgba(0,0,0,0.05)", border: "1px solid var(--silver-300)" }}>
                    {shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "about" && (
          <div className="skeu-card" style={{ padding: "40px", textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: 24,
              background: "linear-gradient(135deg, #5b9cf6, #3b82f6, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, margin: "0 auto 20px",
              boxShadow: "0 8px 32px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}>
              ◈
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--silver-800)", letterSpacing: "-1px", marginBottom: 8 }}>LifeOS</div>
            <div style={{ fontSize: 16, color: "var(--silver-400)", marginBottom: 24 }}>Personal Digital Dashboard v1.0</div>
            <div style={{ fontSize: 14, color: "var(--silver-500)", lineHeight: 1.7, maxWidth: 400, margin: "0 auto 24px" }}>
              A beautiful, premium personal dashboard to manage your entire digital life in one place. Built with Apple-inspired skeuomorphic design.
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <span className="badge badge-blue">Next.js 16</span>
              <span className="badge badge-purple">PostgreSQL</span>
              <span className="badge badge-green">Drizzle ORM</span>
              <span className="badge badge-gray">TypeScript</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
