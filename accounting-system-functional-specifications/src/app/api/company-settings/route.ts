import { NextResponse } from "next/server";
import { db } from "@/db";
import { companySettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    let settings = await db.select().from(companySettings).limit(1);
    if (settings.length === 0) {
      const [inserted] = await db
        .insert(companySettings)
        .values({
          companyNameAr: "شركة الأفق للحلول المحاسبية والتجارية",
          companyNameEn: "Horizon Accounting & Trading Co.",
          vatNumber: "310987654300003",
          crNumber: "1010887766",
          phone: "+966 11 400 1234",
          email: "info@horizon-erp.sa",
          address: "الرياض - حي الصحافة - طريق الملك فهد - برج الأفق",
          currency: "SAR",
          currencySymbol: "ر.س",
          defaultVatRate: "15.00",
        })
        .returning();
      return NextResponse.json(inserted);
    }
    return NextResponse.json(settings[0]);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const settings = await db.select().from(companySettings).limit(1);

    if (settings.length === 0) {
      const [newSettings] = await db.insert(companySettings).values(body).returning();
      return NextResponse.json(newSettings);
    } else {
      const [updated] = await db
        .update(companySettings)
        .set(body)
        .where(eq(companySettings.id, settings[0].id))
        .returning();
      return NextResponse.json(updated);
    }
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
