'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => setCount(Array.isArray(d) ? d.length : 0))
  }, [])

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
      <p className="text-gray-400 mb-8">Bienvenue dans votre panel admin Luxé</p>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Produits</p>
          <p className="text-4xl font-bold text-amber-400 mt-2">{count ?? '...'}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Catégories</p>
          <p className="text-4xl font-bold text-amber-400 mt-2">6</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <p className="text-gray-400 text-sm">Statut</p>
          <p className="text-2xl font-bold text-green-400 mt-2">✅ En ligne</p>
        </div>
      </div>
      <div className="mt-8">
        <Link href="/admin/produits" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-lg inline-block transition">
          + Ajouter un produit
        </Link>
      </div>
    </div>
  )
}
