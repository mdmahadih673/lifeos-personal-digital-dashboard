import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// User Profile
export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  avatar: text("avatar"),
  title: text("title"),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  location: text("location"),
  bio: text("bio"),
  accentColor: text("accent_color").default("#3b82f6"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Accounts
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  profileUrl: text("profile_url"),
  profilePicture: text("profile_picture"),
  bio: text("bio"),
  notes: text("notes"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  category: text("category").default("personal"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  telegram: text("telegram"),
  discord: text("discord"),
  email: text("email"),
  businessEmail: text("business_email"),
  address: text("address"),
  website: text("website"),
  avatar: text("avatar"),
  notes: text("notes"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bios
export const bios = pgTable("bios", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  isFavorite: boolean("is_favorite").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Profile Assets
export const profileAssets = pgTable("profile_assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // photo, cover, logo, brand, qr, watermark, thumbnail
  url: text("url").notNull(),
  size: integer("size"),
  isFavorite: boolean("is_favorite").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Passwords
export const passwords = pgTable("passwords", {
  id: serial("id").primaryKey(),
  website: text("website").notNull(),
  websiteUrl: text("website_url"),
  username: text("username").notNull(),
  password: text("password").notNull(),
  recoveryEmail: text("recovery_email"),
  backupCodes: text("backup_codes"),
  twoFactorNotes: text("two_factor_notes"),
  category: text("category").default("general"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // resume, cv, certificate, pdf, image, video, zip, other
  url: text("url"),
  content: text("content"),
  size: integer("size"),
  folderId: integer("folder_id"),
  isFavorite: boolean("is_favorite").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Folders
export const documentFolders = pgTable("document_folders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("#3b82f6"),
  icon: text("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notes
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  category: text("category").default("general"),
  isPinned: boolean("is_pinned").default(false),
  isFavorite: boolean("is_favorite").default(false),
  color: text("color").default("#ffffff"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Todos
export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // high, medium, low
  dueDate: text("due_date"),
  reminder: text("reminder"),
  isCompleted: boolean("is_completed").default(false),
  category: text("category").default("general"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand Kit
export const brandKit = pgTable("brand_kit", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull(),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#3b82f6"),
  secondaryColor: text("secondary_color").default("#64748b"),
  accentColor: text("accent_color").default("#f59e0b"),
  headingFont: text("heading_font").default("Inter"),
  bodyFont: text("body_font").default("Inter"),
  businessEmail: text("business_email"),
  website: text("website"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),
  businessInfo: text("business_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quick Copy Items
export const quickCopyItems = pgTable("quick_copy_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  icon: text("icon"),
  category: text("category").default("general"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorite Apps
export const favoriteApps = pgTable("favorite_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  color: text("color").default("#3b82f6"),
  category: text("category").default("general"),
  sortOrder: integer("sort_order").default(0),
  isQuickLaunch: boolean("is_quick_launch").default(false),
  recentlyUsed: boolean("recently_used").default(false),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
});
