import { NextResponse } from "next/server";
import { db } from "@/db";
import { employees, branches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db
      .select({
        id: employees.id,
        employeeCode: employees.employeeCode,
        fullName: employees.fullName,
        jobTitle: employees.jobTitle,
        department: employees.department,
        phone: employees.phone,
        email: employees.email,
        nationalId: employees.nationalId,
        contractType: employees.contractType,
        joinDate: employees.joinDate,
        basicSalary: employees.basicSalary,
        housingAllowance: employees.housingAllowance,
        transportAllowance: employees.transportAllowance,
        otherAllowances: employees.otherAllowances,
        branchId: employees.branchId,
        branchName: branches.name,
        status: employees.status,
      })
      .from(employees)
      .leftJoin(branches, eq(employees.branchId, branches.id))
      .orderBy(desc(employees.id));

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.employeeCode) {
      body.employeeCode = "EMP-" + Math.floor(100 + Math.random() * 900);
    }
    const [inserted] = await db.insert(employees).values(body).returning();
    return NextResponse.json(inserted);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...data } = body;
    const [updated] = await db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
