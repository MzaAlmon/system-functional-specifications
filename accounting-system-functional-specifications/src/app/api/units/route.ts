import { NextResponse } from "next/server";
import { db } from "@/db";
import { unitsOfMeasure } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(unitsOfMeasure).orderBy(unitsOfMeasure.id);
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [inserted] = await db.insert(unitsOfMeasure).values(body).returning();
    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
