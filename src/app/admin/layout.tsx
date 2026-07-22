import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-xl shadow-md">
              ��
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-tight">أكوا كلين</h1>
              <p className="text-[11px] text-sky-400 font-bold">لوحة التحكم الإدارية</p>
            </div>
          </div>

          {/* Links */}
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <span>📊</span>
              <span>الرئيسية (Dashboard)</span>
            </Link>
            <Link href="/admin/produits" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-sky-600 text-white shadow-md transition">
              <span>📦</span>
              <span>إدارة المنتجات</span>
            </Link>
          </nav>
        </div>

        {/* Live Store Button */}
        <div className="pt-6 border-t border-slate-800">
          <a href="https://studio-pearl-eta.vercel.app" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold text-xs rounded-xl transition">
            <span>🌐 عرض المتجر الحي</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
