import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { brandKit } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(brandKit).limit(1);
    if (rows.length === 0) {
      return NextResponse.json(null);
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brand kit" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = await db.select().from(brandKit).limit(1);
    if (rows.length > 0) {
      const [updated] = await db
        .update(brandKit)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(brandKit.id, rows[0].id))
        .returning();
      return NextResponse.json(updated);
    }
    const [created] = await db.insert(brandKit).values(body).returning();
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save brand kit" }, { status: 500 });
  }
}
