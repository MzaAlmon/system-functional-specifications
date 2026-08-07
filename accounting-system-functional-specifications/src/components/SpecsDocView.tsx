"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Users,
  Receipt,
  Calculator,
  Package,
  Barcode,
  Building2,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Lock,
  Smartphone,
  CheckCircle,
} from "lucide-react";

interface SpecsDocViewProps {
  onNavigateToTab: (tabId: string) => void;
}

export function SpecsDocView({ onNavigateToTab }: SpecsDocViewProps) {
  const [specs, setSpecs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const res = await fetch("/api/specifications");
        const data = await res.json();
        setSpecs(data);
        // Expand first 3 modules by default
        if (data.modules) {
          const initExp: Record<string, boolean> = {};
          data.modules.slice(0, 3).forEach((m: any) => {
            initExp[m.id] = true;
          });
          setExpandedModules(initExp);
        }
      } catch (err) {
        console.error("Error loading specs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, []);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    if (!specs?.modules) return;
    const all: Record<string, boolean> = {};
    specs.modules.forEach((m: any) => {
      all[m.id] = true;
    });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const mapIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingBag": return <ShoppingBag className="w-5 h-5 text-blue-400" />;
      case "TrendingUp": return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "Users": return <Users className="w-5 h-5 text-purple-400" />;
      case "Receipt": return <Receipt className="w-5 h-5 text-rose-400" />;
      case "Calculator": return <Calculator className="w-5 h-5 text-amber-400" />;
      case "Package": return <Package className="w-5 h-5 text-teal-400" />;
      case "Barcode": return <Barcode className="w-5 h-5 text-cyan-400" />;
      case "Building2": return <Building2 className="w-5 h-5 text-emerald-400" />;
      case "LayoutDashboard": return <LayoutDashboard className="w-5 h-5 text-indigo-400" />;
      case "Settings": return <Settings className="w-5 h-5 text-slate-400" />;
      case "ShieldCheck": return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case "Lock": return <Lock className="w-5 h-5 text-rose-400" />;
      case "Smartphone": return <Smartphone className="w-5 h-5 text-emerald-400" />;
      default: return <BookOpen className="w-5 h-5 text-emerald-400" />;
    }
  };

  const getModuleTabId = (modId: string) => {
    switch (modId) {
      case "purchases": return "purchases";
      case "sales": return "sales";
      case "payroll": return "payroll";
      case "expenses": return "expenses";
      case "pos": return "pos";
      case "inventory": return "inventory";
      case "barcode": return "barcode";
      case "branches": return "branches";
      case "dashboard": return "dashboard";
      case "settings": return "settings";
      case "permissions": return "users_roles";
      case "auth": return "users_roles";
      case "performance": return "dashboard";
      default: return "dashboard";
    }
  };

  if (loading || !specs) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-emerald-400 font-bold">
        <span>جاري تحميل وثيقة المواصفات الوظيفية المفصلة...</span>
      </div>
    );
  }

  const filteredModules = specs.modules.filter((m: any) => {
    const q = searchQuery.toLowerCase();
    const matchTitle = m.title.toLowerCase().includes(q);
    const matchDesc = m.description.toLowerCase().includes(q);
    const matchFeatures = m.features.some((f: string) => f.toLowerCase().includes(q));
    return matchTitle || matchDesc || matchFeatures;
  });

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Specification Document Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-6 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                وثيقة مواصفات هندسية وظيفية (Functional Specifications SRS)
              </span>
              <h2 className="text-xl font-extrabold text-slate-100 mt-1">{specs.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(specs, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "Functional_Specifications_ERP.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-amber-500/30 transition shadow"
            >
              <Download className="w-4 h-4" />
              <span>تصدير المورد (JSON)</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
          {specs.overview}
        </p>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 font-mono">
          <span>الإصدار: {specs.version}</span>
          <span>إعداد: {specs.author}</span>
          <span>تاريخ التوثيق: {specs.date}</span>
        </div>
      </div>

      {/* Search & Collapse Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث في المتطلبات والوظائف وتدفق العمل (Workflow)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          >
            توسيع الكل
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
          >
            طي الكل
          </button>
        </div>
      </div>

      {/* Chapters Accordion */}
      <div className="space-y-4">
        {filteredModules.map((mod: any) => {
          const isExpanded = expandedModules[mod.id];
          return (
            <div
              key={mod.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition hover:border-slate-700"
            >
              {/* Chapter Header Bar */}
              <div
                onClick={() => toggleModule(mod.id)}
                className="flex items-center justify-between p-4 bg-slate-950/60 hover:bg-slate-950 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                    {mapIcon(mod.icon)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-100">{mod.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToTab(getModuleTabId(mod.id));
                    }}
                    className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/30 transition"
                  >
                    <span>تجربة الوحدة المباشرة</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Chapter Details Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 space-y-4 text-xs bg-slate-900/50 animate-fadeIn">
                  {/* Key Features Bullet List */}
                  <div>
                    <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>الميزات الوظيفية الرئيسية (Functional Requirements):</span>
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-200 pr-2">
                      {mod.features.map((feat: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* User Workflow Path */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                    <h5 className="font-bold text-slate-300 mb-1 text-[11px] text-emerald-400">
                      🔄 تدفق العمل التشغيلي (User Workflow):
                    </h5>
                    <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{mod.workflow}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
