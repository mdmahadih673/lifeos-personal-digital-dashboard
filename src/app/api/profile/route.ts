import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(profile).limit(1);
    if (rows.length === 0) {
      // Create default profile
      const [newProfile] = await db
        .insert(profile)
        .values({ name: "Your Name", title: "Digital Creator" })
        .returning();
      return NextResponse.json(newProfile);
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const rows = await db.select().from(profile).limit(1);
    if (rows.length === 0) {
      const [newProfile] = await db.insert(profile).values(body).returning();
      return NextResponse.json(newProfile);
    }
    const [updated] = await db
      .update(profile)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(profile.id, rows[0].id))
      .returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
