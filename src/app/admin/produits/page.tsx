'use client'
import { useState, useEffect, useRef } from 'react'

const categories = [
  { id: 'maison', name: 'أنظمة الأسموز العكسي' },
  { id: 'mode', name: 'فلاتر ومصفيات المياه' },
  { id: 'beaute', name: 'شمعات وقطع الغيار' },
  { id: 'tech', name: 'مضخات وإكسسوارات' },
]

function toSlug(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const empty = { id: '', name: '', slug: '', price: '', originalPrice: '', category: 'maison', description: '', image: '', images: [] as string[], badge: '', stock: '10' }

export default function ProduitsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState({ ...empty })
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [tab, setTab] = useState<'list'|'form'>('list')
  const fileRef = useRef<HTMLInputElement>(null)

  async function loadProducts() {
    try {
      const res = await fetch('/api/admin/products')
      const data = await res.json()
      if (Array.isArray(data)) setProducts(data)
    } catch {}
  }

  useEffect(() => { loadProducts() }, [])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const newPreviews: string[] = []
    const newUrls: string[] = []
    for (const file of files) {
      newPreviews.push(URL.createObjectURL(file))
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', 'ml_default')
      const res = await fetch('https://api.cloudinary.com/v1_1/deuudcsc5/image/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.secure_url) newUrls.push(data.secure_url)
      else alert("خطأ في رفع الصورة: " + JSON.stringify(data.error))
    }
    setPreviews(p => [...p, ...newPreviews])
    setForm(f => {
      const allImages = [...(f.images || []), ...newUrls]
      return { ...f, images: allImages, image: allImages[0] || f.image }
    })
    setUploading(false)
  }

  function removeImage(idx: number) {
    setPreviews(p => p.filter((_, i) => i !== idx))
    setForm(f => {
      const imgs = f.images.filter((_, i) => i !== idx)
      return { ...f, images: imgs, image: imgs[0] || '' }
    })
  }

  function handleName(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: toSlug(name) }))
  }

  function startEdit(p: any) {
    const imgs = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []
    setForm({ ...p, price: String(p.price), originalPrice: String(p.originalPrice || ''), stock: String(p.stock), images: imgs, image: imgs[0] || '' })
    setPreviews(imgs)
    setEditing(true)
    setTab('form')
  }

  function resetForm() {
    setForm({ ...empty })
    setPreviews([])
    setEditing(false)
    setTab('list')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price), originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, stock: Number(form.stock), images: form.images, image: form.images[0] || form.image }
    if (editing) {
      await fetch('/api/admin/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSuccess('تم تعديل المنتج بنجاح')
    } else {
      await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      setSuccess('تم إضافة المنتج بنجاح')
    }
    setSaving(false)
    await loadProducts()
    resetForm()
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm('هل أنت تأكد من حذف المنتج: (' + name + ') ؟')) return
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setSuccess('تم حذف المنتج بنجاح')
    await loadProducts()
    setTimeout(() => setSuccess(''), 3000)
  }

  const getCatName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || catId
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white">إدارة المنتجات</h2>
          <p className="text-slate-400 text-sm mt-1">يوجد {products.length} منتج في الكتالوج الحالي</p>
        </div>
        <button onClick={() => { resetForm(); setTab('form') }} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition text-sm">
          + إضافة منتج جديد
        </button>
      </div>

      {success && <div className="bg-emerald-950 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-xl mb-6 font-bold text-sm">✓ {success}</div>}

      {tab === 'list' ? (
        <div className="space-y-3">
          {products.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-slate-400 text-base">لا يوجد أي منتج حالياً في القائمة</p>
              <button onClick={() => setTab('form')} className="mt-4 bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs">
                + إضافة المنتج الأول
              </button>
            </div>
          )}
          {products.map((p: any) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-slate-700 transition">
              {(p.images?.[0] || p.image) && <img src={p.images?.[0] || p.image} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-slate-800 border border-slate-700 shrink-0"/>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white truncate text-base">{p.name}</p>
                  {p.badge && <span className="text-[10px] bg-sky-600 text-white px-2 py-0.5 rounded-full font-bold">{p.badge === 'bestseller' ? 'الأكثر مبيعاً' : p.badge === 'nouveau' ? 'جديد' : p.badge}</span>}
                </div>
                <p className="text-slate-400 text-xs mt-1 font-medium">{getCatName(p.category)} — <span className="text-sky-400 font-bold">{p.price} د.م</span></p>
                <p className="text-slate-500 text-[10px] mt-0.5">{(p.images?.length || 1)} صورة محملة</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="bg-slate-800 hover:bg-sky-600 hover:text-white text-sky-400 font-bold px-4 py-2 rounded-xl text-xs transition">تعديل</button>
                <button onClick={() => handleDelete(p.id, p.name)} className="bg-red-950/60 hover:bg-red-900 text-red-300 font-bold px-4 py-2 rounded-xl text-xs transition">حذف</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <button onClick={resetForm} className="text-sky-400 hover:text-sky-300 mb-6 flex items-center gap-2 text-xs font-bold transition">← العودة لقائمة المنتجات</button>
          <h3 className="text-xl font-extrabold text-white mb-6">{editing ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم المنتج</label>
              <input required value={form.name} onChange={handleName} placeholder="مثال: نظام الأسموز العكسي RO سباعي المراحل" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">رابط المنتج (Slug)</label>
              <input readOnly value={form.slug} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sky-400 font-mono text-xs" dir="ltr"/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر (د.م)</label>
                <input required type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="1850" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">السعر قبل الخصم (د.م)</label>
                <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))} placeholder="2200" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500"/>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">القسم / التصنيف</label>
              <select required value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 cursor-pointer">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">الوصف المختصر</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="اكتب وصفاً مختصراً للمنتج ولماذا يحتاجه الزبون..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 resize-none"/>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">صور المنتج <span className="text-slate-500">(يمكن اختيار أكثر من صورة)</span></label>
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img src={src} className="w-20 h-20 object-cover rounded-xl border border-slate-700"/>
                      {i === 0 && <span className="absolute top-1 right-1 bg-sky-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">الرئيسية</span>}
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -left-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow">×</button>
                    </div>
                  ))}
                </div>
              )}
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-700 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-800/50">
                {uploading ? (
                  <p className="text-sky-400 font-bold text-xs">جاري رفع الصور إلى السيرفر...</p>
                ) : (
                  <div>
                    <p className="text-2xl mb-1 text-sky-400">+</p>
                    <p className="text-slate-300 font-bold text-xs">{previews.length > 0 ? "إضافة صور أخرى" : 'اضغط هنا لرفع صور المنتج'}</p>
                    <p className="text-slate-500 text-[11px] mt-1">JPG, PNG, WEBP — يمكنك تحديد عدة صور معاً</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden"/>
              {form.images.length === 0 && (
                <p className="text-red-400 text-xs mt-2 font-bold">* يرجى رفع صورة واحدة على الأقل للمنتج</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الشارة / الشفرة (Badge)</label>
                <select value={form.badge} onChange={e => setForm(f => ({...f, badge: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500 cursor-pointer">
                  <option value="">بدون شارة</option>
                  <option value="nouveau">جديد (Nouveau)</option>
                  <option value="promo">تخفيض (Promo)</option>
                  <option value="bestseller">الأكثر مبيعاً (Bestseller)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">الكمية بالمخزون</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-sky-500"/>
              </div>
            </div>

            <button type="submit" disabled={saving || uploading || form.images.length === 0} className="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl transition text-base shadow-lg mt-4">
              {saving ? 'جاري الحفظ والرفع لـ GitHub...' : uploading ? 'جاري رفع الصور...' : editing ? 'حفظ التعديلات' : 'نشر المنتج في المتجر'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
