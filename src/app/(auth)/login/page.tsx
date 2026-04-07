'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('Credenciales inválidas. Verifica tu email y contraseña.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffde7] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0e8c8] p-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Iniciar sesión</h1>
          <p className="text-[#888] text-sm mb-6">Bienvenido de vuelta</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="tu@email.com"
                className="w-full border border-[#e8e0c8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffee58]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Tu contraseña"
                className="w-full border border-[#e8e0c8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffee58]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffee58] hover:bg-[#fdd835] text-[#1a1a1a] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
