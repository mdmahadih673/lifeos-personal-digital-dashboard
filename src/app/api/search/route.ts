import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialAccounts, contacts, notes, passwords, todos, bios } from "@/db/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const q = `%${query}%`;

    const [socialResults, contactResults, noteResults, passwordResults, todoResults, bioResults] =
      await Promise.all([
        db
          .select()
          .from(socialAccounts)
          .where(
            or(
              ilike(socialAccounts.username, q),
              ilike(socialAccounts.displayName, q),
              ilike(socialAccounts.platform, q)
            )
          )
          .limit(5),
        db
          .select()
          .from(contacts)
          .where(
            or(
              ilike(contacts.fullName, q),
              ilike(contacts.email, q),
              ilike(contacts.phone, q)
            )
          )
          .limit(5),
        db
          .select()
          .from(notes)
          .where(or(ilike(notes.title, q), ilike(notes.content, q)))
          .limit(5),
        db
          .select()
          .from(passwords)
          .where(or(ilike(passwords.website, q), ilike(passwords.username, q)))
          .limit(5),
        db
          .select()
          .from(todos)
          .where(or(ilike(todos.title, q), ilike(todos.description, q)))
          .limit(5),
        db
          .select()
          .from(bios)
          .where(or(ilike(bios.platform, q), ilike(bios.content, q)))
          .limit(5),
      ]);

    const results = [
      ...socialResults.map((r) => ({
        type: "social",
        id: r.id,
        title: r.displayName || r.username,
        subtitle: `@${r.username} · ${r.platform}`,
        icon: "📱",
      })),
      ...contactResults.map((r) => ({
        type: "contact",
        id: r.id,
        title: r.fullName,
        subtitle: r.phone || r.email || "",
        icon: "👤",
      })),
      ...noteResults.map((r) => ({
        type: "note",
        id: r.id,
        title: r.title,
        subtitle: r.content.substring(0, 60),
        icon: "📝",
      })),
      ...passwordResults.map((r) => ({
        type: "password",
        id: r.id,
        title: r.website,
        subtitle: r.username,
        icon: "🔐",
      })),
      ...todoResults.map((r) => ({
        type: "todo",
        id: r.id,
        title: r.title,
        subtitle: r.description || "",
        icon: "✅",
      })),
      ...bioResults.map((r) => ({
        type: "bio",
        id: r.id,
        title: `${r.platform} Bio`,
        subtitle: r.content.substring(0, 60),
        icon: "📄",
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
