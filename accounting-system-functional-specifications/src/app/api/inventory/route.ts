import { NextResponse } from "next/server";
import { db } from "@/db";
import { stockMovements, branchProducts, products, branches } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const movements = await db
      .select({
        id: stockMovements.id,
        productId: stockMovements.productId,
        productName: products.name,
        productSku: products.sku,
        branchId: stockMovements.branchId,
        branchName: branches.name,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        referenceNo: stockMovements.referenceNo,
        createdByName: stockMovements.createdByName,
        notes: stockMovements.notes,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .leftJoin(products, eq(stockMovements.productId, products.id))
      .leftJoin(branches, eq(stockMovements.branchId, branches.id))
      .orderBy(desc(stockMovements.id));

    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, productId, fromBranchId, toBranchId, quantity, type, referenceNo, notes, createdByName } = body;

    if (action === "transfer") {
      // Transfer stock from one branch to another
      const qty = Number(quantity);
      if (qty <= 0) return NextResponse.json({ error: "الكمية غير صالحة" }, { status: 400 });

      // Deduct from source branch
      const sourceStocks = await db
        .select()
        .from(branchProducts)
        .where(and(eq(branchProducts.branchId, Number(fromBranchId)), eq(branchProducts.productId, Number(productId))));

      if (!sourceStocks.length || sourceStocks[0].stockQuantity < qty) {
        return NextResponse.json({ error: "الكمية غير متوفرة بالكامل في الفرع المصدر" }, { status: 400 });
      }

      await db
        .update(branchProducts)
        .set({ stockQuantity: sourceStocks[0].stockQuantity - qty })
        .where(eq(branchProducts.id, sourceStocks[0].id));

      // Add to destination branch
      const destStocks = await db
        .select()
        .from(branchProducts)
        .where(and(eq(branchProducts.branchId, Number(toBranchId)), eq(branchProducts.productId, Number(productId))));

      if (destStocks.length) {
        await db
          .update(branchProducts)
          .set({ stockQuantity: destStocks[0].stockQuantity + qty })
          .where(eq(branchProducts.id, destStocks[0].id));
      } else {
        await db.insert(branchProducts).values({
          branchId: Number(toBranchId),
          productId: Number(productId),
          stockQuantity: qty,
        });
      }

      // Log movements
      const ref = referenceNo || "TRF-" + Date.now().toString().slice(-6);
      await db.insert(stockMovements).values([
        {
          productId: Number(productId),
          branchId: Number(fromBranchId),
          type: "تحويل_إلى_فرع",
          quantity: -qty,
          referenceNo: ref,
          createdByName: createdByName || "مسؤول المخزون",
          notes: notes || `تحويل صادرة إلى الفرع ${toBranchId}`,
        },
        {
          productId: Number(productId),
          branchId: Number(toBranchId),
          type: "إدخال",
          quantity: qty,
          referenceNo: ref,
          createdByName: createdByName || "مسؤول المخزون",
          notes: notes || `تحويل واردة من الفرع ${fromBranchId}`,
        },
      ]);

      return NextResponse.json({ success: true, message: "تم تحويل المخزون بنجاح" });
    } else if (action === "adjustment") {
      // Physical count adjustment
      const qty = Number(quantity); // new target quantity or diff
      const branchId = Number(body.branchId || 1);

      const bStocks = await db
        .select()
        .from(branchProducts)
        .where(and(eq(branchProducts.branchId, branchId), eq(branchProducts.productId, Number(productId))));

      let currentQty = 0;
      if (bStocks.length) {
        currentQty = bStocks[0].stockQuantity;
        await db.update(branchProducts).set({ stockQuantity: qty }).where(eq(branchProducts.id, bStocks[0].id));
      } else {
        await db.insert(branchProducts).values({
          branchId,
          productId: Number(productId),
          stockQuantity: qty,
        });
      }

      const diff = qty - currentQty;
      await db.insert(stockMovements).values({
        productId: Number(productId),
        branchId,
        type: "تسوية",
        quantity: diff,
        referenceNo: "ADJ-" + Date.now().toString().slice(-6),
        createdByName: createdByName || "مسؤول الجرد",
        notes: notes || `تسوية جردية (من ${currentQty} إلى ${qty})`,
      });

      return NextResponse.json({ success: true, message: "تمت تسوية المخزون بنجاح" });
    } else {
      // Standard stock movement
      const [inserted] = await db
        .insert(stockMovements)
        .values({
          productId: Number(productId),
          branchId: Number(body.branchId || 1),
          type: type || "إدخال",
          quantity: Number(quantity),
          referenceNo: referenceNo || "STK-" + Date.now().toString().slice(-6),
          createdByName: createdByName || "أخصائي مخزن",
          notes: notes || "حركة مخزون مستندية",
        })
        .returning();

      return NextResponse.json(inserted);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
