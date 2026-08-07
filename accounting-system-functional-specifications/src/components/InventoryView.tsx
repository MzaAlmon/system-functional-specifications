"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  ArrowLeftRight,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle,
  Barcode,
  Building2,
  ListFilter,
} from "lucide-react";

interface InventoryViewProps {
  selectedBranchId: number | null;
  branches: any[];
}

export function InventoryView({ selectedBranchId, branches }: InventoryViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveTab] = useState<"catalog" | "movements">("catalog");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [addProductModal, setAddProductModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);

  // Forms
  const [newProd, setNewProduct] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: 1,
    unitId: 1,
    costPrice: "100.00",
    salePrice: "150.00",
    minStockLevel: 5,
    initialStock: 10,
  });

  const [transferForm, setTransferForm] = useState({
    productId: 1,
    fromBranchId: 1,
    toBranchId: 2,
    quantity: 5,
    notes: "",
  });

  const [adjustForm, setAdjustForm] = useState({
    productId: 1,
    branchId: 1,
    quantity: 10,
    notes: "تسوية جردية معتمدة",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const pRes = await fetch(`/api/products${selectedBranchId ? `?branchId=${selectedBranchId}` : ""}`);
      const pData = await pRes.json();
      setProducts(Array.isArray(pData) ? pData : []);

      const cRes = await fetch("/api/categories");
      const cData = await cRes.json();
      setCategories(Array.isArray(cData) ? cData : []);

      const mRes = await fetch("/api/inventory");
      const mData = await mRes.json();
      setMovements(Array.isArray(mData) ? mData : []);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranchId]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProd),
      });
      if (res.ok) {
        setAddProductModal(false);
        setNewProduct({
          name: "",
          sku: "",
          barcode: "",
          categoryId: 1,
          unitId: 1,
          costPrice: "100.00",
          salePrice: "150.00",
          minStockLevel: 5,
          initialStock: 10,
        });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "transfer", ...transferForm }),
      });
      if (res.ok) {
        setTransferModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjustment", ...adjustForm }),
      });
      if (res.ok) {
        setAdjustModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner & Operations */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <span>إدارة المخزون والمنتجات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            تتبع الأصناف، مستويات المخزون بالمنتج والفرع، التحويلات الداخلية والتسويات الجردية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddProductModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج جديد</span>
          </button>
          <button
            onClick={() => setTransferModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
            <span>تحويل بين الفروع</span>
          </button>
          <button
            onClick={() => setAdjustModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>تسوية جردية</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Catalog vs Movements Log */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === "catalog"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          دليل المنتجات والمخزون ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("movements")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === "movements"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          سجل حركات المخزون ({movements.length})
        </button>
      </div>

      {activeSubTab === "catalog" ? (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ابحث برمز SKU، الاسم، أو الباركود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Products Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="p-3.5">الرمز (SKU)</th>
                    <th className="p-3.5">الباركود</th>
                    <th className="p-3.5">اسم المنتج</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">سعر التكلفة</th>
                    <th className="p-3.5">سعر البيع</th>
                    <th className="p-3.5 text-center">المخزون الحالي</th>
                    <th className="p-3.5 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">{p.sku}</td>
                      <td className="p-3.5 font-mono text-slate-400">{p.barcode || "—"}</td>
                      <td className="p-3.5 font-bold text-slate-100">{p.name}</td>
                      <td className="p-3.5 text-slate-400">{p.categoryName || "عام"}</td>
                      <td className="p-3.5">{Number(p.costPrice).toFixed(2)} ر.س</td>
                      <td className="p-3.5 font-bold text-emerald-400">{Number(p.salePrice).toFixed(2)} ر.س</td>
                      <td className="p-3.5 text-center font-bold text-sm">
                        {p.currentStock}{" "}<span className="text-[10px] text-slate-400 font-normal">{p.unitSymbol || "قطعة"}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        {p.isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            منخفض
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            متوفر
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Movements Log */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="p-3.5">رقم الحركة / المستند</th>
                  <th className="p-3.5">المنتج</th>
                  <th className="p-3.5">الفرع</th>
                  <th className="p-3.5">نوع الحركة</th>
                  <th className="p-3.5 text-center">الكمية</th>
                  <th className="p-3.5">المسؤول</th>
                  <th className="p-3.5">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">{m.referenceNo}</td>
                    <td className="p-3.5 font-bold">{m.productName} ({m.productSku})</td>
                    <td className="p-3.5 text-slate-400">{m.branchName || "الفرع الرئيسي"}</td>
                    <td className="p-3.5 font-bold">
                      <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {m.type}
                      </span>
                    </td>
                    <td className={`p-3.5 text-center font-extrabold ${m.quantity > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="p-3.5 text-slate-400">{m.createdByName || "مسؤول"}</td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {addProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إضافة منتج جديد للكتالوج</h3>
              <button onClick={() => setAddProductModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اسم المنتج:</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProduct({ ...newProd, name: e.target.value })}
                  placeholder="مثال: لابتوب ديل XPS 15"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رمز SKU الفريد:</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) => setNewProduct({ ...newProd, sku: e.target.value })}
                    placeholder="PRD-1009"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">رمز الباركود (تلقائي إن ترك):</label>
                  <input
                    type="text"
                    value={newProd.barcode}
                    onChange={(e) => setNewProduct({ ...newProd, barcode: e.target.value })}
                    placeholder="6291100..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">سعر التكلفة (ر.س):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.costPrice}
                    onChange={(e) => setNewProduct({ ...newProd, costPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">سعر البيع (ر.س):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.salePrice}
                    onChange={(e) => setNewProduct({ ...newProd, salePrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">حد تنبيه المخزون الأدنى:</label>
                  <input
                    type="number"
                    value={newProd.minStockLevel}
                    onChange={(e) => setNewProduct({ ...newProd, minStockLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المخزون الافتتاحي الأولي:</label>
                  <input
                    type="number"
                    value={newProd.initialStock}
                    onChange={(e) => setNewProduct({ ...newProd, initialStock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                حفظ وإدراج المنتج
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">تحويل مخزون بين الفروع</h3>
              <button onClick={() => setTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اختر المنتج:</label>
                <select
                  value={transferForm.productId}
                  onChange={(e) => setTransferForm({ ...transferForm, productId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">من الفرع (المصدر):</label>
                  <select
                    value={transferForm.fromBranchId}
                    onChange={(e) => setTransferForm({ ...transferForm, fromBranchId: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">إلى الفرع (الوجهة):</label>
                  <select
                    value={transferForm.toBranchId}
                    onChange={(e) => setTransferForm({ ...transferForm, toBranchId: Number(e.target.value) })}
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

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الكمية المحولة:</label>
                <input
                  type="number"
                  min="1"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                تأكيد عملية التحويل
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Physical Count Adjustment Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">إجراء تسوية جردية للمخزون</h3>
              <button onClick={() => setAdjustModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">اختر المنتج:</label>
                <select
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الفرع الخاضع للجرد:</label>
                <select
                  value={adjustForm.branchId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, branchId: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">الكمية الفعلية المحصورة بالتسوية:</label>
                <input
                  type="number"
                  min="0"
                  value={adjustForm.quantity}
                  onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-bold text-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl transition"
              >
                حفظ وتطبيق التسوية
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
