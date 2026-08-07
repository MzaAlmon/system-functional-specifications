"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Building2,
  Tag,
  DollarSign,
  X,
} from "lucide-react";

interface ExpensesViewProps {
  selectedBranchId: number | null;
  branches: any[];
}

export function ExpensesView({ selectedBranchId, branches }: ExpensesViewProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addExpenseModal, setAddExpenseModal] = useState(false);

  const [newExp, setNewExp] = useState({
    title: "",
    category: "مصاريف تشغيلية",
    amount: "1000.00",
    taxAmount: "150.00",
    paymentMethod: "نقداً",
    department: "التشغيل",
    branchId: selectedBranchId || 1,
    expenseDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [selectedBranchId]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newExp, branchId: selectedBranchId || 1 }),
      });
      if (res.ok) {
        setAddExpenseModal(false);
        setNewExp({
          title: "",
          category: "مصاريف تشغيلية",
          amount: "1000.00",
          taxAmount: "150.00",
          paymentMethod: "نقداً",
          department: "التشغيل",
          branchId: selectedBranchId || 1,
          expenseDate: new Date().toISOString().split("T")[0],
          notes: "",
        });
        loadExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, approvedBy: "المشرف المالي" }),
      });
      if (res.ok) {
        loadExpenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            <span>وحدة المصاريف والنفقات التشغيلية</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تسجيل وتصنيف المصروفات، متابعة دوائر الموافقات، وربط التكاليف بالفروع والأقسام.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">إجمالي المصاريف:</span>
            <span className="font-black text-rose-400 text-sm">{totalExpenseAmount.toLocaleString("ar-SA")} ر.س</span>
          </div>

          <button
            onClick={() => setAddExpenseModal(true)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>سند مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
            <tr>
              <th className="p-3.5">رقم السند</th>
              <th className="p-3.5">بيان المصروف / البند</th>
              <th className="p-3.5">الفئة</th>
              <th className="p-3.5">القسم والفرع</th>
              <th className="p-3.5">المبلغ (شامل الضريبة)</th>
              <th className="p-3.5">تاريخ المصروف</th>
              <th className="p-3.5 text-center">حالة الموافقة</th>
              <th className="p-3.5 text-center">إجراء الاعتماد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3.5 font-mono text-rose-400 font-bold">{exp.expenseNumber}</td>
                <td className="p-3.5 font-bold text-slate-100">{exp.title}</td>
                <td className="p-3.5">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                    {exp.category}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400">{exp.department || "عام"} - {exp.branchName || "الرئيسي"}</td>
                <td className="p-3.5 font-extrabold text-rose-400">{Number(exp.amount).toLocaleString("ar-SA")} ر.س</td>
                <td className="p-3.5 text-slate-400">{exp.expenseDate}</td>
                <td className="p-3.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.status === "معتمد"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : exp.status === "مرفوض"
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {exp.status}
                  </span>
                </td>
                <td className="p-3.5 text-center">
                  {exp.status === "قيد الموافقة" ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleUpdateStatus(exp.id, "معتمد")}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded text-[10px] font-bold"
                        title="اعتماد"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(exp.id, "مرفوض")}
                        className="bg-rose-600 hover:bg-rose-500 text-white p-1 rounded text-[10px] font-bold"
                        title="رفض"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500">تم البت</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {addExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">تسجيل سند مصروف جديد</h3>
              <button onClick={() => setAddExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">عنوان المصروف / البيان:</label>
                <input
                  type="text"
                  required
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  placeholder="مثال: فاتورة صيانة أجهزة التكييف"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">فئة المصروف:</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    <option value="مصاريف تشغيلية">مصاريف تشغيلية</option>
                    <option value="مصاريف إيجارات">إيجارات ورسوم</option>
                    <option value="مرافق وخدمات">مرافق (كهرباء/ماء/إنترنت)</option>
                    <option value="تسويق وإعلان">تسويق وإعلانات</option>
                    <option value="صيانة وقطع غيار">صيانة وإصلاح</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">القسم التابع:</label>
                  <input
                    type="text"
                    value={newExp.department}
                    onChange={(e) => setNewExp({ ...newExp, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">المبلغ الإجمالي (ر.س):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newExp.amount}
                  onChange={(e) => setNewExp({ ...newExp, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold text-rose-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                تسجيل سند المصروف
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
