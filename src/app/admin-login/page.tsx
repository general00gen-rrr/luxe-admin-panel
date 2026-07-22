'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('كلمة المرور غير صحيحة')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-slate-950 px-4 font-sans" dir="rtl">
      <div className="bg-slate-900 p-8 rounded-3xl w-full max-w-sm border border-slate-800 shadow-2xl text-center">
        <div className="w-14 h-14 bg-sky-500/10 border border-sky-400/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 text-cyan-400">
          💧
        </div>
        <h1 className="text-white font-extrabold text-2xl mb-1">أكوا كلين</h1>
        <p className="text-slate-400 text-xs mb-6">تسجيل الدخول للوحة التحكم</p>

        <input
          type='password'
          placeholder='كلمة المرور'
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 mb-4 focus:outline-none focus:border-sky-500 text-sm font-bold transition"
        />

        {error && <p className="text-red-400 mb-4 text-xs font-bold bg-red-950/40 border border-red-900/50 py-2 rounded-lg">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition text-sm"
        >
          {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
        </button>
      </div>
    </div>
  )
}
