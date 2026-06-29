import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { socialAccounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(socialAccounts).orderBy(desc(socialAccounts.createdAt));
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Social GET error:", error);
    return NextResponse.json({ error: "Failed to fetch social accounts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db.insert(socialAccounts).values(body).returning();
    return NextResponse.json(created);
  } catch (error) {
    console.error("Social POST error:", error);
    return NextResponse.json({ error: "Failed to create social account" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db
      .update(socialAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(socialAccounts.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Social PUT error:", error);
    return NextResponse.json({ error: "Failed to update social account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(socialAccounts).where(eq(socialAccounts.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Social DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete social account" }, { status: 500 });
  }
}
