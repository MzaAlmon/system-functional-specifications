"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Users, Plus, Key, Lock, Check, X } from "lucide-react";

interface RolesViewProps {
  roles: any[];
  onRefresh: () => void;
  branches: any[];
}

export function RolesView({ roles, onRefresh, branches }: RolesViewProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [subTab, setSubTab] = useState<"users" | "roles">("users");
  const [loading, setLoading] = useState(true);

  // Modals
  const [addUserModal, setAddUserModal] = useState(false);
  const [addRoleModal, setAddRoleModal] = useState(false);

  // Forms
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    roleId: roles[0]?.id || 1,
    branchId: branches[0]?.id || 1,
  });

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: ["dashboard_view", "pos_access", "sales_view", "purchases_view"],
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setAddUserModal(false);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });
      if (res.ok) {
        setAddRoleModal(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const allPerms = [
    { code: "dashboard_view", label: "عرض لوحة التحكم الرئيسية" },
    { code: "pos_access", label: "وصول لنقطة البيع (POS Cashier)" },
    { code: "sales_view", label: "عرض المبيعات والعملاء" },
    { code: "purchases_view", label: "عرض المشتريات والموردين" },
    { code: "inventory_view", label: "إدارة المخزون والتسويات" },
    { code: "payroll_view", label: "إدارة الرواتب والأجور" },
    { code: "expenses_view", label: "إدارة المصاريف والنفقات" },
    { code: "roles_manage", label: "إدارة الصلاحيات والأدوار" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span>نظام الصلاحيات والأدوار (Permissions & RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تحديد الأدوار، مصفوفة الصلاحيات لكل دور، وإسناد الأدوار والفروع للمستخدمين.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddUserModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>
          <button
            onClick={() => setAddRoleModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Key className="w-4 h-4 text-blue-400" />
            <span>إنشاء دور مخصص</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab("users")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            subTab === "users"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          حسابات المستخدمين ({users.length})
        </button>
        <button
          onClick={() => setSubTab("roles")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            subTab === "roles"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          مصفوفة الأدوار والصلاحيات ({roles.length})
        </button>
      </div>

      {subTab === "users" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3.5">اسم المستخدم</th>
                <th className="p-3.5">الاسم الكامل</th>
                <th className="p-3.5">البريد الإلكتروني</th>
                <th className="p-3.5">الدور الموكل</th>
                <th className="p-3.5">الفرع الرئيسي</th>
                <th className="p-3.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-blue-400 font-bold">{u.username}</td>
                  <td className="p-3.5 font-bold text-slate-100">{u.fullName}</td>
                  <td className="p-3.5 text-slate-400">{u.email}</td>
                  <td className="p-3.5 font-bold text-emerald-400">{u.roleName || "مدير النظام"}</td>
                  <td className="p-3.5 text-slate-300">{u.branchName || "الرئيسي"}</td>
                  <td className="p-3.5 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      نشط
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((r) => {
            let permsArr: string[] = [];
            try {
              permsArr = typeof r.permissions === "string" ? JSON.parse(r.permissions) : r.permissions || [];
            } catch (e) {
              permsArr = [];
            }

            return (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-extrabold text-slate-100 text-sm">{r.name}</h3>
                  <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {permsArr.length} صلاحيات
                  </span>
                </div>
                <p className="text-xs text-slate-400">{r.description || "دور مسند مع صلاحيات معرفة مسبقاً"}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {permsArr.map((p: string) => (
                    <span key={p} className="bg-slate-950 text-blue-300 border border-slate-800 text-[10px] font-mono px-2 py-1 rounded-md">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة مستخدم جديد</h3>
              <button onClick={() => setAddUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم المستخدم (Username):</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="cashier_dammam"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="سعد بن خالد الدوسري"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الدور الموكل:</label>
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({ ...newUser, roleId: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">الفرع الرئيسي:</label>
                  <select
                    value={newUser.branchId}
                    onChange={(e) => setNewUser({ ...newUser, branchId: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                إنشاء وتأكيد الحساب
              </button>
            </form>
          </div>
        </div>
      )}

      {addRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إنشاء دور مخصص جديد</h3>
              <button onClick={() => setAddRoleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم الدور:</label>
                <input
                  type="text"
                  required
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="مشرف المبيعات والمشتريات"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الوصف:</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                إنشاء الدور
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
