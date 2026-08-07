"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  Plus,
  Printer,
  X,
  FileCheck,
  Building2,
  Calendar,
} from "lucide-react";

interface PayrollViewProps {
  selectedBranchId: number | null;
  branches: any[];
}

export function PayrollView({ selectedBranchId, branches }: PayrollViewProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [selectedRunItems, setSelectedRunItems] = useState<any[]>([]);
  const [subTab, setSubTab] = useState<"employees" | "runs">("employees");
  const [loading, setLoading] = useState(true);

  // Modals
  const [addEmpModal, setAddEmpModal] = useState(false);
  const [runCalcModal, setRunCalcModal] = useState(false);
  const [payslipModal, setPayslipModal] = useState<any | null>(null);

  // Forms
  const [newEmp, setNewEmp] = useState({
    fullName: "",
    jobTitle: "محاسب",
    department: "المالية",
    phone: "",
    nationalId: "",
    basicSalary: "8000.00",
    housingAllowance: "2000.00",
    transportAllowance: "800.00",
    branchId: selectedBranchId || 1,
  });

  const [calcForm, setCalcForm] = useState({
    month: 2,
    year: 2025,
    branchId: selectedBranchId || 1,
    notes: "كشف رواتب شهر فبراير 2025 التلقائي",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const eRes = await fetch("/api/employees");
      const eData = await eRes.json();
      setEmployees(Array.isArray(eData) ? eData : []);

      const pRes = await fetch("/api/payroll");
      const pData = await pRes.json();
      setPayrollRuns(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEmp, joinDate: new Date().toISOString().split("T")[0] }),
      });
      if (res.ok) {
        setAddEmpModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calcForm),
      });
      if (res.ok) {
        setRunCalcModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRunDetails = async (runId: number) => {
    try {
      const res = await fetch(`/api/payroll?runId=${runId}`);
      const data = await res.json();
      setSelectedRunItems(Array.isArray(data) ? data : []);
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
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>وحدة الرواتب وإدارة الموظفين (Payroll & HR)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة عقود الموظفين، الراتب الأساسي والبدلات، الاحتساب الآلي لمسرد الرواتب وإصدار كشوف الرواتب.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRunCalcModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Calendar className="w-4 h-4" />
            <span>احتساب رواتب الشهر</span>
          </button>
          <button
            onClick={() => setAddEmpModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab("employees")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            subTab === "employees"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          سجل الموظفين والعقود ({employees.length})
        </button>
        <button
          onClick={() => setSubTab("runs")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            subTab === "runs"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          مسيرات الرواتب الشهرية ({payrollRuns.length})
        </button>
      </div>

      {subTab === "employees" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">الرقم الوظيفي</th>
                <th className="p-3.5">الاسم الكامل</th>
                <th className="p-3.5">المسمى الوظيفي</th>
                <th className="p-3.5">القسم والفرع</th>
                <th className="p-3.5">الراتب الأساسي</th>
                <th className="p-3.5">البدلات (سكن + نقل)</th>
                <th className="p-3.5 text-center">إجمالي الاستحقاق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {employees.map((e) => {
                const totalSalary = Number(e.basicSalary) + Number(e.housingAllowance || 0) + Number(e.transportAllowance || 0);
                return (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{e.employeeCode}</td>
                    <td className="p-3.5 font-bold text-slate-100">{e.fullName}</td>
                    <td className="p-3.5 text-slate-300">{e.jobTitle}</td>
                    <td className="p-3.5 text-slate-400">{e.department} - {e.branchName || "الرئيسي"}</td>
                    <td className="p-3.5 font-semibold">{Number(e.basicSalary).toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3.5 text-slate-300">
                      {(Number(e.housingAllowance || 0) + Number(e.transportAllowance || 0)).toLocaleString("ar-SA")} ر.س
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-400">
                      {totalSalary.toLocaleString("ar-SA")} ر.س
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3.5">شهر / سنة</th>
                  <th className="p-3.5">الفرع</th>
                  <th className="p-3.5">إجمالي الأساسي</th>
                  <th className="p-3.5">إجمالي البدلات</th>
                  <th className="p-3.5">الخصومات</th>
                  <th className="p-3.5">صافي الرواتب المصروفة</th>
                  <th className="p-3.5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {payrollRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-emerald-400">شهر {r.month} / {r.year}</td>
                    <td className="p-3.5 text-slate-400">{r.branchName || "جميع الفروع"}</td>
                    <td className="p-3.5">{Number(r.totalBasic).toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3.5 text-slate-300">{Number(r.totalAllowances).toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3.5 text-rose-400">-{Number(r.totalDeductions).toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3.5 font-extrabold text-emerald-400">{Number(r.totalNet).toLocaleString("ar-SA")} ر.س</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => loadRunDetails(r.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold px-3 py-1 rounded-lg border border-slate-700 transition"
                      >
                        عرض كشوف الرواتب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Run Payslips List */}
          {selectedRunItems.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
                <span>تفاصيل كشوف الرواتب المعتمدة للكشف المحسوب</span>
                <span className="text-xs text-emerald-400">{selectedRunItems.length} موظف</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedRunItems.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-100">{item.employeeName}</span>
                      <span className="text-emerald-400">{item.employeeCode}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      الوظيفة: {item.jobTitle} ({item.department})
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                      <span>الصافي المستحق:</span>
                      <span className="text-emerald-400">{Number(item.netSalary).toLocaleString("ar-SA")} ر.س</span>
                    </div>
                    <button
                      onClick={() => setPayslipModal(item)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] py-1.5 rounded-lg border border-slate-700 transition font-semibold"
                    >
                      عرض وطباعة كشف الرواتب (Payslip)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      {addEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة موظف جديد</h3>
              <button onClick={() => setAddEmpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الاسم الرباعي المعتمد:</label>
                <input
                  type="text"
                  required
                  value={newEmp.fullName}
                  onChange={(e) => setNewEmp({ ...newEmp, fullName: e.target.value })}
                  placeholder="محمد بن عبد الله الزهراني"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المسمى الوظيفي:</label>
                  <input
                    type="text"
                    required
                    value={newEmp.jobTitle}
                    onChange={(e) => setNewEmp({ ...newEmp, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">القسم:</label>
                  <input
                    type="text"
                    required
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الراتب الأساسي (ر.س):</label>
                  <input
                    type="number"
                    required
                    value={newEmp.basicSalary}
                    onChange={(e) => setNewEmp({ ...newEmp, basicSalary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">بدل السكن (ر.س):</label>
                  <input
                    type="number"
                    value={newEmp.housingAllowance}
                    onChange={(e) => setNewEmp({ ...newEmp, housingAllowance: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                حفظ العقد وإدراج الموظف
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calculate Payroll Run Modal */}
      {runCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">احتساب الرواتب الشهرية آلياً</h3>
              <button onClick={() => setRunCalcModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCalculatePayroll} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الشهر المستهدف:</label>
                  <select
                    value={calcForm.month}
                    onChange={(e) => setCalcForm({ ...calcForm, month: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>
                        شهر {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">السنة:</label>
                  <input
                    type="number"
                    value={calcForm.year}
                    onChange={(e) => setCalcForm({ ...calcForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                تشغيل محرك احتساب الرواتب
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {payslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">كشف مسرد الرواتب (Payslip)</h3>
              <button onClick={() => setPayslipModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white text-slate-900 p-5 rounded-xl border border-slate-300 font-sans text-xs space-y-3">
              <div className="text-center border-b pb-2">
                <h4 className="font-extrabold text-sm">شركة الأفق التجاريERP</h4>
                <p className="text-[10px] text-slate-500">كشف راتب شهري رسمي</p>
              </div>

              <div className="space-y-1">
                <p><strong>اسم الموظف:</strong> {payslipModal.employeeName}</p>
                <p><strong>الرقم الوظيفي:</strong> {payslipModal.employeeCode}</p>
                <p><strong>المسمى الوظيفي:</strong> {payslipModal.jobTitle} - {payslipModal.department}</p>
              </div>

              <div className="border-t pt-2 space-y-1 font-semibold">
                <div className="flex justify-between">
                  <span>الراتب الأساسي:</span>
                  <span>{Number(payslipModal.basicSalary).toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>إجمالي البدلات:</span>
                  <span>+{Number(payslipModal.allowances).toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between text-rose-700">
                  <span>إجمالي الخصومات والسلف:</span>
                  <span>-{Number(payslipModal.deductions).toLocaleString("ar-SA")} ر.س</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-slate-800 pt-1 text-slate-900">
                  <span>الصافي المستحق للصرف:</span>
                  <span>{Number(payslipModal.netSalary).toLocaleString("ar-SA")} ر.س</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة الكشف
              </button>
              <button onClick={() => setPayslipModal(null)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
