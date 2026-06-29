"use client";

import { ActivePage, Profile } from "@/lib/types";
import { getInitials } from "@/lib/utils";

interface NavItem {
  id: ActivePage;
  label: string;
  icon: string;
  color: string;
}

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Home",
    items: [{ id: "dashboard", label: "Dashboard", icon: "⊞", color: "#3b82f6" }],
  },
  {
    title: "Manage",
    items: [
      { id: "social", label: "Social Media", icon: "📱", color: "#ec4899" },
      { id: "contacts", label: "Contacts", icon: "👥", color: "#8b5cf6" },
      { id: "bios", label: "Bio Manager", icon: "📝", color: "#06b6d4" },
      { id: "assets", label: "Profile Assets", icon: "🖼️", color: "#f59e0b" },
      { id: "passwords", label: "Password Vault", icon: "🔐", color: "#ef4444" },
      { id: "documents", label: "Documents", icon: "📁", color: "#10b981" },
      { id: "notes", label: "Notes", icon: "🗒️", color: "#f97316" },
      { id: "todos", label: "Todo Manager", icon: "✅", color: "#22c55e" },
    ],
  },
  {
    title: "Brand",
    items: [
      { id: "brand", label: "Brand Kit", icon: "🎨", color: "#a855f7" },
      { id: "quickcopy", label: "Quick Copy", icon: "⚡", color: "#eab308" },
      { id: "quicklaunch", label: "Quick Launch", icon: "🚀", color: "#3b82f6" },
    ],
  },
  {
    title: "Tools",
    items: [
      { id: "search", label: "Search", icon: "🔍", color: "#64748b" },
      { id: "settings", label: "Settings", icon: "⚙️", color: "#6b7280" },
    ],
  },
];

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  theme: "light" | "dark";
}

export default function Sidebar({ activePage, onNavigate, isOpen, onClose, profile }: SidebarProps) {
  const handleNav = (page: ActivePage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 99,
            display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <span style={{ fontSize: 20 }}>◈</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.5px", color: "var(--silver-800)" }}>
              LifeOS
            </div>
            <div style={{ fontSize: 11, color: "var(--silver-400)", fontWeight: 500 }}>
              Personal Dashboard
            </div>
          </div>
        </div>

        {/* Profile mini card */}
        {profile && (
          <div
            style={{
              margin: "12px",
              padding: "10px 12px",
              borderRadius: 14,
              background: "linear-gradient(145deg, rgba(59,130,246,0.08), rgba(59,130,246,0.04))",
              border: "1px solid rgba(59,130,246,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={() => handleNav("settings")}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: profile.avatar
                  ? `url(${profile.avatar}) center/cover`
                  : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
              }}
            >
              {!profile.avatar && getInitials(profile.name || "?")}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--silver-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.name || "Set up profile"}
              </div>
              <div style={{ fontSize: 11, color: "var(--silver-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.title || "Click to edit"}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? "active" : ""}`}
                  onClick={() => handleNav(item.id)}
                  style={{ width: "100%", textAlign: "left", background: "none", border: "1px solid transparent", cursor: "pointer" }}
                >
                  <span
                    className="nav-item-icon"
                    style={{
                      background: activePage === item.id
                        ? `${item.color}20`
                        : "rgba(0,0,0,0.04)",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          fontSize: 11,
          color: "var(--silver-400)",
          textAlign: "center",
        }}>
          LifeOS v1.0 · Your Digital Life
        </div>
      </aside>
    </>
  );
}
