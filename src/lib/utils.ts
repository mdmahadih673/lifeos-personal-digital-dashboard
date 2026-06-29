export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  // Fallback
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.appendChild(el);
  el.select();
  const result = document.execCommand("copy");
  document.body.removeChild(el);
  return Promise.resolve(result);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function getPlatformEmoji(platform: string): string {
  const map: Record<string, string> = {
    facebook: "👥",
    instagram: "📸",
    threads: "🧵",
    tiktok: "🎵",
    youtube: "▶️",
    twitter: "🐦",
    x: "✖️",
    linkedin: "💼",
    github: "💻",
    discord: "🎮",
    telegram: "✈️",
    whatsapp: "💬",
    pinterest: "📌",
    reddit: "🔥",
    snapchat: "👻",
    behance: "🎨",
    dribbble: "🏀",
    medium: "📰",
    portfolio: "🌐",
  };
  return map[platform.toLowerCase()] || "🌐";
}

export function getDocumentIcon(type: string): string {
  const map: Record<string, string> = {
    resume: "📄",
    cv: "📋",
    certificate: "🏆",
    pdf: "📕",
    image: "🖼️",
    video: "🎬",
    zip: "📦",
    other: "📁",
    folder: "📂",
  };
  return map[type.toLowerCase()] || "📄";
}

export function getPriorityColor(priority: string | null | undefined): string {
  switch (priority) {
    case "high": return "#dc2626";
    case "medium": return "#d97706";
    case "low": return "#16a34a";
    default: return "#6b7280";
  }
}

export function getNoteColor(color: string | null | undefined): string {
  return color || "#ffffff";
}

export function generateAvatar(name: string, size = 40): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b",
    "#10b981", "#ef4444", "#6366f1", "#14b8a6",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  const color = colors[idx];
  const initials = getInitials(name);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}"/><text x="${size/2}" y="${size/2 + size*0.14}" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size * 0.38}" font-weight="600" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export const PLATFORMS = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "threads", label: "Threads" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "discord", label: "Discord" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "pinterest", label: "Pinterest" },
  { value: "reddit", label: "Reddit" },
  { value: "snapchat", label: "Snapchat" },
  { value: "behance", label: "Behance" },
  { value: "dribbble", label: "Dribbble" },
  { value: "medium", label: "Medium" },
  { value: "portfolio", label: "Portfolio" },
];

export const BIO_PLATFORMS = [
  "Instagram",
  "Facebook",
  "GitHub",
  "LinkedIn",
  "Twitter",
  "Business",
  "Gaming",
  "Portfolio",
];

export const CONTACT_CATEGORIES = ["personal", "business", "emergency", "family", "friends"];
export const NOTE_CATEGORIES = ["general", "ideas", "content-ideas", "project-ideas", "business"];
export const DOC_TYPES = ["resume", "cv", "certificate", "pdf", "image", "video", "zip", "other"];
export const ASSET_TYPES = ["photo", "cover", "logo", "brand", "qr", "watermark", "thumbnail"];
export const PASSWORD_CATEGORIES = ["general", "social", "email", "banking", "work", "shopping"];
export const TODO_PRIORITIES = ["high", "medium", "low"];
export const TODO_CATEGORIES = ["general", "work", "personal", "shopping", "health"];
