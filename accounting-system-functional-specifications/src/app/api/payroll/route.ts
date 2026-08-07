import { NextResponse } from "next/server";
import { db } from "@/db";
import { payrollRuns, payrollItems, employees, branches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId");

    if (runId) {
      const items = await db
        .select({
          id: payrollItems.id,
          payrollId: payrollItems.payrollId,
          employeeId: payrollItems.employeeId,
          basicSalary: payrollItems.basicSalary,
          allowances: payrollItems.allowances,
          deductions: payrollItems.deductions,
          advances: payrollItems.advances,
          netSalary: payrollItems.netSalary,
          paymentStatus: payrollItems.paymentStatus,
          employeeName: employees.fullName,
          employeeCode: employees.employeeCode,
          jobTitle: employees.jobTitle,
          department: employees.department,
        })
        .from(payrollItems)
        .leftJoin(employees, eq(payrollItems.employeeId, employees.id))
        .where(eq(payrollItems.payrollId, Number(runId)));

      return NextResponse.json(items);
    }

    const runs = await db
      .select({
        id: payrollRuns.id,
        month: payrollRuns.month,
        year: payrollRuns.year,
        branchId: payrollRuns.branchId,
        branchName: branches.name,
        status: payrollRuns.status,
        totalBasic: payrollRuns.totalBasic,
        totalAllowances: payrollRuns.totalAllowances,
        totalDeductions: payrollRuns.totalDeductions,
        totalNet: payrollRuns.totalNet,
        notes: payrollRuns.notes,
        createdAt: payrollRuns.createdAt,
      })
      .from(payrollRuns)
      .leftJoin(branches, eq(payrollRuns.branchId, branches.id))
      .orderBy(desc(payrollRuns.id));

    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { month, year, branchId, notes } = body;

    // Fetch active employees for branch or all
    let empQuery = db.select().from(employees).where(eq(employees.status, "نشط"));
    const empList = await empQuery;

    let totBasic = 0;
    let totAllowances = 0;
    let totDeductions = 0;
    let totNet = 0;

    const itemsToInsert = empList.map((emp) => {
      const basic = Number(emp.basicSalary || 0);
      const allow = Number(emp.housingAllowance || 0) + Number(emp.transportAllowance || 0) + Number(emp.otherAllowances || 0);
      const deduct = 200; // standard deduction example
      const advance = 0;
      const net = basic + allow - deduct - advance;

      totBasic += basic;
      totAllowances += allow;
      totDeductions += deduct;
      totNet += net;

      return {
        employeeId: emp.id,
        basicSalary: String(basic),
        allowances: String(allow),
        deductions: String(deduct),
        advances: String(advance),
        netSalary: String(net),
        paymentStatus: "قيد الانتظار",
      };
    });

    const [run] = await db
      .insert(payrollRuns)
      .values({
        month: Number(month),
        year: Number(year),
        branchId: Number(branchId || 1),
        status: "مسودة",
        totalBasic: String(totBasic),
        totalAllowances: String(totAllowances),
        totalDeductions: String(totDeductions),
        totalNet: String(totNet),
        notes: notes || `مسودة مسرد رواتب شهر ${month}/${year}`,
      })
      .returning();

    for (const item of itemsToInsert) {
      await db.insert(payrollItems).values({
        ...item,
        payrollId: run.id,
      });
    }

    return NextResponse.json(run);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;
    const [updated] = await db.update(payrollRuns).set({ status }).where(eq(payrollRuns.id, id)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
