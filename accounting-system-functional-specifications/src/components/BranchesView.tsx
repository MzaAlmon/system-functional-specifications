"use client";

import React, { useState } from "react";
import { Building2, Plus, Phone, MapPin, CheckCircle, RefreshCw, X } from "lucide-react";

interface BranchesViewProps {
  branches: any[];
  onRefresh: () => void;
}

export function BranchesView({ branches, onRefresh }: BranchesViewProps) {
  const [addModal, setAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    code: "",
    name: "",
    address: "",
    phone: "",
    city: "الرياض",
  });

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const code = newBranch.code || "BR-0" + (branches.length + 1);
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBranch, code }),
      });
      if (res.ok) {
        setAddModal(false);
        setNewBranch({ code: "", name: "", address: "", phone: "", city: "الرياض" });
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span>إدارة الفروع المتعددة (Multi-Branch System)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            إدارة بيانات وفروع المنشأة، تصفية التقارير لكل فرع، ومتابعة الأداء الإجمالي المجمّع.
          </p>
        </div>

        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فرع جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs text-emerald-400 font-bold">{b.code}</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                فرع نشط
              </span>
            </div>
            <h3 className="font-extrabold text-slate-100 text-base">{b.name}</h3>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{b.address || b.city || "المنطقة المركزية"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{b.phone || "011-0000000"}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة فرع جديد</h3>
              <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الفرع:</label>
                <input
                  type="text"
                  required
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="فرع المبرز - الأحساء"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المدينة:</label>
                  <input
                    type="text"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الهاتف:</label>
                  <input
                    type="text"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                تأكيد وحفظ الفرع
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
