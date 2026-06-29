import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { passwords } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(passwords).orderBy(desc(passwords.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch passwords" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db.insert(passwords).values(body).returning();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create password" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db
      .update(passwords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(passwords.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(passwords).where(eq(passwords.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete password" }, { status: 500 });
  }
}
