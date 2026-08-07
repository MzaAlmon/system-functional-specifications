import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, roles, branches } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        fullName: users.fullName,
        roleId: users.roleId,
        branchId: users.branchId,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        isActive: users.isActive,
        createdAt: users.createdAt,
        roleName: roles.name,
        branchName: branches.name,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(branches, eq(users.branchId, branches.id))
      .orderBy(users.id);

    return NextResponse.json(userList);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [inserted] = await db.insert(users).values(body).returning();
    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
