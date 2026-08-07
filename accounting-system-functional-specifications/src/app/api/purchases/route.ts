import { NextResponse } from "next/server";
import { db } from "@/db";
import { purchaseOrders, purchaseInvoices, purchaseReturns, suppliers, branches } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "invoices";

    if (type === "orders") {
      const orders = await db
        .select({
          id: purchaseOrders.id,
          poNumber: purchaseOrders.poNumber,
          supplierId: purchaseOrders.supplierId,
          supplierName: suppliers.name,
          branchId: purchaseOrders.branchId,
          branchName: branches.name,
          orderDate: purchaseOrders.orderDate,
          expectedDeliveryDate: purchaseOrders.expectedDeliveryDate,
          status: purchaseOrders.status,
          totalAmount: purchaseOrders.totalAmount,
          taxAmount: purchaseOrders.taxAmount,
          grandTotal: purchaseOrders.grandTotal,
          notes: purchaseOrders.notes,
        })
        .from(purchaseOrders)
        .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
        .leftJoin(branches, eq(purchaseOrders.branchId, branches.id))
        .orderBy(desc(purchaseOrders.id));

      return NextResponse.json(orders);
    } else if (type === "returns") {
      const returns = await db
        .select({
          id: purchaseReturns.id,
          returnNumber: purchaseReturns.returnNumber,
          supplierId: purchaseReturns.supplierId,
          supplierName: suppliers.name,
          branchId: purchaseReturns.branchId,
          branchName: branches.name,
          returnDate: purchaseReturns.returnDate,
          totalAmount: purchaseReturns.totalAmount,
          taxAmount: purchaseReturns.taxAmount,
          grandTotal: purchaseReturns.grandTotal,
          reason: purchaseReturns.reason,
        })
        .from(purchaseReturns)
        .leftJoin(suppliers, eq(purchaseReturns.supplierId, suppliers.id))
        .leftJoin(branches, eq(purchaseReturns.branchId, branches.id))
        .orderBy(desc(purchaseReturns.id));

      return NextResponse.json(returns);
    } else {
      const invoices = await db
        .select({
          id: purchaseInvoices.id,
          invoiceNumber: purchaseInvoices.invoiceNumber,
          supplierId: purchaseInvoices.supplierId,
          supplierName: suppliers.name,
          branchId: purchaseInvoices.branchId,
          branchName: branches.name,
          invoiceDate: purchaseInvoices.invoiceDate,
          dueDate: purchaseInvoices.dueDate,
          totalAmount: purchaseInvoices.totalAmount,
          taxAmount: purchaseInvoices.taxAmount,
          grandTotal: purchaseInvoices.grandTotal,
          paidAmount: purchaseInvoices.paidAmount,
          status: purchaseInvoices.status,
          notes: purchaseInvoices.notes,
        })
        .from(purchaseInvoices)
        .leftJoin(suppliers, eq(purchaseInvoices.supplierId, suppliers.id))
        .leftJoin(branches, eq(purchaseInvoices.branchId, branches.id))
        .orderBy(desc(purchaseInvoices.id));

      return NextResponse.json(invoices);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "invoices";
    const body = await req.json();

    if (type === "orders") {
      if (!body.poNumber) body.poNumber = "PO-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(purchaseOrders).values(body).returning();
      return NextResponse.json(inserted);
    } else if (type === "returns") {
      if (!body.returnNumber) body.returnNumber = "PRET-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(purchaseReturns).values(body).returning();
      return NextResponse.json(inserted);
    } else {
      if (!body.invoiceNumber) body.invoiceNumber = "PINV-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(purchaseInvoices).values(body).returning();
      return NextResponse.json(inserted);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "invoices";
    const body = await req.json();
    const { id, ...data } = body;

    if (type === "orders") {
      const [updated] = await db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id)).returning();
      return NextResponse.json(updated);
    } else {
      const [updated] = await db.update(purchaseInvoices).set(data).where(eq(purchaseInvoices.id, id)).returning();
      return NextResponse.json(updated);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
