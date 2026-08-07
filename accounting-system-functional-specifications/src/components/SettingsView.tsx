"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Building2, CheckCircle, Receipt, DollarSign, Shield } from "lucide-react";

interface SettingsViewProps {
  companyInfo: any;
  onRefresh: () => void;
}

export function SettingsView({ companyInfo, onRefresh }: SettingsViewProps) {
  const [formData, setFormData] = useState<any>({ ...companyInfo });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (companyInfo) setFormData({ ...companyInfo });
  }, [companyInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/company-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSavedSuccess(true);
        onRefresh();
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>الإعدادات الشاملة للنظام وتخصيص الفواتير</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحديث اسم المنشأة، الرقم الضريبي (ZATCA)، العنوان، نسبة الضريبة، ونصوص الفاتورة الحرارية.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-xl font-bold animate-fadeIn">
            <CheckCircle className="w-4 h-4" />
            <span>تم حفظ الإعدادات بنجاح</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        {/* Company Identity */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>بيانات المنشأة والهوية التجارية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اسم الشركة (عربي):</label>
              <input
                type="text"
                required
                value={formData.companyNameAr || ""}
                onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اسم الشركة (إنجليزي):</label>
              <input
                type="text"
                value={formData.companyNameEn || ""}
                onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الرقم الضريبي (ZATCA VAT 15 الرقم):</label>
              <input
                type="text"
                required
                value={formData.vatNumber || ""}
                onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">رقم السجل التجاري (CR Number):</label>
              <input
                type="text"
                value={formData.crNumber || ""}
                onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">الهاتف / الجوال الرسمي:</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">العنوان والمقر الرئيسي:</label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Options */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>العملة ونسبة ضريبة القيمة المضافة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">العملة الأساسية (رمز):</label>
              <input
                type="text"
                value={formData.currencySymbol || "ر.س"}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">نسبة ضريبة القيمة المضافة (%):</label>
              <input
                type="number"
                step="0.01"
                value={formData.defaultVatRate || "15.00"}
                onChange={(e) => setFormData({ ...formData, defaultVatRate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Receipt Header & Footer Preferences */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>نصوص الفاتورة الحرارية ورسائل الترحيب</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">ترويسة الفاتورة (Header Note):</label>
              <input
                type="text"
                value={formData.receiptHeader || ""}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">تذييل الفاتورة وحقوق الاسترجاع (Footer Terms):</label>
              <textarea
                rows={3}
                value={formData.receiptFooter || ""}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "جاري الحفظ..." : "حفظ وتحديث إعدادات النظام"}</span>
        </button>
      </form>
    </div>
  );
}
