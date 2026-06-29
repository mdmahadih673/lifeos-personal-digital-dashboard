"use client";

import { useState, useEffect } from "react";
import { BrandKit as BrandKitType } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const FONT_OPTIONS = [
  "Inter", "SF Pro Display", "Helvetica Neue", "Roboto", "Poppins",
  "Montserrat", "Open Sans", "Lato", "Nunito", "Raleway",
  "Playfair Display", "Merriweather", "Georgia", "Courier New",
];

export default function BrandKit({ onToast }: Props) {
  const [brand, setBrand] = useState<Partial<BrandKitType>>({
    brandName: "",
    tagline: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
    headingFont: "Inter",
    bodyFont: "Inter",
    businessEmail: "",
    website: "",
    businessInfo: "",
    socialLinks: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/brand")
      .then((r) => r.json())
      .then((data) => {
        if (data) setBrand(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!brand.brandName?.trim()) { onToast("Brand name required", "error"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brand),
      });
      const data = await res.json();
      setBrand(data);
      onToast("Brand Kit saved!", "success");
    } catch {
      onToast("Failed to save", "error");
    }
    setSaving(false);
  };

  const updateSocialLink = (platform: string, value: string) => {
    setBrand((prev) => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks || {}), [platform]: value },
    }));
  };

  if (loading) {
    return <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>;
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Brand Kit</div>
          <div className="section-subtitle">Your brand identity in one place</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Brand Kit"}
        </button>
      </div>

      {/* Preview Card */}
      <div className="skeu-card" style={{ padding: "32px", marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 6,
          background: `linear-gradient(90deg, ${brand.primaryColor}, ${brand.secondaryColor}, ${brand.accentColor})`,
        }} />
        {brand.logoUrl && (
          <img src={brand.logoUrl} alt="Logo" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "contain", margin: "0 auto 16px", display: "block", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        )}
        <div style={{ fontSize: 32, fontWeight: 800, color: brand.primaryColor || "#3b82f6", letterSpacing: "-1px", fontFamily: brand.headingFont ?? undefined }}>
          {brand.brandName || "Your Brand Name"}
        </div>
        {brand.tagline && (
          <div style={{ fontSize: 16, color: "var(--silver-500)", marginTop: 8, fontFamily: brand.bodyFont ?? undefined }}>{brand.tagline}</div>
        )}
        {/* Color swatches */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
          {[brand.primaryColor, brand.secondaryColor, brand.accentColor].map((c, i) => c && (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: c,
                margin: "0 auto 6px",
                boxShadow: `0 4px 12px ${c}50`,
                cursor: "pointer",
              }}
                onClick={() => copyToClipboard(c).then(() => onToast(`Color ${c} copied!`, "success"))}
              />
              <div style={{ fontSize: 11, color: "var(--silver-400)", fontFamily: "monospace" }}>{c}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Brand Info */}
        <div className="skeu-card" style={{ padding: "24px" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--silver-800)" }}>🏷️ Brand Identity</div>
          <div className="form-group">
            <label className="form-label">Brand Name *</label>
            <input className="skeu-input" placeholder="Acme Corp" value={brand.brandName || ""} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input className="skeu-input" placeholder="Just do it" value={brand.tagline || ""} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Logo URL</label>
            <input className="skeu-input" placeholder="https://..." value={brand.logoUrl || ""} onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Email</label>
            <input className="skeu-input" placeholder="hello@brand.com" value={brand.businessEmail || ""} onChange={(e) => setBrand({ ...brand, businessEmail: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input className="skeu-input" placeholder="https://brand.com" value={brand.website || ""} onChange={(e) => setBrand({ ...brand, website: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Business Info</label>
            <textarea className="skeu-input skeu-textarea" placeholder="About your brand..." value={brand.businessInfo || ""} onChange={(e) => setBrand({ ...brand, businessInfo: e.target.value })} />
          </div>
        </div>

        {/* Colors & Fonts */}
        <div>
          <div className="skeu-card" style={{ padding: "24px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--silver-800)" }}>🎨 Brand Colors</div>
            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={brand.primaryColor || "#3b82f6"} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer", padding: 2, background: "var(--silver-100)", boxShadow: "var(--btn-shadow)" }} />
                <input className="skeu-input" value={brand.primaryColor || "#3b82f6"} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} style={{ fontFamily: "monospace" }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Secondary Color</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={brand.secondaryColor || "#64748b"} onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer", padding: 2, background: "var(--silver-100)", boxShadow: "var(--btn-shadow)" }} />
                <input className="skeu-input" value={brand.secondaryColor || "#64748b"} onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })} style={{ fontFamily: "monospace" }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Accent Color</label>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={brand.accentColor || "#f59e0b"} onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                  style={{ width: 44, height: 44, border: "none", borderRadius: 10, cursor: "pointer", padding: 2, background: "var(--silver-100)", boxShadow: "var(--btn-shadow)" }} />
                <input className="skeu-input" value={brand.accentColor || "#f59e0b"} onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })} style={{ fontFamily: "monospace" }} />
              </div>
            </div>
          </div>

          <div className="skeu-card" style={{ padding: "24px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--silver-800)" }}>🔤 Fonts</div>
            <div className="form-group">
              <label className="form-label">Heading Font</label>
              <select className="skeu-input skeu-select" value={brand.headingFont ?? "Inter"} onChange={(e) => setBrand({ ...brand, headingFont: e.target.value })}>
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Body Font</label>
              <select className="skeu-input skeu-select" value={brand.bodyFont ?? "Inter"} onChange={(e) => setBrand({ ...brand, bodyFont: e.target.value })}>
                {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="skeu-card" style={{ padding: "24px" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "var(--silver-800)" }}>🔗 Social Links</div>
            {["Instagram", "Twitter", "LinkedIn", "GitHub", "YouTube"].map((platform) => (
              <div key={platform} className="form-group">
                <label className="form-label">{platform}</label>
                <input className="skeu-input" placeholder={`https://${platform.toLowerCase()}.com/...`}
                  value={brand.socialLinks?.[platform] || ""}
                  onChange={(e) => updateSocialLink(platform, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
