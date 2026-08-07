"use client";

import React, { useState, useEffect, useRef } from "react";
import { Barcode, Camera, Printer, RefreshCw, QrCode, Sliders, Check } from "lucide-react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

interface BarcodeViewProps {
  onOpenScanner: () => void;
}

export function BarcodeView({ onOpenScanner }: BarcodeViewProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [barcodeType, setBarcodeType] = useState<"code128" | "qr">("code128");
  const [labelCount, setLabelCount] = useState<number>(12);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [companyNameText, setCompanyNameText] = useState("شركة الأفق التجارية");

  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        setSelectedProduct(data[0]);
      }
    } catch (err) {
      console.error("Error loading products for barcode:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const codeValue = selectedProduct.barcode || selectedProduct.sku || "629110001001";

    if (barcodeType === "code128" && barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, codeValue, {
          format: "CODE128",
          width: 1.8,
          height: 50,
          displayValue: true,
          font: "monospace",
          fontSize: 12,
          margin: 4,
        });
      } catch (e) {
        console.error("JsBarcode error:", e);
      }
    } else if (barcodeType === "qr" && qrCanvasRef.current) {
      QRCode.toCanvas(qrCanvasRef.current, codeValue, {
        width: 100,
        margin: 1,
      });
    }
  }, [selectedProduct, barcodeType]);

  const handlePrintLabels = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-400" />
            <span>وحدة الباركود وطباعة ملصقات المنتجات</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            توليد الباركود (Code128 / QR Code) وإعداد ورقة طباعة ملصقات الأسعار للطابعات الحرارية.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition"
        >
          <Camera className="w-4 h-4 animate-bounce" />
          <span>تشغيل كاميرا مسح الباركود</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Controls & Customization Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>تخصيص ملصق الباركود</span>
          </h3>

          <div className="space-y-3 text-xs">
            {/* Product Selector */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اختر المنتج المراد طباعته:</label>
              <select
                value={selectedProduct?.id || ""}
                onChange={(e) => {
                  const p = products.find((prod) => prod.id === Number(e.target.value));
                  if (p) setSelectedProduct(p);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku} - {p.barcode})
                  </option>
                ))}
              </select>
            </div>

            {/* Barcode Type */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">نوع رمز الباركود:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBarcodeType("code128")}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                    barcodeType === "code128"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <Barcode className="w-4 h-4" />
                  <span>خطّي Code128</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBarcodeType("qr")}
                  className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                    barcodeType === "qr"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>رمز QR Code</span>
                </button>
              </div>
            </div>

            {/* Label Options */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">عدد الملصقات:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={labelCount}
                  onChange={(e) => setLabelCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">إظهار السعر:</label>
                <button
                  type="button"
                  onClick={() => setShowPrice(!showPrice)}
                  className={`w-full p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition ${
                    showPrice
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{showPrice ? "عرض السعر" : "إخفاء السعر"}</span>
                </button>
              </div>
            </div>

            {/* Header Text */}
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">اسم المنشأة على الملصق:</label>
              <input
                type="text"
                value={companyNameText}
                onChange={(e) => setCompanyNameText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-medium"
              />
            </div>

            {/* Print Action Button */}
            <button
              onClick={handlePrintLabels}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ملصقات الباركود ({labelCount} ملصق)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Printable Label Preview Sheet (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
          <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>معاينة ورقة ملصقات الباركود للطباعة</span>
            <span className="text-xs text-slate-400 font-mono">طابعة حرارية A4 / 50x25mm</span>
          </h3>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-[500px] overflow-y-auto" id="printable-barcode-sheet">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedProduct &&
                Array.from({ length: labelCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white text-slate-900 p-2.5 rounded border border-slate-300 flex flex-col items-center justify-between text-center font-sans shadow-sm hover:border-emerald-500 transition"
                    style={{ minHeight: "130px" }}
                  >
                    <span className="text-[9px] font-bold text-slate-800 truncate w-full">{companyNameText}</span>
                    <p className="text-[10px] font-bold text-slate-900 line-clamp-1 my-0.5">{selectedProduct.name}</p>

                    {/* Barcode graphic */}
                    {barcodeType === "code128" ? (
                      <svg ref={idx === 0 ? barcodeSvgRef : null} className="w-full h-12 my-1" />
                    ) : (
                      <canvas ref={idx === 0 ? qrCanvasRef : null} className="w-16 h-16 my-1" />
                    )}

                    {showPrice && (
                      <div className="text-[11px] font-black text-slate-900 mt-0.5 border-t border-slate-300 w-full pt-0.5">
                        السعر: {Number(selectedProduct.salePrice).toFixed(2)} ر.س
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
