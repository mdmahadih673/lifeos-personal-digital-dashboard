import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quickCopyItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(quickCopyItems).orderBy(asc(quickCopyItems.sortOrder));
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quick copy items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const [created] = await db.insert(quickCopyItems).values(body).returning();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create quick copy item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db
      .update(quickCopyItems)
      .set(data)
      .where(eq(quickCopyItems.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update quick copy item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await db.delete(quickCopyItems).where(eq(quickCopyItems.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete quick copy item" }, { status: 500 });
  }
}
