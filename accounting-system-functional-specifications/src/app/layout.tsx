import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نظام الأفق - إدارة الحسابات والمالية المتعدد الفروع ZATCA ERP",
  description: "نظام محاسبي ومالي متكامل ومتعدد الفروع يدعم نقطة البيع السريعة، المخزون، الباركود، الكاميرا المباشرة، المشتريات، المبيعات، الرواتب، والمصاريف.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
