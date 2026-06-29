"use client";

import { useState, useEffect, useCallback } from "react";
import { Contact } from "@/lib/types";
import { CONTACT_CATEGORIES, copyToClipboard, getInitials } from "@/lib/utils";

interface Props {
  onToast: (msg: string, type?: "success" | "error" | "info" | "warning") => void;
}

const EMPTY: Partial<Contact> = {
  fullName: "",
  category: "personal",
  phone: "",
  whatsapp: "",
  telegram: "",
  discord: "",
  email: "",
  businessEmail: "",
  address: "",
  website: "",
  notes: "",
};

const CAT_COLORS: Record<string, string> = {
  personal: "#3b82f6",
  business: "#8b5cf6",
  emergency: "#ef4444",
  family: "#f59e0b",
  friends: "#22c55e",
};

const CAT_ICONS: Record<string, string> = {
  personal: "👤",
  business: "💼",
  emergency: "🚨",
  family: "👨‍👩‍👧",
  friends: "👫",
};

export default function ContactManager({ onToast }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Contact>>(EMPTY);
  const [isEdit, setIsEdit] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/contacts")
      .then((r) => r.json())
      .then((data) => { setContacts(data); setLoading(false); })
      .catch(() => { onToast("Failed to load contacts", "error"); setLoading(false); });
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditing(EMPTY); setIsEdit(false); setShowModal(true); };
  const openEdit = (c: Contact) => { setEditing(c); setIsEdit(true); setShowModal(true); };

  const save = async () => {
    if (!editing.fullName?.trim()) { onToast("Name is required", "error"); return; }
    try {
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch("/api/contacts", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = await res.json();
      if (isEdit) {
        setContacts((prev) => prev.map((c) => (c.id === data.id ? data : c)));
        onToast("Contact updated!", "success");
      } else {
        setContacts((prev) => [data, ...prev]);
        onToast("Contact added!", "success");
      }
      setShowModal(false);
    } catch { onToast("Failed to save", "error"); }
  };

  const deleteContact = async (id: number) => {
    if (!confirm("Delete this contact?")) return;
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
    onToast("Contact deleted", "info");
  };

  const filtered = contacts.filter((c) => {
    const mf = filter === "all" || c.category === filter || (filter === "favorites" && c.isFavorite);
    const ms = !search || c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search);
    return mf && ms;
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <div className="section-title">Contact Manager</div>
          <div className="section-subtitle">{contacts.length} contacts</div>
        </div>
        <button className="skeu-btn skeu-btn-primary" onClick={openAdd}>+ Add Contact</button>
      </div>

      {/* Category Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", "favorites", ...CONTACT_CATEGORIES].map((f) => (
          <button
            key={f}
            className={`tag ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "favorites" ? "⭐ Favorites" : `${CAT_ICONS[f]} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
        <input className="skeu-input" style={{ paddingLeft: 38 }} placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-title">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No contacts found</div>
          <button className="skeu-btn skeu-btn-primary" style={{ marginTop: 16 }} onClick={openAdd}>+ Add Contact</button>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((c) => (
            <ContactCard key={c.id} contact={c} onEdit={openEdit} onDelete={deleteContact}
              onCopy={(v, l) => copyToClipboard(v).then(() => onToast(`${l} copied!`, "success"))} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="modal-title">{isEdit ? "Edit Contact" : "Add Contact"}</div>
              <button className="skeu-btn skeu-btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Full Name *</label>
                  <input className="skeu-input" placeholder="John Doe" value={editing.fullName || ""}
                    onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Category</label>
                  <select className="skeu-input skeu-select" value={editing.category || "personal"}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                    {CONTACT_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="skeu-input" placeholder="+1 (555) 000-0000" value={editing.phone || ""}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">WhatsApp</label>
                  <input className="skeu-input" placeholder="+1..." value={editing.whatsapp || ""}
                    onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telegram</label>
                  <input className="skeu-input" placeholder="@telegram" value={editing.telegram || ""}
                    onChange={(e) => setEditing({ ...editing, telegram: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Discord</label>
                  <input className="skeu-input" placeholder="user#1234" value={editing.discord || ""}
                    onChange={(e) => setEditing({ ...editing, discord: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="skeu-input" placeholder="email@example.com" value={editing.email || ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Email</label>
                  <input className="skeu-input" placeholder="work@company.com" value={editing.businessEmail || ""}
                    onChange={(e) => setEditing({ ...editing, businessEmail: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Address</label>
                  <input className="skeu-input" placeholder="123 Main St..." value={editing.address || ""}
                    onChange={(e) => setEditing({ ...editing, address: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Website</label>
                  <input className="skeu-input" placeholder="https://..." value={editing.website || ""}
                    onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
                </div>
                <div className="form-group" style={{ gridColumn: "1/-1" }}>
                  <label className="form-label">Notes</label>
                  <textarea className="skeu-input skeu-textarea" placeholder="Notes..." value={editing.notes || ""}
                    onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
                </div>
              </div>
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

function ContactCard({ contact, onEdit, onDelete, onCopy }: {
  contact: Contact;
  onEdit: (c: Contact) => void;
  onDelete: (id: number) => void;
  onCopy: (v: string, l: string) => void;
}) {
  const catColor = CAT_COLORS[contact.category || "personal"] || "#3b82f6";
  return (
    <div className="skeu-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${catColor}aa, ${catColor})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 16,
          boxShadow: `0 2px 8px ${catColor}40`,
        }}>
          {getInitials(contact.fullName)}
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--silver-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {contact.fullName}
          </div>
          <span className="badge badge-blue" style={{ background: `${catColor}18`, color: catColor }}>
            {CAT_ICONS[contact.category || "personal"]} {contact.category}
          </span>
        </div>
        {contact.isFavorite && <span>⭐</span>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {contact.phone && <InfoRow icon="📞" value={contact.phone} />}
        {contact.email && <InfoRow icon="📧" value={contact.email} />}
        {contact.whatsapp && <InfoRow icon="💬" value={contact.whatsapp} />}
        {contact.telegram && <InfoRow icon="✈️" value={contact.telegram} />}
        {contact.discord && <InfoRow icon="🎮" value={contact.discord} />}
        {contact.website && <InfoRow icon="🌐" value={contact.website} />}
        {contact.address && <InfoRow icon="📍" value={contact.address} />}
      </div>

      {contact.notes && (
        <div style={{ fontSize: 12, color: "var(--silver-400)", marginBottom: 12, fontStyle: "italic" }}>
          {contact.notes}
        </div>
      )}

      <div className="divider" />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="skeu-btn skeu-btn-sm skeu-btn-success">
            📞 Call
          </a>
        )}
        {contact.whatsapp && (
          <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
            className="skeu-btn skeu-btn-sm skeu-btn-success">
            💬 WA
          </a>
        )}
        {contact.telegram && (
          <a href={`https://t.me/${contact.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
            className="skeu-btn skeu-btn-sm">
            ✈️ TG
          </a>
        )}
        {contact.phone && (
          <button className="skeu-btn skeu-btn-sm" onClick={() => onCopy(contact.phone!, "Phone")}>⎘</button>
        )}
        <button className="skeu-btn skeu-btn-sm" onClick={() => onEdit(contact)}>✏️</button>
        <button className="skeu-btn skeu-btn-sm skeu-btn-danger" onClick={() => onDelete(contact.id)}>🗑️</button>
      </div>
    </div>
  );
}

function InfoRow({ icon, value }: { icon: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 13, width: 18 }}>{icon}</span>
      <span style={{ fontSize: 12, color: "var(--silver-600)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
