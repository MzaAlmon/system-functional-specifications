"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Building2,
  RefreshCw,
  Package,
} from "lucide-react";

interface DashboardViewProps {
  selectedBranchId: number | null;
  branches: any[];
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ selectedBranchId, branches, setActiveTab }: DashboardViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const url = selectedBranchId
        ? `/api/dashboard?branchId=${selectedBranchId}`
        : "/api/dashboard";
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBranchId]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-emerald-400 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>جاري تحميل المؤشرات والتقارير المالية...</span>
        </div>
      </div>
    );
  }

  const selectedBranchName = selectedBranchId
    ? branches.find((b) => b.id === selectedBranchId)?.name || "الفرع المالي"
    : "جميع الفروع (تجميعي)";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>لوحة الأداء والتحليل المالي</span>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              {selectedBranchName}
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            بيانات الوقت الفعلي للإيرادات، المصروفات، الأرباح، وحالة المخزون في المنظومة.
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          تحديث البيانات
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المبيعات</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">{data.totalSales?.toLocaleString("ar-SA")}</span>
            <span className="text-xs text-emerald-400 font-bold mr-1">ر.س</span>
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400 gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>شاملة ضريبة القيمة المضافة (15%)</span>
          </div>
        </div>

        {/* Total Purchases */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-blue-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المشتريات</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">{data.totalPurchases?.toLocaleString("ar-SA")}</span>
            <span className="text-xs text-blue-400 font-bold mr-1">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            عدد فواتير المشتريات: {data.purchasesCount}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:border-rose-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">المصاريف التشغيلية</span>
            <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-100">{data.totalExpenses?.toLocaleString("ar-SA")}</span>
            <span className="text-xs text-rose-400 font-bold mr-1">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-400 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>خصم مباشر من الأرباح</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">صافي الربح التقديري</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-400">{data.netProfit?.toLocaleString("ar-SA")}</span>
            <span className="text-xs text-emerald-300 font-bold mr-1">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400/80">
            الإيرادات - (المشتريات + المصاريف)
          </div>
        </div>
      </div>

      {/* Secondary Metrics & Financial Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receivables vs Payables */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>تتبع الذمم والديون</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">ديون مستحقة على العملاء (Maturity)</span>
                <span className="text-lg font-bold text-emerald-400">{data.totalReceivables?.toLocaleString("ar-SA")} ر.س</span>
              </div>
              <button
                onClick={() => setActiveTab("sales")}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                متابعة
              </button>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">مستحقات للموردين (Payables)</span>
                <span className="text-lg font-bold text-rose-400">{data.totalPayables?.toLocaleString("ar-SA")} ر.س</span>
              </div>
              <button
                onClick={() => setActiveTab("purchases")}
                className="text-xs text-rose-400 hover:underline font-semibold"
              >
                متابعة
              </button>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>تنبيهات حركة المخزون</span>
            <Package className="w-4 h-4 text-amber-400" />
          </h3>
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-amber-300">{data.lowStockCount} منتجات</span>
              <p className="text-xs text-amber-400/80">وصلت أو تجاوزت الحد الأدنى للمخزون بالفرع</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>القيمة التقديرية للمخزون:</span>
            <span className="font-bold text-slate-200">{data.inventoryValuation?.toLocaleString("ar-SA")} ر.س</span>
          </div>
          <button
            onClick={() => setActiveTab("inventory")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs py-2 rounded-xl transition border border-slate-700"
          >
            عرض تقرير الجرد وحركية المنتجات
          </button>
        </div>

        {/* Sales Payment Method Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>توزيع طرق دفع المبيعات</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </h3>
          <div className="space-y-2">
            {Object.entries(data.paymentMethodsSummary || {}).map(([method, amount]: [string, any]) => (
              <div key={method} className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-300 font-medium">💳 {method}</span>
                <span className="font-bold text-emerald-400">{Number(amount).toLocaleString("ar-SA")} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Monthly Financial Trend Visual Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>المقارنة الشهرية (المبيعات مقابل المشتريات والمصاريف)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.monthlyData?.map((m: any) => (
            <div key={m.month} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                <span>شهر {m.month}</span>
                <span className="text-emerald-400">الربح: {(m.sales - m.purchases - m.expenses).toLocaleString("ar-SA")} ر.س</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>المبيعات</span>
                    <span className="font-semibold text-emerald-400">{m.sales.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>المشتريات</span>
                    <span className="font-semibold text-blue-400">{m.purchases.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: "55%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>المصاريف</span>
                    <span className="font-semibold text-rose-400">{m.expenses.toLocaleString("ar-SA")} ر.س</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: "25%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
