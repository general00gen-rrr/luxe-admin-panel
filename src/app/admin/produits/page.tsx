'use client'
import { useState, useEffect, useRef } from 'react'

const categories = [
  { id: 'maison', name: 'Maison' },
  { id: 'mode', name: 'Mode' },
  { id: 'beaute', name: 'Beauté' },
  { id: 'tech', name: 'Tech' },
  { id: 'cuisine', name: 'Cuisine' },
  { id: 'sport', name: 'Sport' },
]

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const empty = { id: '', name: '', slug: '', price: '', originalPrice: '', category: 'maison', description: '', image: '', badge: '', stock: '10' }

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState({ ...empty })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'list'|'form'>('list')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadProducts() {
    const res = await fetch('/api/admin/products')
    setProducts(await res.json())
  }

  useEffect(() => { loadProducts() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setForm(f => ({ ...f, image: data.url }))
    setUploading(false)
  }

  function handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: toSlug(name) }))
  }

  function startEdit(p: any) {
    setForm({ ...p, price: String(p.price), originalPrice: String(p.originalPrice || ''), stock: String(p.stock) })
    setPreview(p.image)
    setEditing(true)
    setTab('form')
  }

  function resetForm() {
    setForm({ ...empty })
    setPreview('')
    setEditing(false)
    setTab('list')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, stock: Number(form.stock) }
    if (editing) {
      await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSuccess('✅ Produit modifié !')
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSuccess('✅ Produit ajouté !')
    }
    setSaving(false)
    await loadProducts()
    resetForm()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSuccess('🗑️ Produit supprimé')
    await loadProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Produits</h2>
          <p className="text-gray-400">{products.length} produit(s) dans le catalogue</p>
        </div>
        <button onClick={() => { resetForm(); setTab('form') }} className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 rounded-lg transition">
          + Nouveau produit
        </button>
      </div>

      {success && <div className="bg-green-900 border border-green-600 text-green-300 px-4 py-3 rounded-lg mb-6">{success}</div>}

      {tab === 'list' ? (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-gray-500 text-lg">Aucun produit pour l'instant</p>
              <button onClick={() => setTab('form')} className="mt-4 bg-amber-500 text-black font-bold px-5 py-2 rounded-lg">
                + Ajouter le premier produit
              </button>
            </div>
          )}
          {products.map((p: any) => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              {p.image && <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg bg-gray-800"/>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate">{p.name}</p>
                  {p.badge && <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold">{p.badge}</span>}
                </div>
                <p className="text-gray-400 text-sm">{p.category} · {p.price} DH {p.originalPrice ? <span className="line-through text-gray-600">{p.originalPrice} DH</span> : ''}</p>
                <p className="text-gray-500 text-xs truncate">{p.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="bg-blue-900 hover:bg-blue-800 text-blue-300 px-4 py-2 rounded-lg text-sm transition">✏️ Modifier</button>
                <button onClick={() => handleDelete(p.id, p.name)} className="bg-red-900 hover:bg-red-800 text-red-300 px-4 py-2 rounded-lg text-sm transition">🗑️ Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl">
          <button onClick={resetForm} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition">← Retour à la liste</button>
          <h3 className="text-xl font-bold text-white mb-6">{editing ? '✏️ Modifier le produit' : '+ Nouveau produit'}</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nom du produit *</label>
              <input required value={form.name} onChange={handleName} placeholder="Ex: Lampe Arc Dorée" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"/>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">URL du produit (auto-générée)</label>
              <input readOnly value={form.slug} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-amber-400 font-mono text-sm"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prix (DH) *</label>
                <input required type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="890" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"/>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Prix avant remise (DH)</label>
                <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))} placeholder="1200" className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"/>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Catégorie *</label>
              <select required value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description *</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Description courte du produit..." className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"/>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">📸 Image du produit *</label>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition">
                {preview ? (
                  <div>
                    <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-lg mx-auto mb-3"/>
                    <p className="text-amber-400 text-sm">{uploading ? '⏳ Upload en cours...' : '✅ Image prête — cliquer pour changer'}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-4xl mb-2">📷</p>
                    <p className="text-gray-400">Cliquer pour choisir une image</p>
                    <p className="text-gray-600 text-sm mt-1">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Badge</label>
                <select value={form.badge} onChange={e => setForm(f => ({...f, badge: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500">
                  <option value="">Aucun</option>
                  <option value="nouveau">Nouveau</option>
                  <option value="promo">Promo</option>
                  <option value="bestseller">Bestseller</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500"/>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading} className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-4 rounded-lg transition text-lg">
              {saving ? '⏳ Enregistrement...' : uploading ? '⏳ Upload image...' : editing ? '✅ Enregistrer les modifications' : '🚀 Publier le produit'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
