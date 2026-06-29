"use client";

import { useState, useEffect } from "react";
import { ActivePage, Profile, Todo, SocialAccount, Note } from "@/lib/types";
import { getInitials, copyToClipboard } from "@/lib/utils";

interface DashboardProps {
  profile: Profile | null;
  onNavigate: (page: ActivePage) => void;
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const QUICK_APPS = [
  { name: "Facebook", url: "https://facebook.com", icon: "👥", color: "#1877f2" },
  { name: "Instagram", url: "https://instagram.com", icon: "📸", color: "#e1306c" },
  { name: "YouTube", url: "https://youtube.com", icon: "▶️", color: "#ff0000" },
  { name: "GitHub", url: "https://github.com", icon: "💻", color: "#24292e" },
  { name: "LinkedIn", url: "https://linkedin.com", icon: "💼", color: "#0077b5" },
  { name: "WhatsApp", url: "https://web.whatsapp.com", icon: "💬", color: "#25d366" },
  { name: "Telegram", url: "https://web.telegram.org", icon: "✈️", color: "#0088cc" },
  { name: "Discord", url: "https://discord.com", icon: "🎮", color: "#5865f2" },
  { name: "Gmail", url: "https://gmail.com", icon: "📧", color: "#ea4335" },
  { name: "Drive", url: "https://drive.google.com", icon: "☁️", color: "#4285f4" },
  { name: "ChatGPT", url: "https://chatgpt.com", icon: "🤖", color: "#10a37f" },
  { name: "Portfolio", url: "#", icon: "🌐", color: "#667eea" },
];

const STAT_CARDS = [
  { label: "Social Accounts", icon: "📱", key: "social", color: "#ec4899" },
  { label: "Contacts", icon: "👥", key: "contacts", color: "#8b5cf6" },
  { label: "Notes", icon: "📝", key: "notes", color: "#f59e0b" },
  { label: "Passwords", icon: "🔐", key: "passwords", color: "#ef4444" },
  { label: "Todos", icon: "✅", key: "todos", color: "#22c55e" },
  { label: "Documents", icon: "📁", key: "documents", color: "#10b981" },
];

export default function Dashboard({ profile, onNavigate, onToast }: DashboardProps) {
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTodos, setRecentTodos] = useState<Todo[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [recentSocial, setRecentSocial] = useState<SocialAccount[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load stats
    const endpoints = [
      { key: "social", url: "/api/social" },
      { key: "contacts", url: "/api/contacts" },
      { key: "notes", url: "/api/notes" },
      { key: "passwords", url: "/api/passwords" },
      { key: "todos", url: "/api/todos" },
      { key: "documents", url: "/api/documents" },
    ];

    endpoints.forEach(({ key, url }) => {
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setStats((prev) => ({ ...prev, [key]: data.length }));
            if (key === "todos") setRecentTodos(data.slice(0, 3));
            if (key === "notes") setRecentNotes(data.slice(0, 3));
            if (key === "social") setRecentSocial(data.slice(0, 4));
          }
        })
        .catch(() => {});
    });
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleCopy = (text: string, label: string) => {
    copyToClipboard(text).then(() => onToast(`${label} copied!`, "success"));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome + Date Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Welcome Card */}
        <div
          className="skeu-card"
          style={{
            padding: "28px 28px",
            background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #6366f1 100%)",
            border: "1px solid rgba(255,255,255,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -20, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: -40, left: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: profile?.avatar ? `url(${profile.avatar}) center/cover` : "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              fontWeight: 800,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
              border: "2px solid rgba(255,255,255,0.3)",
              flexShrink: 0,
            }}>
              {!profile?.avatar && getInitials(profile?.name || "?")}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500 }}>{greeting()},</div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
                {profile?.name || "Welcome!"}
              </div>
              {profile?.title && (
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{profile.title}</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
            {profile?.email && (
              <div
                onClick={() => handleCopy(profile.email!, "Email")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.15)",
                  padding: "6px 12px",
                  borderRadius: 99,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.9)",
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  transition: "background 0.15s ease",
                }}
              >
                <span>📧</span> {profile.email}
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div
          className="skeu-card"
          style={{
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: "-2px",
            color: "var(--silver-800)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum"',
          }}>
            {timeStr.split(" ")[0]}
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 500,
            color: "var(--blue-mid)",
            marginTop: 4,
            letterSpacing: 2,
          }}>
            {timeStr.split(" ")[1]}
          </div>
          <div style={{
            marginTop: 12,
            fontSize: 14,
            color: "var(--silver-500)",
            fontWeight: 500,
          }}>
            {dateStr}
          </div>
          <div style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
          }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d, i) => (
              <div key={d} style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 600,
                background: now.getDay() === i ? "var(--blue-mid)" : "var(--silver-200)",
                color: now.getDay() === i ? "white" : "var(--silver-500)",
                boxShadow: now.getDay() === i ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
              }}>
                {d[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">Overview</div>
            <div className="section-subtitle">Your data at a glance</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
          {STAT_CARDS.map((card) => (
            <div
              key={card.key}
              className="stat-card"
              onClick={() => onNavigate(card.key as ActivePage)}
              style={{ cursor: "pointer", textAlign: "center", padding: "20px 12px" }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `${card.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                margin: "0 auto 10px",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 2px 8px ${card.color}20`,
              }}>
                {card.icon}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: card.color, lineHeight: 1 }}>
                {stats[card.key] ?? 0}
              </div>
              <div style={{ fontSize: 11, color: "var(--silver-400)", marginTop: 4, fontWeight: 600 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch Apps */}
      <div>
        <div className="section-header">
          <div>
            <div className="section-title">Quick Launch</div>
            <div className="section-subtitle">Open your favorite apps instantly</div>
          </div>
          <button className="skeu-btn skeu-btn-sm" onClick={() => onNavigate("quicklaunch")}>
            Manage →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px,1fr))", gap: 16 }}>
          {QUICK_APPS.map((app) => (
            <div
              key={app.name}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
            >
              <div
                className="app-icon"
                onClick={() => window.open(app.url, "_blank")}
                style={{
                  background: `linear-gradient(145deg, ${app.color}dd, ${app.color})`,
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  fontSize: 26,
                }}
              >
                {app.icon}
              </div>
              <span style={{ fontSize: 11, color: "var(--silver-500)", fontWeight: 600, textAlign: "center" }}>
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        {/* Recent Social */}
        <div className="skeu-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>📱 Social</div>
            <button className="skeu-btn skeu-btn-sm" onClick={() => onNavigate("social")}>View all</button>
          </div>
          {recentSocial.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--silver-400)", fontSize: 13 }}>
              No accounts yet
            </div>
          ) : (
            recentSocial.map((acc) => (
              <div key={acc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--silver-100)" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--silver-200)",
                }}>
                  {acc.platform === "instagram" ? "📸" : acc.platform === "github" ? "💻" : acc.platform === "twitter" ? "🐦" : "📱"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--silver-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    @{acc.username}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--silver-400)", textTransform: "capitalize" }}>{acc.platform}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Todos */}
        <div className="skeu-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>✅ Tasks</div>
            <button className="skeu-btn skeu-btn-sm" onClick={() => onNavigate("todos")}>View all</button>
          </div>
          {recentTodos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--silver-400)", fontSize: 13 }}>
              No tasks yet
            </div>
          ) : (
            recentTodos.map((todo) => (
              <div key={todo.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--silver-100)" }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, marginTop: 1,
                  background: todo.isCompleted ? "#22c55e" : "var(--silver-200)",
                  border: `2px solid ${todo.isCompleted ? "#22c55e" : "var(--silver-300)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 10, color: "white",
                }}>
                  {todo.isCompleted && "✓"}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500, color: todo.isCompleted ? "var(--silver-400)" : "var(--silver-700)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    textDecoration: todo.isCompleted ? "line-through" : "none",
                  }}>
                    {todo.title}
                  </div>
                  <div style={{ fontSize: 11, color: todo.priority === "high" ? "#ef4444" : todo.priority === "medium" ? "#f59e0b" : "#22c55e" }}>
                    {todo.priority} priority
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Notes */}
        <div className="skeu-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>🗒️ Notes</div>
            <button className="skeu-btn skeu-btn-sm" onClick={() => onNavigate("notes")}>View all</button>
          </div>
          {recentNotes.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "var(--silver-400)", fontSize: 13 }}>
              No notes yet
            </div>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} style={{ padding: "8px 0", borderBottom: "1px solid var(--silver-100)" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginBottom: 2,
                }}>
                  {note.isPinned && <span style={{ fontSize: 10 }}>📌</span>}
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--silver-700)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.title}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--silver-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {note.content.substring(0, 50)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Copy Row */}
      <div className="skeu-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)" }}>⚡ Quick Copy</div>
            <div style={{ fontSize: 12, color: "var(--silver-400)" }}>One click to copy your info</div>
          </div>
          <button className="skeu-btn skeu-btn-sm" onClick={() => onNavigate("quickcopy")}>Manage</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 10 }}>
          {profile?.email && (
            <QuickCopyButton label="Email" value={profile.email} icon="📧" onCopy={handleCopy} />
          )}
          {profile?.phone && (
            <QuickCopyButton label="Phone" value={profile.phone} icon="📞" onCopy={handleCopy} />
          )}
          {profile?.website && (
            <QuickCopyButton label="Website" value={profile.website} icon="🌐" onCopy={handleCopy} />
          )}
          {!profile?.email && !profile?.phone && !profile?.website && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px", color: "var(--silver-400)", fontSize: 13 }}>
              Set up your profile to enable Quick Copy →
              <button className="skeu-btn skeu-btn-sm skeu-btn-primary" style={{ marginLeft: 10 }} onClick={() => onNavigate("settings")}>
                Setup Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickCopyButton({
  label, value, icon, onCopy,
}: {
  label: string;
  value: string;
  icon: string;
  onCopy: (v: string, l: string) => void;
}) {
  return (
    <div className="quick-copy-item" onClick={() => onCopy(value, label)} style={{ cursor: "pointer" }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: 11, color: "var(--silver-400)", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 13, color: "var(--silver-700)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value}
        </div>
      </div>
      <span style={{ fontSize: 12, opacity: 0.5 }}>⎘</span>
    </div>
  );
}
