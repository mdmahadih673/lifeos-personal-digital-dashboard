"use client";

import { useState, useEffect, useCallback } from "react";
import { ActivePage, Profile } from "@/lib/types";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Toast, { ToastMessage, showToast } from "./Toast";
import Dashboard from "./pages/Dashboard";
import SocialManager from "./pages/SocialManager";
import ContactManager from "./pages/ContactManager";
import BioManager from "./pages/BioManager";
import ProfileAssets from "./pages/ProfileAssets";
import PasswordVault from "./pages/PasswordVault";
import DocumentsPage from "./pages/DocumentsPage";
import NotesPage from "./pages/NotesPage";
import TodoManager from "./pages/TodoManager";
import BrandKit from "./pages/BrandKit";
import QuickCopyCenter from "./pages/QuickCopyCenter";
import QuickLaunch from "./pages/QuickLaunch";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";

export default function LifeOSApp() {
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load profile and theme
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        if (data.theme === "dark") {
          setTheme("dark");
          document.documentElement.setAttribute("data-theme", "dark");
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty("--accent", data.accentColor);
          document.documentElement.style.setProperty("--blue-mid", data.accentColor);
        }
      })
      .catch(() => {});

    // Load theme from localStorage as fallback
    const savedTheme = localStorage.getItem("lifeos-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("lifeos-theme", newTheme);
    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastMessage["type"] = "success") => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  // Make showToast global
  useEffect(() => {
    showToast.current = addToast;
  }, [addToast]);

  const handleProfileUpdate = useCallback((updated: Profile) => {
    setProfile(updated);
    if (updated.accentColor) {
      document.documentElement.style.setProperty("--accent", updated.accentColor);
      document.documentElement.style.setProperty("--blue-mid", updated.accentColor);
    }
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setActivePage("search");
    }
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <Dashboard
            profile={profile}
            onNavigate={setActivePage}
            onToast={addToast}
          />
        );
      case "social":
        return <SocialManager onToast={addToast} />;
      case "contacts":
        return <ContactManager onToast={addToast} />;
      case "bios":
        return <BioManager onToast={addToast} />;
      case "assets":
        return <ProfileAssets onToast={addToast} />;
      case "passwords":
        return <PasswordVault onToast={addToast} />;
      case "documents":
        return <DocumentsPage onToast={addToast} />;
      case "notes":
        return <NotesPage onToast={addToast} />;
      case "todos":
        return <TodoManager onToast={addToast} />;
      case "brand":
        return <BrandKit onToast={addToast} />;
      case "quickcopy":
        return <QuickCopyCenter onToast={addToast} />;
      case "quicklaunch":
        return <QuickLaunch onToast={addToast} />;
      case "search":
        return <SearchPage initialQuery={searchQuery} onNavigate={setActivePage} onToast={addToast} />;
      case "settings":
        return (
          <SettingsPage
            theme={theme}
            onThemeChange={handleThemeChange}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            onToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        profile={profile}
        theme={theme}
      />

      <div className="main-content" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar
          activePage={activePage}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onThemeToggle={() => handleThemeChange(theme === "light" ? "dark" : "light")}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <div className="page-content" style={{ flex: 1 }}>
          {renderPage()}
        </div>
      </div>

      <Toast toasts={toasts} onRemove={(id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </div>
  );
}
