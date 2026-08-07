"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Building2,
  FileText,
  Plus,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  CreditCard,
  DollarSign,
} from "lucide-react";

interface PurchasesViewProps {
  selectedBranchId: number | null;
}

export function PurchasesView({ selectedBranchId }: PurchasesViewProps) {
  const [subTab, setSubTab] = useState<"invoices" | "orders" | "suppliers" | "returns">("invoices");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addSupplierModal, setAddSupplierModal] = useState(false);
  const [addInvoiceModal, setAddInvoiceModal] = useState(false);

  // Forms
  const [newSup, setNewSup] = useState({
    name: "",
    companyName: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
    category: "عام",
  });

  const [newInv, setNewInv] = useState({
    supplierId: 1,
    branchId: selectedBranchId || 1,
    invoiceDate: new Date().toISOString().split("T")[0],
    totalAmount: "10000.00",
    taxAmount: "1500.00",
    grandTotal: "11500.00",
    paidAmount: "5000.00",
    status: "مدفوع جزئياً",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const invRes = await fetch("/api/purchases?type=invoices");
      const invData = await invRes.json();
      setInvoices(Array.isArray(invData) ? invData : []);

      const oRes = await fetch("/api/purchases?type=orders");
      const oData = await oRes.json();
      setOrders(Array.isArray(oData) ? oData : []);

      const sRes = await fetch("/api/suppliers");
      const sData = await sRes.json();
      setSuppliers(Array.isArray(sData) ? sData : []);

      const rRes = await fetch("/api/purchases?type=returns");
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

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSup),
      });
      if (res.ok) {
        setAddSupplierModal(false);
        setNewSup({
          name: "",
          companyName: "",
          phone: "",
          email: "",
          taxNumber: "",
          address: "",
          category: "عام",
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
      const res = await fetch("/api/purchases?type=invoices", {
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
            <ShoppingBag className="w-5 h-5 text-blue-400" />
            <span>وحدة المشتريات والموردين</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تسجيل أوامر الشراء، فواتير المشتريات والمستندات، دفعات الموردين ومرتجعات الشراء.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddInvoiceModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل فاتورة مشتريات</span>
          </button>
          <button
            onClick={() => setAddSupplierModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>إضافة مورد جديد</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "invoices", label: `فواتير المشتريات (${invoices.length})` },
          { id: "orders", label: `أوامر الشراء (${orders.length})` },
          { id: "suppliers", label: `سجل الموردين (${suppliers.length})` },
          { id: "returns", label: `مرتجعات المشتريات (${returns.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition ${
              subTab === tab.id
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "invoices" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">رقم الفاتورة</th>
                <th className="p-3.5">المورد</th>
                <th className="p-3.5">الفرع</th>
                <th className="p-3.5">تاريخ الفاتورة</th>
                <th className="p-3.5">الإجمالي</th>
                <th className="p-3.5">المدفوع للمورد</th>
                <th className="p-3.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-blue-400 font-bold">{inv.invoiceNumber}</td>
                  <td className="p-3.5 font-bold">{inv.supplierName}</td>
                  <td className="p-3.5 text-slate-400">{inv.branchName || "الرئيسي"}</td>
                  <td className="p-3.5 text-slate-400">{inv.invoiceDate}</td>
                  <td className="p-3.5 font-bold text-blue-400">{Number(inv.grandTotal).toFixed(2)} ر.س</td>
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

      {subTab === "suppliers" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">كود المورد</th>
                <th className="p-3.5">اسم المورد / الشركة</th>
                <th className="p-3.5">الهاتف</th>
                <th className="p-3.5">الرقم الضريبي</th>
                <th className="p-3.5 text-center">الرصيد المستحق للمورد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-blue-400 font-bold">{s.code}</td>
                  <td className="p-3.5 font-bold text-slate-100">{s.name}</td>
                  <td className="p-3.5 font-mono text-slate-400">{s.phone || "—"}</td>
                  <td className="p-3.5 font-mono text-slate-400">{s.taxNumber || "—"}</td>
                  <td className="p-3.5 text-center font-bold text-rose-400">
                    {Number(s.balance).toLocaleString("ar-SA")} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Supplier Modal */}
      {addSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة مورد جديد</h3>
              <button onClick={() => setAddSupplierModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم المورد / الشركة:</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder="شركة التوريدات الوطنية"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الهاتف:</label>
                  <input
                    type="text"
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الرقم الضريبي:</label>
                  <input
                    type="text"
                    value={newSup.taxNumber}
                    onChange={(e) => setNewSup({ ...newSup, taxNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                حفظ بيانات المورد
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Purchase Invoice Modal */}
      {addInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">تسجيل فاتورة مشتريات</h3>
              <button onClick={() => setAddInvoiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اختر المورد:</label>
                <select
                  value={newInv.supplierId}
                  onChange={(e) => setNewInv({ ...newInv, supplierId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">إجمالي المبلغ (شامل الضريبة):</label>
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
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold text-blue-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ المسدد حالياً للمورد:</label>
                <input
                  type="number"
                  step="0.01"
                  value={newInv.paidAmount}
                  onChange={(e) => setNewInv({ ...newInv, paidAmount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                تسجيل وتأكيد الشراء
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
