"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Search,
  Camera,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Lock,
  RefreshCw,
  X,
  CheckCircle,
  Barcode,
  Receipt,
  UserCheck,
} from "lucide-react";
import { ThermalReceiptModal } from "./ThermalReceiptModal";

interface POSViewProps {
  selectedBranchId: number | null;
  onOpenScanner: () => void;
  companyInfo: any;
}

export function POSView({ selectedBranchId, onOpenScanner, companyInfo }: POSViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<any[]>([]);
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Discount & Payment
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("نقداً");
  const [cashReceived, setCashReceived] = useState<number>(0);

  // Modals
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState("500");
  const [closingCashInput, setClosingCashInput] = useState("");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any>(null);

  const branchId = selectedBranchId || 1;

  const loadPosData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodRes = await fetch(`/api/products?branchId=${branchId}`);
      const prodData = await prodRes.json();
      setProducts(Array.isArray(prodData) ? prodData : []);

      // Fetch Categories
      const catRes = await fetch("/api/categories");
      const catData = await catRes.json();
      setCategories(Array.isArray(catData) ? catData : []);

      // Fetch Active Shift
      const shiftRes = await fetch(`/api/pos?branchId=${branchId}`);
      const shiftData = await shiftRes.json();
      setActiveShift(shiftData.activeShift || null);
    } catch (err) {
      console.error("Error loading POS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosData();
  }, [branchId]);

  // Cart operations
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          salePrice: Number(product.salePrice),
          quantity: 1,
          barcode: product.barcode,
        },
      ];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCashReceived(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
  const netBeforeTax = Math.max(0, subtotal - discountAmount);
  const taxAmount = netBeforeTax * 0.15;
  const grandTotal = netBeforeTax + taxAmount;
  const changeDue = Math.max(0, cashReceived - grandTotal);

  // Shift Management
  const handleOpenShift = async () => {
    try {
      const res = await fetch("/api/pos?action=open_shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branchId, cashierId: 1, openingCash: openingCashInput }),
      });
      if (res.ok) {
        setShiftModalOpen(false);
        loadPosData();
      }
    } catch (err) {
      console.error("Open shift error:", err);
    }
  };

  const handleCloseShift = async () => {
    if (!activeShift) return;
    try {
      const res = await fetch("/api/pos?action=close_shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shiftId: activeShift.id, closingCashActual: closingCashInput }),
      });
      if (res.ok) {
        setShiftModalOpen(false);
        setClosingCashInput("");
        loadPosData();
      }
    } catch (err) {
      console.error("Close shift error:", err);
    }
  };

  // Quick Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!activeShift) {
      setShiftModalOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/pos?action=checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          cashierId: 1,
          customerId: 3, // cash customer
          paymentMethod,
          items: cart,
          totalAmount: subtotal,
          taxAmount,
          discountAmount,
          grandTotal,
          paidAmount: paymentMethod === "نقداً" && cashReceived > 0 ? cashReceived : grandTotal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.invoice) {
        setCompletedInvoice({
          ...data.invoice,
          items: cart,
        });
        setReceiptModalOpen(true);
        clearCart();
        loadPosData();
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === null || p.categoryId === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* POS Header Banner with Active Shift Status */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-100">نظام نقطة البيع (POS Cashier)</h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              {activeShift ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  الوردية مفتوحة (#{activeShift.id}) - عهده افتراضية: {activeShift.openingCash} ر.س
                </span>
              ) : (
                <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  ⚠️ لا توجد وردية مفتوحة - يرجى فتح الوردية للبدء
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShiftModalOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeShift ? "إغلاق الوردية (Z-Report)" : "فتح وردية جديدة"}</span>
          </button>
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>مسح باركود بالكاميرا</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Products Catalog vs Cart Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Product Browser (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الباركود، أو SKU (مثال: 629110001001)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                  activeCategory === null
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                جميع التصنيفات
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition ${
                    activeCategory === c.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const inStock = (product.currentStock ?? 0) > 0;
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`bg-slate-900 border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-0.5 hover:shadow-lg ${
                    inStock
                      ? "border-slate-800 hover:border-emerald-500/50"
                      : "border-rose-900/40 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded">{product.sku}</span>
                      <span className={inStock ? "text-emerald-400 font-bold" : "text-rose-400"}>
                        {inStock ? `متوفر: ${product.currentStock}` : "نفذ المخزون"}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-100 line-clamp-2 mb-2 leading-tight">
                      {product.name}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="font-black text-sm text-emerald-400">
                      {Number(product.salePrice).toFixed(2)} <span className="text-[10px]">ر.س</span>
                    </span>
                    <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: POS Order Cart & Checkout Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
                <span>سلة الفاتورة الحالية</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {cart.length} أصناف
                </span>
              </h3>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  تفريع
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="mt-3 space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <ShoppingCart className="w-10 h-10 mx-auto opacity-30" />
                  <p className="text-xs">السلة فارغة. انقر على المنتجات للبدء بإضافة الطلب.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <h5 className="font-bold text-slate-200 line-clamp-1">{item.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        {item.salePrice.toFixed(2)} ر.س × {item.quantity} ={" "}
                        <strong className="text-emerald-400">{(item.quantity * item.salePrice).toFixed(2)} ر.س</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold px-2 text-slate-100">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 text-rose-400 hover:bg-rose-500/10 rounded mr-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Method Selector & Discount Inputs */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            {/* Payment Method Options */}
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">طريقة الدفع:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "نقداً", label: "نقداً (كاش)", icon: Banknote },
                  { id: "شبكة/بطاقة", label: "شبكة / مدى", icon: CreditCard },
                  { id: "STC Pay", label: "STC Pay / إلكتروني", icon: Smartphone },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold border transition ${
                        isSel
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount & Received Cash Input */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">الخصم المباشر (ر.س):</label>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              {paymentMethod === "نقداً" && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">المبلغ المستلم من العميل:</label>
                  <input
                    type="number"
                    min="0"
                    value={cashReceived || ""}
                    onChange={(e) => setCashReceived(Number(e.target.value))}
                    placeholder="أدخل المبلغ..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Calculation Totals Card */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-semibold">
              <div className="flex justify-between text-slate-400">
                <span>المجموع فرعي:</span>
                <span>{subtotal.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>الضريبة (15% VAT):</span>
                <span>{taxAmount.toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-100 border-t border-slate-800 pt-1.5">
                <span>الإجمالي النهائي:</span>
                <span className="text-emerald-400 font-black">{grandTotal.toFixed(2)} ر.س</span>
              </div>
              {paymentMethod === "نقداً" && cashReceived > 0 && (
                <div className="flex justify-between text-xs text-amber-300 pt-1">
                  <span>المتبقي (المتوجّب إرجاعه):</span>
                  <span>{changeDue.toFixed(2)} ر.س</span>
                </div>
              )}
            </div>

            {/* Instant Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>إصدار الفاتورة والدفع الفوري ({grandTotal.toFixed(2)} ر.س)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shift Open / Close Modal */}
      {shiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">
                {activeShift ? "إغلاق الوردية وتقارير Z-Report" : "فتح وردية كاشير جديدة"}
              </h3>
              <button onClick={() => setShiftModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeShift ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <p className="text-slate-300">رقم الوردية الحالية: <strong className="text-emerald-400">#{activeShift.id}</strong></p>
                  <p className="text-slate-300">العهدة الافتتاحية: <strong>{activeShift.openingCash} ر.س</strong></p>
                  <p className="text-slate-300">وقت البدء: {new Date(activeShift.startTime).toLocaleString("ar-SA")}</p>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المبلغ النقدي المتبقي بالصندوق عند الإغلاق:</label>
                  <input
                    type="number"
                    value={closingCashInput}
                    onChange={(e) => setClosingCashInput(e.target.value)}
                    placeholder="أدخل المبلغ النقدي المفعلي..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleCloseShift}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  إغلاق الوردية واستخراج تقرير Z
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">المبلغ النقدي الافتتاحي (عهدة الكاشير):</label>
                  <input
                    type="number"
                    value={openingCashInput}
                    onChange={(e) => setOpeningCashInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleOpenShift}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition"
                >
                  تأكيد وفتح الوردية
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Printable Thermal Receipt Modal */}
      <ThermalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        invoice={completedInvoice}
        companyInfo={companyInfo}
      />
    </div>
  );
}
