import { NextResponse } from "next/server";
import { db } from "@/db";
import { posShifts, salesInvoices, salesInvoiceItems, branchProducts, stockMovements, users, branches, companySettings } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || "1";

    // Get current active shift for branch
    const openShift = await db
      .select({
        id: posShifts.id,
        branchId: posShifts.branchId,
        cashierId: posShifts.cashierId,
        startTime: posShifts.startTime,
        openingCash: posShifts.openingCash,
        status: posShifts.status,
        cashierName: users.fullName,
        branchName: branches.name,
      })
      .from(posShifts)
      .leftJoin(users, eq(posShifts.cashierId, users.id))
      .leftJoin(branches, eq(posShifts.branchId, branches.id))
      .where(and(eq(posShifts.branchId, Number(branchId)), eq(posShifts.status, "مفتوحة")))
      .limit(1);

    const shift = openShift[0] || null;

    // Get list of previous closed shifts
    const shiftHistory = await db
      .select({
        id: posShifts.id,
        branchId: posShifts.branchId,
        cashierId: posShifts.cashierId,
        startTime: posShifts.startTime,
        endTime: posShifts.endTime,
        openingCash: posShifts.openingCash,
        closingCashSystem: posShifts.closingCashSystem,
        closingCashActual: posShifts.closingCashActual,
        discrepancy: posShifts.discrepancy,
        status: posShifts.status,
        notes: posShifts.notes,
        cashierName: users.fullName,
      })
      .from(posShifts)
      .leftJoin(users, eq(posShifts.cashierId, users.id))
      .orderBy(desc(posShifts.id))
      .limit(10);

    return NextResponse.json({ activeShift: shift, history: shiftHistory });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const body = await req.json();

    if (action === "open_shift") {
      const { branchId, cashierId, openingCash } = body;
      const [newShift] = await db
        .insert(posShifts)
        .values({
          branchId: Number(branchId || 1),
          cashierId: Number(cashierId || 1),
          openingCash: String(openingCash || "500.00"),
          status: "مفتوحة",
        })
        .returning();
      return NextResponse.json(newShift);
    } else if (action === "close_shift") {
      const { shiftId, closingCashActual, notes } = body;
      const shift = await db.select().from(posShifts).where(eq(posShifts.id, Number(shiftId)));

      if (!shift.length) {
        return NextResponse.json({ error: "الوردية غير موجودة" }, { status: 404 });
      }

      const activeShift = shift[0];

      // Calculate total cash sales during shift
      const posSales = await db
        .select()
        .from(salesInvoices)
        .where(eq(salesInvoices.branchId, activeShift.branchId));

      let totalCashSales = 0;
      posSales.forEach((s) => {
        if (s.paymentMethod === "نقداً" || s.paymentMethod === "كاش") {
          totalCashSales += Number(s.grandTotal || 0);
        }
      });

      const opening = Number(activeShift.openingCash || 0);
      const systemCash = opening + totalCashSales;
      const actual = Number(closingCashActual || systemCash);
      const discrepancy = actual - systemCash;

      const [closedShift] = await db
        .update(posShifts)
        .set({
          endTime: new Date(),
          closingCashSystem: String(systemCash),
          closingCashActual: String(actual),
          discrepancy: String(discrepancy),
          status: "مغلقة",
          notes: notes || `إغلاق الوردية Z-Report (العجز/الزيادة: ${discrepancy} ر.س)`,
        })
        .where(eq(posShifts.id, Number(shiftId)))
        .returning();

      return NextResponse.json(closedShift);
    } else if (action === "checkout") {
      // Direct POS Order Checkout
      const { branchId, cashierId, customerId, paymentMethod, items, totalAmount, taxAmount, discountAmount, grandTotal, paidAmount } = body;

      const invNumber = "POS-" + Date.now().toString().slice(-6);

      const [newInv] = await db
        .insert(salesInvoices)
        .values({
          invoiceNumber: invNumber,
          customerId: Number(customerId || 3), // default cash customer
          branchId: Number(branchId || 1),
          cashierId: Number(cashierId || 1),
          invoiceType: "تجزئة",
          paymentMethod: paymentMethod || "نقداً",
          totalAmount: String(totalAmount),
          taxAmount: String(taxAmount),
          discountAmount: String(discountAmount || "0.00"),
          grandTotal: String(grandTotal),
          paidAmount: String(paidAmount || grandTotal),
          status: "مدفوع",
        })
        .returning();

      // Insert line items & update stock
      for (const item of items) {
        await db.insert(salesInvoiceItems).values({
          invoiceId: newInv.id,
          productId: item.productId,
          productName: item.productName || item.name,
          quantity: item.quantity,
          unitPrice: String(item.salePrice || item.unitPrice),
          taxAmount: String((Number(item.salePrice) * 0.15).toFixed(2)),
          discount: String(item.discount || "0.00"),
          lineTotal: String((item.quantity * Number(item.salePrice)).toFixed(2)),
        });

        // Deduct inventory
        const bProducts = await db
          .select()
          .from(branchProducts)
          .where(and(eq(branchProducts.branchId, Number(branchId || 1)), eq(branchProducts.productId, item.productId)));

        if (bProducts.length > 0) {
          const bp = bProducts[0];
          const newQty = Math.max(0, bp.stockQuantity - item.quantity);
          await db.update(branchProducts).set({ stockQuantity: newQty }).where(eq(branchProducts.id, bp.id));

          // Log stock movement
          await db.insert(stockMovements).values({
            productId: item.productId,
            branchId: Number(branchId || 1),
            type: "مبيعات_POS",
            quantity: -item.quantity,
            referenceNo: invNumber,
            createdByName: "الكاشير",
            notes: `خصم مخزون تلقائي لفاتورة POS #${invNumber}`,
          });
        }
      }

      return NextResponse.json({ success: true, invoice: newInv });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
