export type Theme = "light" | "dark";

export interface Profile {
  id: number;
  name: string;
  avatar?: string | null;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  bio?: string | null;
  accentColor?: string | null;
  theme?: string | null;
}

export interface SocialAccount {
  id: number;
  platform: string;
  username: string;
  displayName?: string | null;
  profileUrl?: string | null;
  profilePicture?: string | null;
  bio?: string | null;
  notes?: string | null;
  isFavorite?: boolean | null;
  createdAt?: Date | null;
}

export interface Contact {
  id: number;
  fullName: string;
  category?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  telegram?: string | null;
  discord?: string | null;
  email?: string | null;
  businessEmail?: string | null;
  address?: string | null;
  website?: string | null;
  avatar?: string | null;
  notes?: string | null;
  isFavorite?: boolean | null;
}

export interface Bio {
  id: number;
  platform: string;
  content: string;
  isFavorite?: boolean | null;
  tags?: string[] | null;
}

export interface ProfileAsset {
  id: number;
  name: string;
  type: string;
  url: string;
  size?: number | null;
  isFavorite?: boolean | null;
  tags?: string[] | null;
}

export interface Password {
  id: number;
  website: string;
  websiteUrl?: string | null;
  username: string;
  password: string;
  recoveryEmail?: string | null;
  backupCodes?: string | null;
  twoFactorNotes?: string | null;
  category?: string | null;
  isFavorite?: boolean | null;
}

export interface Document {
  id: number;
  name: string;
  type: string;
  url?: string | null;
  content?: string | null;
  size?: number | null;
  folderId?: number | null;
  isFavorite?: boolean | null;
  tags?: string[] | null;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  isPinned?: boolean | null;
  isFavorite?: boolean | null;
  color?: string | null;
  tags?: string[] | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

export interface Todo {
  id: number;
  title: string;
  description?: string | null;
  priority?: string | null;
  dueDate?: string | null;
  reminder?: string | null;
  isCompleted?: boolean | null;
  category?: string | null;
  tags?: string[] | null;
}

export interface BrandKit {
  id: number;
  brandName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  headingFont?: string | null;
  bodyFont?: string | null;
  businessEmail?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  businessInfo?: string | null;
}

export interface QuickCopyItem {
  id: number;
  label: string;
  value: string;
  icon?: string | null;
  category?: string | null;
  sortOrder?: number | null;
}

export interface FavoriteApp {
  id: number;
  name: string;
  url: string;
  icon?: string | null;
  color?: string | null;
  category?: string | null;
  sortOrder?: number | null;
  isQuickLaunch?: boolean | null;
  recentlyUsed?: boolean | null;
  lastUsed?: Date | null;
}

export type ActivePage =
  | "dashboard"
  | "social"
  | "contacts"
  | "bios"
  | "assets"
  | "passwords"
  | "documents"
  | "notes"
  | "todos"
  | "brand"
  | "quickcopy"
  | "quicklaunch"
  | "search"
  | "settings";
