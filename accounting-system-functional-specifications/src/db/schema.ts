import { pgTable, serial, text, numeric, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";

// 1. Branches Table
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  city: text("city"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 2. Roles Table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  permissions: text("permissions").notNull(), // JSON string array of permission codes
  isSystem: boolean("is_system").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  roleId: integer("role_id").references(() => roles.id),
  branchId: integer("branch_id").references(() => branches.id),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Categories & Units
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),
  icon: text("icon"),
});

export const unitsOfMeasure = pgTable("units_of_measure", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
});

// 5. Products Catalog
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode").unique(),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  unitId: integer("unit_id").references(() => unitsOfMeasure.id),
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull().default("0.00"),
  minStockLevel: integer("min_stock_level").default(5),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Stock per branch
export const branchProducts = pgTable("branch_products", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  reorderPoint: integer("reorder_point").default(5),
});

// 6. Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  companyName: text("company_name"),
  phone: text("phone"),
  email: text("email"),
  taxNumber: text("tax_number"),
  address: text("address"),
  category: text("category").default("عام"),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: text("status").default("نشط").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Customers
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  taxNumber: text("tax_number"),
  address: text("address"),
  classification: text("classification").default("عميل تجزئة"), // تجزئة، جملة، VIP، حكومي
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).default("10000.00"),
  balance: numeric("balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: text("status").default("نشط").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Purchase Orders & Invoices & Returns
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  orderDate: date("order_date").notNull(),
  expectedDeliveryDate: date("expected_delivery_date"),
  status: text("status").default("مسودة").notNull(), // مسودة، تم الإرسال، مستلم جزئياً، مستلم، ملغى
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).default("0.00").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").references(() => purchaseOrders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
});

