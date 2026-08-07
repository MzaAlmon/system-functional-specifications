import { NextResponse } from "next/server";
import { db } from "@/db";
import { expenses, branches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: expenses.id,
        expenseNumber: expenses.expenseNumber,
        title: expenses.title,
        category: expenses.category,
        amount: expenses.amount,
        taxAmount: expenses.taxAmount,
        paymentMethod: expenses.paymentMethod,
        branchId: expenses.branchId,
        branchName: branches.name,
        department: expenses.department,
        expenseDate: expenses.expenseDate,
        status: expenses.status,
        approvedBy: expenses.approvedBy,
        receiptRef: expenses.receiptRef,
        notes: expenses.notes,
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .leftJoin(branches, eq(expenses.branchId, branches.id))
      .orderBy(desc(expenses.id));

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.expenseNumber) {
      body.expenseNumber = "EXP-2025-" + Math.floor(100 + Math.random() * 900);
    }
    const [inserted] = await db.insert(expenses).values(body).returning();
    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
