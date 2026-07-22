'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(d => setCount(Array.isArray(d) ? d.length : 0))
      .catch(() => setCount(0))
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-extrabold text-white mb-2">الرئيسية (Dashboard)</h2>
      <p className="text-slate-400 mb-8 text-sm">أهلاً بك في لوحة تحكم وإدارة منتجات أكوا كلين (AquaClean)</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold">إجمالي المنتجات</p>
          <p className="text-4xl font-extrabold text-sky-400 mt-2">{count ?? '...'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold">الأقسام المتاحة</p>
          <p className="text-4xl font-extrabold text-cyan-400 mt-2">4</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold">حالة الموقع</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-3">✅ متصل بالمتجر الحي</p>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/admin/produits" className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-6 py-3.5 rounded-xl inline-flex items-center gap-2 shadow-lg transition text-sm">
          <span>+</span>
          <span>إضافة منتج جديد</span>
        </Link>
      </div>
    </div>
  )
}
