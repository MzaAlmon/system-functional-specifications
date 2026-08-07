import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, unitsOfMeasure, branchProducts, branches } from "@/db/schema";
import { eq, desc, like, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const branchId = searchParams.get("branchId");

    let query = db
      .select({
        id: products.id,
        sku: products.sku,
        barcode: products.barcode,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        unitId: products.unitId,
        costPrice: products.costPrice,
        salePrice: products.salePrice,
        minStockLevel: products.minStockLevel,
        imageUrl: products.imageUrl,
        isActive: products.isActive,
        createdAt: products.createdAt,
        categoryName: categories.name,
        unitName: unitsOfMeasure.name,
        unitSymbol: unitsOfMeasure.symbol,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(unitsOfMeasure, eq(products.unitId, unitsOfMeasure.id))
      .orderBy(desc(products.id));

    const productList = await query;

    // Fetch stock quantities per branch
    const stockList = await db.select().from(branchProducts);

    // Attach stock per branch
    const result = productList.map((p) => {
      const pStocks = stockList.filter((s) => s.productId === p.id);
      const stockByBranch: Record<number, number> = {};
      let totalStock = 0;
      pStocks.forEach((s) => {
        stockByBranch[s.branchId] = s.stockQuantity;
        totalStock += s.stockQuantity;
      });

      const currentBranchStock = branchId ? stockByBranch[Number(branchId)] ?? 0 : totalStock;

      return {
        ...p,
        stockByBranch,
        totalStock,
        currentStock: currentBranchStock,
        isLowStock: currentBranchStock <= (p.minStockLevel || 5),
      };
    });

    if (search) {
      const q = search.toLowerCase();
      const filtered = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.toLowerCase().includes(q))
      );
      return NextResponse.json(filtered);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { initialStock, ...productData } = body;

    // Auto-generate barcode if empty
    if (!productData.barcode) {
      productData.barcode = "629" + Math.floor(100000000 + Math.random() * 900000000).toString();
    }

    const [newProduct] = await db.insert(products).values(productData).returning();

    // Initialize stock across all branches
    const allBranches = await db.select().from(branches);
    for (const b of allBranches) {
      await db.insert(branchProducts).values({
        branchId: b.id,
        productId: newProduct.id,
        stockQuantity: initialStock || 10,
        reorderPoint: newProduct.minStockLevel || 5,
      });
    }

    return NextResponse.json(newProduct);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, stockByBranch, ...data } = body;
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();

    if (stockByBranch) {
      for (const [bIdStr, qty] of Object.entries(stockByBranch)) {
        const bId = Number(bIdStr);
        const existing = await db
          .select()
          .from(branchProducts)
          .where(eq(branchProducts.productId, id));

        const branchExist = existing.find((e) => e.branchId === bId);
        if (branchExist) {
          await db
            .update(branchProducts)
            .set({ stockQuantity: Number(qty) })
            .where(eq(branchProducts.id, branchExist.id));
        } else {
          await db.insert(branchProducts).values({
            branchId: bId,
            productId: id,
            stockQuantity: Number(qty),
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