export const purchaseInvoices = pgTable("purchase_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  poId: integer("po_id").references(() => purchaseOrders.id),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  status: text("status").default("غير مدفوع").notNull(), // غير مدفوع، مدفوع جزئياً، مدفوع
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseReturns = pgTable("purchase_returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  returnDate: date("return_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Sales Quotations, Orders, Invoices, Returns
export const salesQuotations = pgTable("sales_quotations", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  quoteDate: date("quote_date").notNull(),
  expiryDate: date("expiry_date"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("ساري").notNull(), // ساري، مقبول، مرفوض، منتهي
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  orderDate: date("order_date").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("قيد الانتظار").notNull(), // قيد الانتظار، مكتمل، ملغى
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesInvoices = pgTable("sales_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  cashierId: integer("cashier_id").references(() => users.id),
  invoiceType: text("invoice_type").default("تجزئة").notNull(), // تجزئة (POS)، فاتورة ضريبية، جملة
  paymentMethod: text("payment_method").default("نقداً").notNull(), // نقداً، شبكة/بطاقة، تحويل، دفع مقسم
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("مدفوع").notNull(), // مدفوع، غير مدفوع، مدفوع جزئياً
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salesInvoiceItems = pgTable("sales_invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => salesInvoices.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const salesReturns = pgTable("sales_returns", {
  id: serial("id").primaryKey(),
  returnNumber: text("return_number").notNull().unique(),
  salesInvoiceId: integer("sales_invoice_id").references(() => salesInvoices.id),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  returnDate: date("return_date").notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Employees & Payroll
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeCode: text("employee_code").notNull().unique(),
  fullName: text("full_name").notNull(),
  jobTitle: text("job_title").notNull(),
  department: text("department").notNull(),
  phone: text("phone"),
  email: text("email"),
  nationalId: text("national_id"),
  contractType: text("contract_type").default("دوام كامل"), // دوام كامل، جزئي، تعاقد
  joinDate: date("join_date").notNull(),
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),
  housingAllowance: numeric("housing_allowance", { precision: 12, scale: 2 }).default("0.00"),
  transportAllowance: numeric("transport_allowance", { precision: 12, scale: 2 }).default("0.00"),
  otherAllowances: numeric("other_allowances", { precision: 12, scale: 2 }).default("0.00"),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  status: text("status").default("نشط").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payrollRuns = pgTable("payroll_runs", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  status: text("status").default("مسودة").notNull(), // مسودة، معتمد، مدفوع
  totalBasic: numeric("total_basic", { precision: 12, scale: 2 }).notNull(),
  totalAllowances: numeric("total_allowances", { precision: 12, scale: 2 }).notNull(),
  totalDeductions: numeric("total_deductions", { precision: 12, scale: 2 }).notNull(),
  totalNet: numeric("total_net", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payrollItems = pgTable("payroll_items", {
  id: serial("id").primaryKey(),
  payrollId: integer("payroll_id").references(() => payrollRuns.id).notNull(),
  employeeId: integer("employee_id").references(() => employees.id).notNull(),
  basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),
  allowances: numeric("allowances", { precision: 12, scale: 2 }).notNull(),
  deductions: numeric("deductions", { precision: 12, scale: 2 }).notNull(),
  advances: numeric("advances", { precision: 12, scale: 2 }).default("0.00").notNull(),
  netSalary: numeric("net_salary", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").default("قيد الانتظار").notNull(),
});

// 11. Expenses & Approvals
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  expenseNumber: text("expense_number").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(), // مصاريف تشغيلية، إيجارات، تسويق، صيانة، مرافق، نثرية
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  paymentMethod: text("payment_method").default("نقداً").notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  department: text("department"),
  expenseDate: date("expense_date").notNull(),
  status: text("status").default("معتمد").notNull(), // قيد الموافقة، معتمد، مرفوض
  approvedBy: text("approved_by"),
  receiptRef: text("receipt_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. POS Shifts
export const posShifts = pgTable("pos_shifts", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  cashierId: integer("cashier_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  openingCash: numeric("opening_cash", { precision: 12, scale: 2 }).notNull(),
  closingCashSystem: numeric("closing_cash_system", { precision: 12, scale: 2 }),
  closingCashActual: numeric("closing_cash_actual", { precision: 12, scale: 2 }),
  discrepancy: numeric("discrepancy", { precision: 12, scale: 2 }),
  status: text("status").default("مفتوحة").notNull(), // مفتوحة، مغلقة
  notes: text("notes"),
});

// 13. Stock Movements
export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  type: text("type").notNull(), // إدخال، إخراج، تحويل_إلى_فرع، تسوية، مبيعات_POS
  quantity: integer("quantity").notNull(),
  referenceNo: text("reference_no"),
  notes: text("notes"),
  createdByName: text("created_by_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Company Settings
export const companySettings = pgTable("company_settings", {
  id: serial("id").primaryKey(),
  companyNameAr: text("company_name_ar").notNull().default("شركة الأفق الرقمي للتجارة والمحاسبة"),
  companyNameEn: text("company_name_en").notNull().default("Horizon Digital ERP Co."),
  vatNumber: text("vat_number").notNull().default("310123456700003"),
  crNumber: text("cr_number").default("1010987654"),
  phone: text("phone").default("+966 11 456 7890"),
  email: text("email").default("info@horizon-erp.sa"),
  address: text("address").default("الرياض - طريق الملك فهد - البرج التجاري"),
  currency: text("currency").default("SAR").notNull(),
  currencySymbol: text("currency_symbol").default("ر.س").notNull(),
  defaultVatRate: numeric("default_vat_rate", { precision: 5, scale: 2 }).default("15.00").notNull(),
  logoUrl: text("logo_url"),
  receiptHeader: text("receipt_header").default("أهلاً بكم في متجرنا - نتمنى لكم تجربة تسوق ممتعة"),
  receiptFooter: text("receipt_footer").default("البضاعة المباعة ترد وتستبدل خلال 14 يوماً بشرط وجود الفاتورة الأصلية. شكراً لزيارتكم!"),
  enableZatcaQr: boolean("enable_zatca_qr").default(true),
});

// 15. Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userName: text("user_name").notNull(),
  action: text("action").notNull(),
  module: text("module").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
