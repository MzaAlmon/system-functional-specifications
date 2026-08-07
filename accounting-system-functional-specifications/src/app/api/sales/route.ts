import { NextResponse } from "next/server";
import { db } from "@/db";
import { salesQuotations, salesOrders, salesInvoices, salesInvoiceItems, salesReturns, customers, branches, products, branchProducts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "invoices";

    if (type === "quotations") {
      const quotations = await db
        .select({
          id: salesQuotations.id,
          quoteNumber: salesQuotations.quoteNumber,
          customerId: salesQuotations.customerId,
          customerName: customers.name,
          branchId: salesQuotations.branchId,
          branchName: branches.name,
          quoteDate: salesQuotations.quoteDate,
          expiryDate: salesQuotations.expiryDate,
          status: salesQuotations.status,
          totalAmount: salesQuotations.totalAmount,
          taxAmount: salesQuotations.taxAmount,
          grandTotal: salesQuotations.grandTotal,
          notes: salesQuotations.notes,
        })
        .from(salesQuotations)
        .leftJoin(customers, eq(salesQuotations.customerId, customers.id))
        .leftJoin(branches, eq(salesQuotations.branchId, branches.id))
        .orderBy(desc(salesQuotations.id));

      return NextResponse.json(quotations);
    } else if (type === "orders") {
      const orders = await db
        .select({
          id: salesOrders.id,
          orderNumber: salesOrders.orderNumber,
          customerId: salesOrders.customerId,
          customerName: customers.name,
          branchId: salesOrders.branchId,
          branchName: branches.name,
          orderDate: salesOrders.orderDate,
          status: salesOrders.status,
          totalAmount: salesOrders.totalAmount,
          taxAmount: salesOrders.taxAmount,
          grandTotal: salesOrders.grandTotal,
          notes: salesOrders.notes,
        })
        .from(salesOrders)
        .leftJoin(customers, eq(salesOrders.customerId, customers.id))
        .leftJoin(branches, eq(salesOrders.branchId, branches.id))
        .orderBy(desc(salesOrders.id));

      return NextResponse.json(orders);
    } else if (type === "returns") {
      const returns = await db
        .select({
          id: salesReturns.id,
          returnNumber: salesReturns.returnNumber,
          salesInvoiceId: salesReturns.salesInvoiceId,
          customerId: salesReturns.customerId,
          customerName: customers.name,
          branchId: salesReturns.branchId,
          branchName: branches.name,
          returnDate: salesReturns.returnDate,
          grandTotal: salesReturns.grandTotal,
          reason: salesReturns.reason,
        })
        .from(salesReturns)
        .leftJoin(customers, eq(salesReturns.customerId, customers.id))
        .leftJoin(branches, eq(salesReturns.branchId, branches.id))
        .orderBy(desc(salesReturns.id));

      return NextResponse.json(returns);
    } else {
      const invoices = await db
        .select({
          id: salesInvoices.id,
          invoiceNumber: salesInvoices.invoiceNumber,
          customerId: salesInvoices.customerId,
          customerName: customers.name,
          branchId: salesInvoices.branchId,
          branchName: branches.name,
          invoiceType: salesInvoices.invoiceType,
          paymentMethod: salesInvoices.paymentMethod,
          totalAmount: salesInvoices.totalAmount,
          taxAmount: salesInvoices.taxAmount,
          discountAmount: salesInvoices.discountAmount,
          grandTotal: salesInvoices.grandTotal,
          paidAmount: salesInvoices.paidAmount,
          status: salesInvoices.status,
          createdAt: salesInvoices.createdAt,
        })
        .from(salesInvoices)
        .leftJoin(customers, eq(salesInvoices.customerId, customers.id))
        .leftJoin(branches, eq(salesInvoices.branchId, branches.id))
        .orderBy(desc(salesInvoices.id));

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

    if (type === "quotations") {
      if (!body.quoteNumber) body.quoteNumber = "QT-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(salesQuotations).values(body).returning();
      return NextResponse.json(inserted);
    } else if (type === "orders") {
      if (!body.orderNumber) body.orderNumber = "SO-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(salesOrders).values(body).returning();
      return NextResponse.json(inserted);
    } else if (type === "returns") {
      if (!body.returnNumber) body.returnNumber = "SRET-2025-" + Math.floor(100 + Math.random() * 900);
      const [inserted] = await db.insert(salesReturns).values(body).returning();
      return NextResponse.json(inserted);
    } else {
      // Sales Invoice
      const { items, ...invData } = body;
      if (!invData.invoiceNumber) invData.invoiceNumber = "INV-2025-" + Math.floor(1000 + Math.random() * 9000);
      const [insertedInv] = await db.insert(salesInvoices).values(invData).returning();

      if (items && Array.isArray(items)) {
        for (const item of items) {
          await db.insert(salesInvoiceItems).values({
            invoiceId: insertedInv.id,
            productId: item.productId,
            productName: item.productName || "منتج",
            quantity: item.quantity,
            unitPrice: String(item.unitPrice),
            taxAmount: String(item.taxAmount || 0),
            discount: String(item.discount || 0),
            lineTotal: String(item.lineTotal),
          });

          // Deduct branch stock
          if (invData.branchId && item.productId) {
            const currentStock = await db
              .select()
              .from(branchProducts)
              .where(eq(branchProducts.productId, item.productId));

            const bStock = currentStock.find((s) => s.branchId === invData.branchId);
            if (bStock) {
              const newQty = Math.max(0, bStock.stockQuantity - item.quantity);
              await db
                .update(branchProducts)
                .set({ stockQuantity: newQty })
                .where(eq(branchProducts.id, bStock.id));
            }
          }
        }
      }

      return NextResponse.json(insertedInv);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
