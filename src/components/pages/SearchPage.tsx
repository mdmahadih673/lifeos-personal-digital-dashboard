"use client";

import { useState, useEffect, useCallback } from "react";
import { ActivePage } from "@/lib/types";
import { debounce } from "@/lib/utils";

interface SearchResult {
  type: string;
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

interface Props {
  initialQuery: string;
  onNavigate: (page: ActivePage) => void;
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const TYPE_TO_PAGE: Record<string, ActivePage> = {
  social: "social",
  contact: "contacts",
  note: "notes",
  password: "passwords",
  todo: "todos",
  bio: "bios",
  document: "documents",
};

export default function SearchPage({ initialQuery, onNavigate }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(
    debounce(async (q: string) => {
      if (!q || q.trim().length < 2) { setResults([]); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch { setResults([]); }
      setLoading(false);
    }, 300),
    []
  );

  useEffect(() => {
    doSearch(query);
  }, [query, doSearch]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">🔍 Search</div>
          <div className="section-subtitle">Search across all your data</div>
        </div>
      </div>

      {/* Search input */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 20 }}>🔍</span>
        <input
          className="skeu-input"
          style={{ paddingLeft: 50, paddingTop: 14, paddingBottom: 14, fontSize: 16, borderRadius: 16 }}
          placeholder="Type to search everything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "var(--silver-400)" }}
            onClick={() => { setQuery(""); setResults([]); }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{ animation: "pulse-soft 1s infinite" }}>🔍</div>
          <div className="empty-state-title">Searching...</div>
        </div>
      ) : !query || query.trim().length < 2 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Start typing to search</div>
          <div className="empty-state-text">Search across social accounts, contacts, notes, passwords, todos, and bios</div>
          <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            {["social", "contacts", "notes", "passwords", "todos", "bios"].map((section) => (
              <button key={section} className="skeu-btn skeu-btn-sm" onClick={() => onNavigate(section as ActivePage)}>
                Browse {section}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😶</div>
          <div className="empty-state-title">No results for "{query}"</div>
          <div className="empty-state-text">Try a different search term or browse a specific section</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 14, color: "var(--silver-400)", fontWeight: 500 }}>
            Found <strong style={{ color: "var(--silver-700)" }}>{results.length}</strong> results for "{query}"
          </div>
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--silver-600)", textTransform: "capitalize" }}>
                  {items[0].icon} {type}s
                </div>
                <div className="badge badge-blue">{items.length}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {items.map((result) => (
                  <div
                    key={result.id}
                    className="skeu-card"
                    style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
                    onClick={() => onNavigate(TYPE_TO_PAGE[result.type] || "dashboard")}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--silver-200), var(--silver-100))",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
                      boxShadow: "var(--btn-shadow)",
                    }}>
                      {result.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--silver-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--silver-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {result.subtitle}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, color: "var(--silver-300)" }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
