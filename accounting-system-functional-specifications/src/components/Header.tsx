"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  Camera,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Barcode,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Receipt,
  Shield,
  Settings,
  Menu,
  X,
  Bell,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  branches: any[];
  selectedBranchId: number | null;
  setSelectedBranchId: (id: number | null) => void;
  roles: any[];
  currentRoleId: number;
  setCurrentRoleId: (id: number) => void;
  onOpenScanner: () => void;
  companyInfo: any;
}

export function Header({
  activeTab,
  setActiveTab,
  branches,
  selectedBranchId,
  setSelectedBranchId,
  roles,
  currentRoleId,
  setCurrentRoleId,
  onOpenScanner,
  companyInfo,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "pos", label: "نقطة البيع (POS)", icon: ShoppingCart },
    { id: "inventory", label: "المخزون والمنتجات", icon: Package },
    { id: "barcode", label: "الباركود والملصقات", icon: Barcode },
    { id: "sales", label: "المبيعات والعملاء", icon: TrendingUp },
    { id: "purchases", label: "المشتريات والموردين", icon: ShoppingBag },
    { id: "payroll", label: "الرواتب والأجور", icon: DollarSign },
    { id: "expenses", label: "المصاريف والتكاليف", icon: Receipt },
    { id: "branches", label: "إدارة الفروع", icon: Building2 },
    { id: "users_roles", label: "الصلاحيات والأدوار", icon: Shield },
    { id: "settings", label: "الإعدادات العامة", icon: Settings },
    { id: "specs_doc", label: "دليل المواصفات الوظيفية", icon: BookOpen, highlight: true },
  ];

  const activeBranchName =
    selectedBranchId === null
      ? "جميع الفروع (تجميعي)"
      : branches.find((b) => b.id === selectedBranchId)?.name || "فرع محدد";

  const activeRoleName = roles.find((r) => r.id === currentRoleId)?.name || "مدير النظام";

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-900/40">
              أ
            </div>
            <div>
              <h1 className="font-extrabold text-base sm:text-lg text-slate-100 leading-tight">
                {companyInfo?.companyNameAr || "شركة الأفق للحلول المحاسبية"}
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium hidden sm:block">
                نظام محاسبي ومالي متكامل | متعدد الفروع ZATCA ERP
              </p>
            </div>
          </div>

          {/* Controls: Branch Selector & Role Switcher & Camera Scanner */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Multi-Branch Selector Dropdown */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs transition cursor-pointer">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">{activeBranchName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="absolute right-0 top-full mt-1 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-700/50 mb-1">
                  اختر الفرع الحالي:
                </div>
                <button
                  onClick={() => setSelectedBranchId(null)}
                  className={`w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700/60 transition ${
                    selectedBranchId === null ? "text-emerald-400 font-bold bg-emerald-500/10" : "text-slate-300"
                  }`}
                >
                  🏢 جميع الفروع (مجمّع)
                </button>
                {branches.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBranchId(b.id)}
                    className={`w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700/60 transition ${
                      selectedBranchId === b.id ? "text-emerald-400 font-bold bg-emerald-500/10" : "text-slate-300"
                    }`}
                  >
                    📍 {b.name} ({b.code})
                  </button>
                ))}
              </div>
            </div>

            {/* Live Role Simulator Selector */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/50 rounded-xl px-3 py-1.5 text-xs transition cursor-pointer">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-slate-200">{activeRoleName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="absolute right-0 top-full mt-1 w-60 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-700/50 mb-1">
                  محاكاة الدور والمستخدم:
                </div>
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setCurrentRoleId(r.id)}
                    className={`w-full text-right px-3 py-1.5 text-xs hover:bg-slate-700/60 transition ${
                      currentRoleId === r.id ? "text-blue-400 font-bold bg-blue-500/10" : "text-slate-300"
                    }`}
                  >
                    👤 {r.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Camera Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition"
              title="مسح باركود مباشر عبر كاميرا الجوال/الحاسوب"
            >
              <Camera className="w-4 h-4 animate-bounce" />
              <span>ماسح الباركود</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={onOpenScanner}
              className="p-2 bg-emerald-600/30 text-emerald-400 rounded-lg"
              title="ماسح الباركود"
            >
              <Camera className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-xl border border-slate-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-reverse space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? item.highlight
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : item.highlight
                    ? "text-amber-400 hover:bg-amber-500/10 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.highlight && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 p-4 space-y-3 animate-fadeIn">
          {/* Branch & Role selector in mobile */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">الفرع الحالي:</span>
              <select
                value={selectedBranchId ?? ""}
                onChange={(e) => setSelectedBranchId(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent text-slate-200 font-bold w-full focus:outline-none"
              >
                <option value="">🏢 جميع الفروع</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl">
              <span className="text-[10px] text-slate-500 block">المستخدم والدور:</span>
              <select
                value={currentRoleId}
                onChange={(e) => setCurrentRoleId(Number(e.target.value))}
                className="bg-transparent text-blue-300 font-bold w-full focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-right border transition ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-900 text-slate-300 border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
