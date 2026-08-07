import { db } from "./index";
import {
  branches,
  roles,
  users,
  categories,
  unitsOfMeasure,
  products,
  branchProducts,
  suppliers,
  customers,
  purchaseOrders,
  purchaseInvoices,
  purchaseReturns,
  salesQuotations,
  salesOrders,
  salesInvoices,
  salesInvoiceItems,
  salesReturns,
  employees,
  payrollRuns,
  payrollItems,
  expenses,
  posShifts,
  stockMovements,
  companySettings,
  auditLogs,
} from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if company settings exist
    const existingSettings = await db.select().from(companySettings).limit(1);
    if (existingSettings.length > 0) {
      return { success: true, message: "Database already seeded" };
    }

    // 1. Company Settings
    await db.insert(companySettings).values({
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
      receiptHeader: "أهلاً وسهلاً بكم في شركة الأفق التجارية",
      receiptFooter: "شكراً لزيارتكم! الفاتورة ضريبية مبسطة معتمدة من هيئة الزكاة والضريبة والجمارك.",
      enableZatcaQr: true,
    });

    // 2. Branches
    const [b1] = await db
      .insert(branches)
      .values([
        { code: "BR-01", name: "الفرع الرئيسي - الرياض", address: "طريق الملك فهد، الرياض", phone: "0114001234", city: "الرياض", isActive: true },
        { code: "BR-02", name: "فرع جدة - الكورنيش", address: "طريق الكورنيش، جدة", phone: "0126005678", city: "جدة", isActive: true },
        { code: "BR-03", name: "فرع الدمام - الفيصلية", address: "طريق الملك فهد، الدمام", phone: "0138009988", city: "الدمام", isActive: true },
      ])
      .returning();

    const [b2, b3] = await db.select().from(branches).where(eq(branches.isActive, true));

    // 3. Roles
    const [rAdmin] = await db
      .insert(roles)
      .values([
        {
          name: "مدير النظام الشامل (Admin)",
          description: "صلاحية وصول كاملة لجميع الوحدات والفروع والإعدادات",
          permissions: JSON.stringify([
            "dashboard_view", "purchases_view", "purchases_create", "purchases_edit", "purchases_approve",
            "sales_view", "sales_create", "sales_edit", "sales_delete",
            "pos_access", "pos_discount", "pos_close_shift",
            "payroll_view", "payroll_calculate", "payroll_approve",
            "expenses_view", "expenses_create", "expenses_approve",
            "inventory_view", "inventory_adjust", "inventory_transfer",
            "barcode_print", "branches_manage", "settings_manage", "roles_manage"
          ]),
          isSystem: true,
        },
        {
          name: "محاسب رئيسي (Accountant)",
          description: "إدارة المشتريات، المبيعات، المصاريف، التقارير والرواتب",
          permissions: JSON.stringify([
            "dashboard_view", "purchases_view", "purchases_create", "purchases_edit",
            "sales_view", "sales_create",
            "payroll_view", "payroll_calculate",
            "expenses_view", "expenses_create", "expenses_approve",
            "inventory_view", "barcode_print"
          ]),
          isSystem: true,
        },
        {
          name: "كاشير - نقطة البيع (Cashier)",
          description: "إصدار فواتير المبيعات السريعة والتعامل مع الكاشير والوردية",
          permissions: JSON.stringify(["pos_access", "sales_view", "sales_create", "pos_close_shift", "barcode_print"]),
          isSystem: true,
        },
        {
          name: "مدير مخزون (Inventory Manager)",
          description: "إدارة الاصناف والتسويات والجرد والتحويلات بين الفروع",
          permissions: JSON.stringify(["dashboard_view", "inventory_view", "inventory_adjust", "inventory_transfer", "barcode_print"]),
          isSystem: true,
        },
      ])
      .returning();

    // 4. Users
    await db.insert(users).values([
      { username: "admin", email: "admin@horizon.sa", fullName: "م. عبد الرحمن العتيبي", roleId: rAdmin.id, branchId: b1.id, phone: "0501112233" },
      { username: "accountant", email: "accountant@horizon.sa", fullName: "سارة الشمري", roleId: rAdmin.id, branchId: b1.id, phone: "0502223344" },
      { username: "cashier1", email: "cashier@horizon.sa", fullName: "خالد الغامدي", roleId: rAdmin.id, branchId: b1.id, phone: "0503334455" },
      { username: "stock_mgr", email: "stock@horizon.sa", fullName: "فهد الدوسري", roleId: rAdmin.id, branchId: b1.id, phone: "0504445566" },
    ]);

    // 5. Units & Categories
    const [uPcs] = await db.insert(unitsOfMeasure).values([
      { name: "قطعة", symbol: "قطعة" },
      { name: "كرتون", symbol: "كرتون" },
      { name: "طقم", symbol: "طقم" },
      { name: "كيلوغرام", symbol: "كجم" },
    ]).returning();

    const [c1] = await db.insert(categories).values([
      { name: "إلكترونيات وأجهزة", code: "ELEC", description: "أجهزة حاسب، هواتف، وملحقاتها", icon: "Laptop" },
      { name: "أدوات مكتبية ومستلزمات", code: "OFFICE", description: "أوراق، أقلام، ومستلزمات مكتبية", icon: "Printer" },
      { name: "أثاث ومستلزمات قياسية", code: "FURN", description: "مكاتب، كراسي، وخزانات", icon: "Armchair" },
      { name: "خدمات واستشارات", code: "SERV", description: "خدمات صيانة والدعم الفني", icon: "Wrench" },
    ]).returning();

    const [c2, c3, c4] = await db.select().from(categories);

    // 6. Products Catalog
    const insertedProducts = await db.insert(products).values([
      {
        sku: "PRD-1001",
        barcode: "629110001001",
        name: "جهاز لابتوب ماك بوك برو M3 - 16 بوصة",
        description: "معالج M3 Pro، ذاكرة 18 جيجابايت، تخزين 512 جيجابايت SSD",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "8200.00",
        salePrice: "9800.00",
        minStockLevel: 3,
      },
      {
        sku: "PRD-1002",
        barcode: "629110001002",
        name: "شاشة سامسونج ذكية 27 بوصة 4K",
        description: "شاشة عالية الدقة للمكاتب مع منفذ USB-C",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "1200.00",
        salePrice: "1650.00",
        minStockLevel: 5,
      },
      {
        sku: "PRD-1003",
        barcode: "629110001003",
        name: "طابعة ليزر متعددة الوظائف HP LaserJet",
        description: "طباعة، مسح ضوئي، وتصوير ملون بسرعة عالية",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "1450.00",
        salePrice: "1890.00",
        minStockLevel: 4,
      },
      {
        sku: "PRD-1004",
        barcode: "629110001004",
        name: "كرسي مكتب مريح هيرمان ميلر ERGO",
        description: "كرسي مريح مع دعم الظهر ووسائد قابل للتعديل",
        categoryId: c3.id,
        unitId: uPcs.id,
        costPrice: "1800.00",
        salePrice: "2400.00",
        minStockLevel: 2,
      },
      {
        sku: "PRD-1005",
        barcode: "629110001005",
        name: "طقم كيبورد وماوس وايرلس لوجيتك",
        description: "طقم مريح مع بطارية تدوم طويلاً لاتصال سريع",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "140.00",
        salePrice: "220.00",
        minStockLevel: 10,
      },
      {
        sku: "PRD-1006",
        barcode: "629110001006",
        name: "كرتون ورق طباعة A4 فاخر (5 رزم)",
        description: "ورق طباعة أبيض ناصع 80 جرام ممتاز للطباعة اليومية",
        categoryId: c2.id,
        unitId: uPcs.id,
        costPrice: "65.00",
        salePrice: "95.00",
        minStockLevel: 15,
      },
      {
        sku: "PRD-1007",
        barcode: "629110001007",
        name: "ماكينة قراءة الباركود اللاسلكية Zebra 2D",
        description: "قارئ باركود و كيو آر كود سريع للاستخدام المكثف",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "380.00",
        salePrice: "580.00",
        minStockLevel: 3,
      },
      {
        sku: "PRD-1008",
        barcode: "629110001008",
        name: "طابعة إيصالات حرارية 80 مم للـ POS",
        description: "طابعة الفواتير الحرارية السريعة للـ POS مع قاطع آلي",
        categoryId: c1.id,
        unitId: uPcs.id,
        costPrice: "290.00",
        salePrice: "450.00",
        minStockLevel: 4,
      },
    ]).returning();

    // 7. Branch Products Stock
    const allProducts = await db.select().from(products);
    const allBranchesList = await db.select().from(branches);

    for (const b of allBranchesList) {
      for (const p of allProducts) {
        await db.insert(branchProducts).values({
          branchId: b.id,
          productId: p.id,
          stockQuantity: Math.floor(Math.random() * 25) + 5,
          reorderPoint: p.minStockLevel || 5,
        });
      }
    }

    // 8. Suppliers & Customers
    const [sup1, sup2, sup3] = await db.insert(suppliers).values([
      { code: "SUP-001", name: "شركة التقنية العالمية المحدودة", companyName: "التقنية العالمية", phone: "0112223333", email: "sales@globaltech.sa", taxNumber: "310000111100003", address: "الرياض - الحزام الذهبي", balance: "24500.00", status: "نشط" },
      { code: "SUP-002", name: "مؤسسة التوريدات المبتكرة", companyName: "التوريدات المبتكرة", phone: "0123334444", email: "info@innovative-supplies.com", taxNumber: "310000222200003", address: "جدة - شارع فلسطين", balance: "12800.00", status: "نشط" },
      { code: "SUP-003", name: "شركة الحلول المكتبية الكبرى", companyName: "الحلول المكتبية", phone: "0134445555", email: "orders@officesolutions.sa", taxNumber: "310000333300003", address: "الدمام - الشاطئ", balance: "0.00", status: "نشط" },
    ]).returning();

    const [cust1, cust2, cust3, cust4] = await db.insert(customers).values([
      { code: "CUST-001", name: "مؤسسة الإنجاز للخدمات التجارية", phone: "0551234567", email: "contact@enjaz.sa", taxNumber: "300111222300003", address: "الرياض - طريق العليا", classification: "عميل جملة", creditLimit: "50000.00", balance: "18400.00", status: "نشط" },
      { code: "CUST-002", name: "شركة الأفق للاستشارات والهندسة", phone: "0509876543", email: "info@horizon-eng.com", taxNumber: "300444555600003", address: "جدة - حي الحمراء", classification: "عميل رئيسي VIP", creditLimit: "100000.00", balance: "32000.00", status: "نشط" },
      { code: "CUST-003", name: "د. خالد السليمان (عميل نقد)", phone: "0561112233", email: "khalid@gmail.com", taxNumber: "", address: "الرياض - حي النخيل", classification: "عميل تجزئة", creditLimit: "5000.00", balance: "0.00", status: "نشط" },
      { code: "CUST-004", name: "مستشفى الرعاية المتقدمة", phone: "0543332211", email: "procurement@care.sa", taxNumber: "300999888700003", address: "الدمام - حي الريان", classification: "حكومي/مؤسسي", creditLimit: "150000.00", balance: "84500.00", status: "نشط" },
    ]).returning();

    // 9. Purchases Data (Orders, Invoices, Returns)
    const [po1] = await db.insert(purchaseOrders).values([
      {
        poNumber: "PO-2025-001",
        supplierId: sup1.id,
        branchId: b1.id,
        orderDate: "2025-02-01",
        expectedDeliveryDate: "2025-02-05",
        status: "مستلم",
        totalAmount: "24000.00",
        taxAmount: "3600.00",
        grandTotal: "27600.00",
        notes: "طلب شحنة أجهزة لابتوب وشاشات لفرع الرياض الرئيسي",
      },
      {
        poNumber: "PO-2025-002",
        supplierId: sup2.id,
        branchId: b1.id,
        orderDate: "2025-02-10",
        expectedDeliveryDate: "2025-02-15",
        status: "تم الإرسال",
        totalAmount: "12500.00",
        taxAmount: "1875.00",
        grandTotal: "14375.00",
        notes: "توريد ملحقات مكتبية وطابعات",
      },
    ]).returning();

    await db.insert(purchaseInvoices).values([
      {
        invoiceNumber: "PINV-2025-001",
        poId: po1.id,
        supplierId: sup1.id,
        branchId: b1.id,
        invoiceDate: "2025-02-02",
        dueDate: "2025-03-02",
        totalAmount: "24000.00",
        taxAmount: "3600.00",
        grandTotal: "27600.00",
        paidAmount: "10000.00",
        status: "مدفوع جزئياً",
        notes: "دفعة أولى 10,000 ريال والباقي بعد شهر",
      },
    ]);

    await db.insert(purchaseReturns).values([
      {
        returnNumber: "PRET-2025-001",
        supplierId: sup2.id,
        branchId: b1.id,
        returnDate: "2025-02-12",
        totalAmount: "1200.00",
        taxAmount: "180.00",
        grandTotal: "1380.00",
        reason: "إرجاع شاشة بخلل مصنعي في التغليف",
      },
    ]);

    // 10. Sales Quotations, Orders, Invoices
    await db.insert(salesQuotations).values([
      {
        quoteNumber: "QT-2025-0101",
        customerId: cust2.id,
        branchId: b1.id,
        quoteDate: "2025-02-05",
        expiryDate: "2025-02-28",
        totalAmount: "35000.00",
        taxAmount: "5250.00",
        grandTotal: "40250.00",
        status: "ساري",
        notes: "عرض سعر لتجهيز معامل الحاسب لمكتب الاستشارات",
      },
    ]);

    await db.insert(salesOrders).values([
      {
        orderNumber: "SO-2025-0050",
        customerId: cust1.id,
        branchId: b1.id,
        orderDate: "2025-02-08",
        totalAmount: "18000.00",
        taxAmount: "2700.00",
        grandTotal: "20700.00",
        status: "قيد الانتظار",
        notes: "أمر بيع بانتظار التأكيد النهائي للمواصفات",
      },
    ]);

    const [inv1] = await db.insert(salesInvoices).values([
      {
        invoiceNumber: "INV-2025-1001",
        customerId: cust1.id,
        branchId: b1.id,
        invoiceType: "فاتورة ضريبية",
        paymentMethod: "تحويل بنكي",
        totalAmount: "16000.00",
        taxAmount: "2400.00",
        discountAmount: "500.00",
        grandTotal: "17900.00",
        paidAmount: "17900.00",
        status: "مدفوع",
      },
      {
        invoiceNumber: "INV-2025-1002",
        customerId: cust2.id,
        branchId: b1.id,
        invoiceType: "فاتورة ضريبية",
        paymentMethod: "شبكة/بطاقة",
        totalAmount: "22000.00",
        taxAmount: "3300.00",
        discountAmount: "0.00",
        grandTotal: "25300.00",
        paidAmount: "10000.00",
        status: "مدفوع جزئياً",
      },
      {
        invoiceNumber: "POS-2025-8801",
        customerId: cust3.id,
        branchId: b1.id,
        invoiceType: "تجزئة",
        paymentMethod: "نقداً",
        totalAmount: "2070.00",
        taxAmount: "310.50",
        discountAmount: "0.00",
        grandTotal: "2380.50",
        paidAmount: "2380.50",
        status: "مدفوع",
      },
    ]).returning();

    await db.insert(salesInvoiceItems).values([
      {
        invoiceId: inv1.id,
        productId: insertedProducts[0].id,
        productName: insertedProducts[0].name,
        quantity: 1,
        unitPrice: "9800.00",
        taxAmount: "1470.00",
        discount: "300.00",
        lineTotal: "10925.00",
      },
      {
        invoiceId: inv1.id,
        productId: insertedProducts[1].id,
        productName: insertedProducts[1].name,
        quantity: 4,
        unitPrice: "1650.00",
        taxAmount: "990.00",
        discount: "200.00",
        lineTotal: "7390.00",
      },
    ]);

    await db.insert(salesReturns).values([
      {
        returnNumber: "SRET-2025-001",
        salesInvoiceId: inv1.id,
        customerId: cust1.id,
        branchId: b1.id,
        returnDate: "2025-02-14",
        grandTotal: "1650.00",
        reason: "استبدال شاشة بنائية أصغر بناءً على طلب العميل",
      },
    ]);

    // 11. Employees & Payroll
    const [emp1, emp2, emp3] = await db.insert(employees).values([
      {
        employeeCode: "EMP-001",
        fullName: "محمد إبراهيم الزهراني",
        jobTitle: "مدير المبيعات والتسويق",
        department: "المبيعات",
        phone: "0501234567",
        email: "m.zahrani@horizon.sa",
        nationalId: "1029384756",
        contractType: "دوام كامل",
        joinDate: "2022-01-15",
        basicSalary: "12000.00",
        housingAllowance: "3000.00",
        transportAllowance: "1000.00",
        otherAllowances: "500.00",
        branchId: b1.id,
        status: "نشط",
      },
      {
        employeeCode: "EMP-002",
        fullName: "نورة عبد الله الشهري",
        jobTitle: "محاسبة أولى",
        department: "المالية والمحاسبة",
        phone: "0509871234",
        email: "nora@horizon.sa",
        nationalId: "1098765432",
        contractType: "دوام كامل",
        joinDate: "2022-06-01",
        basicSalary: "9500.00",
        housingAllowance: "2375.00",
        transportAllowance: "800.00",
        otherAllowances: "0.00",
        branchId: b1.id,
        status: "نشط",
      },
      {
        employeeCode: "EMP-003",
        fullName: "ياسر بن صلاح القحطاني",
        jobTitle: "كاشير ومسؤول مبيعات معرض",
        department: "المبيعات والمعارض",
        phone: "0554443322",
        email: "yasser@horizon.sa",
        nationalId: "1033221100",
        contractType: "دوام كامل",
        joinDate: "2023-03-10",
        basicSalary: "5000.00",
        housingAllowance: "1250.00",
        transportAllowance: "500.00",
        otherAllowances: "250.00",
        branchId: b1.id,
        status: "نشط",
      },
    ]).returning();

    const [payRun] = await db.insert(payrollRuns).values([
      {
        month: 1,
        year: 2025,
        branchId: b1.id,
        status: "معتمد",
        totalBasic: "26500.00",
        totalAllowances: "9175.00",
        totalDeductions: "1500.00",
        totalNet: "34175.00",
        notes: "كشف رواتب شهر يناير 2025 المعتمد",
      },
    ]).returning();

    await db.insert(payrollItems).values([
      { payrollId: payRun.id, employeeId: emp1.id, basicSalary: "12000.00", allowances: "4500.00", deductions: "500.00", advances: "0.00", netSalary: "16000.00", paymentStatus: "تم الصرف" },
      { payrollId: payRun.id, employeeId: emp2.id, basicSalary: "9500.00", allowances: "3175.00", deductions: "400.00", advances: "0.00", netSalary: "12275.00", paymentStatus: "تم الصرف" },
      { payrollId: payRun.id, employeeId: emp3.id, basicSalary: "5000.00", allowances: "2000.00", deductions: "600.00", advances: "500.00", netSalary: "5900.00", paymentStatus: "تم الصرف" },
    ]);

    // 12. Expenses
    await db.insert(expenses).values([
      {
        expenseNumber: "EXP-2025-012",
        title: "إيجار المعرض الرئيسي - الربع الأول",
        category: "مصاريف إيجارات",
        amount: "45000.00",
        taxAmount: "6750.00",
        paymentMethod: "تحويل بنكي",
        branchId: b1.id,
        department: "الإدارة العامة",
        expenseDate: "2025-01-05",
        status: "معتمد",
        approvedBy: "م. عبد الرحمن العتيبي",
        receiptRef: "REC-998811",
        notes: "عقد إيجار المقر لعام 2025",
      },
      {
        expenseNumber: "EXP-2025-015",
        title: "فاتورة الكهرباء والانترنت للمقر الرئيسي",
        category: "مرافق وخدمات",
        amount: "3200.00",
        taxAmount: "480.00",
        paymentMethod: "سداد إلكتروني",
        branchId: b1.id,
        department: "التشغيل",
        expenseDate: "2025-01-25",
        status: "معتمد",
        approvedBy: "سارة الشمري",
        receiptRef: "SADAD-771122",
        notes: "فاتورة الكهرباء والاتصالات شهر يناير",
      },
      {
        expenseNumber: "EXP-2025-021",
        title: "حملة تسويق وإعلانات رقمية Google & Meta",
        category: "تسويق وإعلان",
        amount: "8500.00",
        taxAmount: "1275.00",
        paymentMethod: "بطاقة ائتمان",
        branchId: b1.id,
        department: "المبيعات والتسويق",
        expenseDate: "2025-02-02",
        status: "معتمد",
        approvedBy: "م. عبد الرحمن العتيبي",
        receiptRef: "META-2025-88",
        notes: "حملة استهداف العملاء للربع الأول",
      },
    ]);

    // 13. POS Shifts
    await db.insert(posShifts).values([
      {
        branchId: b1.id,
        cashierId: 3,
        openingCash: "1000.00",
        status: "مفتوحة",
        notes: "وردية صباحية - كاشير رقم 1",
      },
    ]);

    // 14. Stock Movements
    await db.insert(stockMovements).values([
      {
        productId: insertedProducts[0].id,
        branchId: b1.id,
        type: "إدخال",
        quantity: 10,
        referenceNo: "PO-2025-001",
        createdByName: "فهد الدوسري",
        notes: "استلام شحنة جديدة من المورد",
      },
      {
        productId: insertedProducts[0].id,
        branchId: b2.id,
        type: "تحويل_إلى_فرع",
        quantity: 3,
        referenceNo: "TRF-2025-004",
        createdByName: "فهد الدوسري",
        notes: "تحويل من فرع الرياض إلى فرع جدة",
      },
    ]);

    // 15. Audit Trail Log
    await db.insert(auditLogs).values([
      { userName: "م. عبد الرحمن العتيبي", action: "تسجيل دخول", module: "الأمان", details: "تسجيل دخول ناجح إلى النظام الرئيسي", ipAddress: "192.168.1.10" },
      { userName: "سارة الشمري", action: "إضافة فاتورة مشتريات", module: "المشتريات", details: "إنشاء فاتورة مشتريات PINV-2025-001 بقيمة 27,600 ريال", ipAddress: "192.168.1.14" },
    ]);

    return { success: true, message: "Database seeded successfully" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, error: String(error) };
  }
}
