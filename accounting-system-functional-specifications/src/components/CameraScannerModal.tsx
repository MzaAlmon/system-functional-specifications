"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, Camera, RefreshCw, Barcode } from "lucide-react";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function CameraScannerModal({ isOpen, onClose, onScan }: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setErrorMsg(null);
    setIsScanning(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg("كاميرا الجهاز غير مدعومة في هذا المتصفح. يمكنك إدخال الباركود يدوياً.");
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setErrorMsg("لم نتمكن من الوصول لكاميرا الجهاز. يرجى السماح بالوصول أو إدخال الباركود يدوياً.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">مسح الباركود عبر الكاميرا</h3>
              <p className="text-xs text-slate-400">وجّه كاميرا الهاتف أو الجهاز نحو ملصق الباركود</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Feed / Fallback */}
        <div className="relative bg-black flex flex-col items-center justify-center min-h-[260px] p-2">
          {errorMsg ? (
            <div className="p-6 text-center text-amber-300 max-w-xs">
              <Barcode className="w-12 h-12 mx-auto mb-2 text-amber-400 opacity-80" />
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {/* Scanning Target Frame overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-36 border-2 border-emerald-400 rounded-xl relative shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1"></div>
                  <div className="w-full h-0.5 bg-emerald-400/80 absolute top-1/2 left-0 animate-ping"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Barcode Input & Test Barcodes */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="أدخل رمز الباركود أو SKU..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
            >
              بحث
            </button>
          </form>

          {/* Quick Barcode Testing Buttons */}
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium">أكواد تجريبية سريعة للمسح:</p>
            <div className="flex flex-wrap gap-1.5">
              {["629110001001", "629110001002", "629110001003", "629110001005"].map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    onScan(code);
                    onClose();
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs px-2.5 py-1 rounded-lg transition font-mono"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
