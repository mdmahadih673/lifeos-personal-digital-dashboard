"use client";

import { ActivePage } from "@/lib/types";

const PAGE_TITLES: Record<ActivePage, string> = {
  dashboard: "Dashboard",
  social: "Social Media Manager",
  contacts: "Contact Manager",
  bios: "Bio Manager",
  assets: "Profile Assets",
  passwords: "Password Vault",
  documents: "Documents",
  notes: "Notes",
  todos: "Todo Manager",
  brand: "Brand Kit",
  quickcopy: "Quick Copy Center",
  quicklaunch: "Quick Launch",
  search: "Search",
  settings: "Settings",
};

interface TopBarProps {
  activePage: ActivePage;
  onMenuToggle: () => void;
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onSearch: (q: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function TopBar({
  activePage,
  onMenuToggle,
  theme,
  onThemeToggle,
  onSearch,
  searchQuery,
  setSearchQuery,
}: TopBarProps) {
  return (
    <header className="topbar">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="skeu-btn skeu-btn-icon"
        style={{ display: "none" }}
        aria-label="Menu"
      >
        ☰
      </button>

      {/* Page title */}
      <div style={{ fontWeight: 700, fontSize: 17, color: "var(--silver-800)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
        {PAGE_TITLES[activePage]}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="search-wrapper">
        <span className="search-icon" style={{ fontSize: 14 }}>🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Search everything..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && searchQuery.trim()) {
              onSearch(searchQuery);
            }
          }}
        />
      </div>

      {/* Theme toggle */}
      <button
        className="skeu-btn skeu-btn-icon tooltip"
        onClick={onThemeToggle}
        data-tip={theme === "light" ? "Dark mode" : "Light mode"}
        aria-label="Toggle theme"
        style={{ fontSize: 16 }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </header>
  );
}
