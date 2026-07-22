import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "أكوا كلين — لوحة التحكم | AquaClean Admin",
  description: "لوحة إدارة وتعديل منتجات أكوا كلين بالمغرب",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">{children}</body>
    </html>
  );
}
