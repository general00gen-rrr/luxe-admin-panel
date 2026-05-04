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
      setError('Mot de passe incorrect')
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
      <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', width: '360px', border: '1px solid #2a2a2a' }}>
        <h1 style={{ color: '#d4af37', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.2rem' }}>LUXE Admin</h1>
        <input
          type='password'
          placeholder='Mot de passe'
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #333', background: '#111', color: 'white', marginBottom: '1rem', boxSizing: 'border-box' }}
        />
        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: loading ? '#888' : '#d4af37', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Connexion...' : 'Connexion'}
        </button>
      </div>
    </div>
  )
}