"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  CreditCard,
  DollarSign,
  ArrowDownLeft,
} from "lucide-react";

interface SalesViewProps {
  selectedBranchId: number | null;
}

export function SalesView({ selectedBranchId }: SalesViewProps) {
  const [subTab, setSubTab] = useState<"invoices" | "quotations" | "orders" | "customers" | "returns">("invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addCustomerModal, setAddCustomerModal] = useState(false);
  const [addInvoiceModal, setAddInvoiceModal] = useState(false);

  // Form states
  const [newCust, setNewCust] = useState({
    name: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
    classification: "عميل تجزئة",
    creditLimit: "10000.00",
  });

  const [newInv, setNewInv] = useState({
    customerId: 1,
    branchId: selectedBranchId || 1,
    invoiceType: "فاتورة ضريبية",
    paymentMethod: "نقداً",
    totalAmount: "1000.00",
    taxAmount: "150.00",
    discountAmount: "0.00",
    grandTotal: "1150.00",
    paidAmount: "1150.00",
    status: "مدفوع",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const invRes = await fetch("/api/sales?type=invoices");
      const invData = await invRes.json();
      setInvoices(Array.isArray(invData) ? invData : []);

      const qRes = await fetch("/api/sales?type=quotations");
      const qData = await qRes.json();
      setQuotations(Array.isArray(qData) ? qData : []);

      const oRes = await fetch("/api/sales?type=orders");
      const oData = await oRes.json();
      setOrders(Array.isArray(oData) ? oData : []);

      const cRes = await fetch("/api/customers");
      const cData = await cRes.json();
      setCustomers(Array.isArray(cData) ? cData : []);

      const rRes = await fetch("/api/sales?type=returns");
      const rData = await rRes.json();
      setReturns(Array.isArray(rData) ? rData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCust),
      });
      if (res.ok) {
        setAddCustomerModal(false);
        setNewCust({
          name: "",
          phone: "",
          email: "",
          taxNumber: "",
          address: "",
          classification: "عميل تجزئة",
          creditLimit: "10000.00",
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sales?type=invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newInv, branchId: selectedBranchId || 1 }),
      });
      if (res.ok) {
        setAddInvoiceModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>وحدة المبيعات وإدارة العملاء</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إصدار الفواتير الضريبية، عروض الأسعار، أوامر البيع، تتبع الديون والتحصيلات ومرتجعات المبيعات.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddInvoiceModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء فاتورة مبيعات جديدة</span>
          </button>
          <button
            onClick={() => setAddCustomerModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>إضافة عميل جديد</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "invoices", label: `فواتير المبيعات (${invoices.length})` },
          { id: "quotations", label: `عروض الأسعار (${quotations.length})` },
          { id: "orders", label: `أوامر البيع (${orders.length})` },
          { id: "customers", label: `سجل العملاء (${customers.length})` },
          { id: "returns", label: `مرتجعات المبيعات (${returns.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
              subTab === tab.id
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content depending on subTab */}
      {subTab === "invoices" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">رقم الفاتورة</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">الفرع</th>
                <th className="p-3.5">نوع الفاتورة</th>
                <th className="p-3.5">طريقة الدفع</th>
                <th className="p-3.5">الإجمالي</th>
                <th className="p-3.5">المدفوع</th>
                <th className="p-3.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{inv.invoiceNumber}</td>
                  <td className="p-3.5 font-bold">{inv.customerName || "عميل نقد"}</td>
                  <td className="p-3.5 text-slate-400">{inv.branchName || "الرياض"}</td>
                  <td className="p-3.5">{inv.invoiceType}</td>
                  <td className="p-3.5">{inv.paymentMethod}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{Number(inv.grandTotal).toFixed(2)} ر.س</td>
                  <td className="p-3.5 text-slate-300">{Number(inv.paidAmount).toFixed(2)} ر.س</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === "مدفوع"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "customers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">كود العميل</th>
                <th className="p-3.5">الاسم / المنشأة</th>
                <th className="p-3.5">الهاتف</th>
                <th className="p-3.5">الرقم الضريبي</th>
                <th className="p-3.5">التصنيف</th>
                <th className="p-3.5">حد الائتمان</th>
                <th className="p-3.5 text-center">رصيد الدين الحالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{c.code}</td>
                  <td className="p-3.5 font-bold text-slate-100">{c.name}</td>
                  <td className="p-3.5 text-slate-400 font-mono">{c.phone || "—"}</td>
                  <td className="p-3.5 font-mono text-slate-400">{c.taxNumber || "—"}</td>
                  <td className="p-3.5">{c.classification}</td>
                  <td className="p-3.5 text-slate-300">{Number(c.creditLimit).toLocaleString("ar-SA")} ر.س</td>
                  <td className="p-3.5 text-center font-bold text-emerald-400">
                    {Number(c.balance).toLocaleString("ar-SA")} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "quotations" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">رقم العرض</th>
                <th className="p-3.5">العميل</th>
                <th className="p-3.5">تاريخ العرض</th>
                <th className="p-3.5">تاريخ الانتهاء</th>
                <th className="p-3.5">الإجمالي</th>
                <th className="p-3.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{q.quoteNumber}</td>
                  <td className="p-3.5 font-bold">{q.customerName}</td>
                  <td className="p-3.5 text-slate-400">{q.quoteDate}</td>
                  <td className="p-3.5 text-slate-400">{q.expiryDate}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{Number(q.grandTotal).toFixed(2)} ر.س</td>
                  <td className="p-3.5 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      {addCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة عميل جديد</h3>
              <button onClick={() => setAddCustomerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم العميل / المنشأة:</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="مؤسسة الرؤية الرقمية"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الهاتف:</label>
                  <input
                    type="text"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الرقم الضريبي:</label>
                  <input
                    type="text"
                    value={newCust.taxNumber}
                    onChange={(e) => setNewCust({ ...newCust, taxNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">التصنيف:</label>
                <select
                  value={newCust.classification}
                  onChange={(e) => setNewCust({ ...newCust, classification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  <option value="عميل تجزئة">عميل تجزئة</option>
                  <option value="عميل جملة">عميل جملة</option>
                  <option value="عميل رئيسي VIP">عميل رئيسي VIP</option>
                  <option value="حكومي/مؤسسي">حكومي/مؤسسي</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                حفظ بيانات العميل
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {addInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إصدار فاتورة مبيعات جديدة</h3>
              <button onClick={() => setAddInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">العميل:</label>
                <select
                  value={newInv.customerId}
                  onChange={(e) => setNewInv({ ...newInv, customerId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ الإجمالي النهائي (شامل الضريبة):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newInv.grandTotal}
                  onChange={(e) => {
                    const gt = Number(e.target.value);
                    const tax = gt * 0.15;
                    const tot = gt - tax;
                    setNewInv({
                      ...newInv,
                      grandTotal: String(gt),
                      taxAmount: tax.toFixed(2),
                      totalAmount: tot.toFixed(2),
                      paidAmount: String(gt),
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">طريقة الدفع:</label>
                <select
                  value={newInv.paymentMethod}
                  onChange={(e) => setNewInv({ ...newInv, paymentMethod: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  <option value="نقداً">نقداً (كاش)</option>
                  <option value="شبكة/بطاقة">شبكة / بطاقة مدى</option>
                  <option value="تحويل بنكي">تحويل بنكي مباشر</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                اعتماد وإصدار الفاتورة
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
