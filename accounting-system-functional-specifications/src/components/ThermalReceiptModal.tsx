"use client";

import React, { useEffect, useRef } from "react";
import { X, Printer, CheckCircle, Share2 } from "lucide-react";
import QRCode from "qrcode";

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  companyInfo: any;
}

export function ThermalReceiptModal({ isOpen, onClose, invoice, companyInfo }: ThermalReceiptModalProps) {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && invoice && qrCanvasRef.current) {
      const qrData = `ZATCA-VAT:${companyInfo?.vatNumber || "310987654300003"}|INV:${invoice.invoiceNumber}|TOTAL:${invoice.grandTotal}|VAT:${invoice.taxAmount}|DATE:${new Date(invoice.createdAt || Date.now()).toISOString()}`;
      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 120,
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  }, [isOpen, invoice, companyInfo]);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-100">إيصال الفاتورة الحرارية</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content Printable Area */}
        <div className="p-6 overflow-y-auto bg-slate-100 text-slate-900 font-mono text-xs shadow-inner" id="printable-receipt">
          <div className="max-w-[280px] mx-auto bg-white p-4 rounded border border-slate-300 shadow-sm text-center">
            {/* Header */}
            <h2 className="font-bold text-base text-slate-900 mb-1">{companyInfo?.companyNameAr || "شركة الأفق المحاسبية"}</h2>
            <p className="text-[10px] text-slate-600 mb-1">{companyInfo?.address || "الرياض - المملكة العربية السعودية"}</p>
            <p className="text-[10px] text-slate-600 mb-2">الرقم الضريبي: {companyInfo?.vatNumber || "310987654300003"}</p>
            <div className="border-b-2 border-dashed border-slate-400 my-2"></div>

            {/* Title */}
            <p className="font-bold text-sm text-slate-800 my-1">فاتورة ضريبية مبسطة</p>
            <p className="text-[11px] text-slate-600">رقم الفاتورة: {invoice.invoiceNumber}</p>
            <p className="text-[10px] text-slate-500 mb-2">التاريخ: {new Date(invoice.createdAt || Date.now()).toLocaleString("ar-SA")}</p>
            <div className="border-b border-slate-300 my-2"></div>

            {/* Line Items Table */}
            <table className="w-full text-right my-2 text-[11px]">
              <thead>
                <tr className="border-b border-slate-400 text-slate-700">
                  <th className="py-1">الصنف</th>
                  <th className="py-1 text-center">الكمية</th>
                  <th className="py-1 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-1 font-semibold">{item.productName || item.name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-left">{Number(item.lineTotal || (item.quantity * item.salePrice)).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-2 text-center text-slate-500">تم تسجيل المبيعات بنجاح</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="border-b-2 border-dashed border-slate-400 my-2"></div>

            {/* Totals Breakdown */}
            <div className="space-y-1 text-right text-[11px] font-semibold">
              <div className="flex justify-between">
                <span>المجموع بدون الضريبة:</span>
                <span>{(Number(invoice.grandTotal) - Number(invoice.taxAmount)).toFixed(2)} ر.س</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ضريبة القيمة المضافة (15%):</span>
                <span>{Number(invoice.taxAmount).toFixed(2)} ر.س</span>
              </div>
              {Number(invoice.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>الخصم المباشر:</span>
                  <span>-{Number(invoice.discountAmount).toFixed(2)} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-1 text-slate-900">
                <span>الإجمالي النهائي:</span>
                <span>{Number(invoice.grandTotal).toFixed(2)} {companyInfo?.currencySymbol || "ر.س"}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                <span>طريقة الدفع:</span>
                <span>{invoice.paymentMethod || "نقداً"}</span>
              </div>
            </div>

            <div className="border-b-2 border-dashed border-slate-400 my-3"></div>

            {/* ZATCA QR Code */}
            <div className="flex flex-col items-center justify-center my-2">
              <canvas ref={qrCanvasRef} className="rounded border border-slate-200" />
              <span className="text-[9px] text-slate-500 mt-1">رمز التحقق الإلكتروني (ZATCA QR)</span>
            </div>

            <p className="text-[10px] text-slate-600 mt-2 italic">{companyInfo?.receiptFooter || "شكراً لزيارتكم! نأمل برؤيتكم قريباً."}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            طباعة الإيصال
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
