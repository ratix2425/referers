'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''

  const [form, setForm] = useState({ email: '', password: '', referralCode: refCode })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.referralCode) {
      setError('El código de referido es obligatorio')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Error al registrarse')
        return
      }

      // Auto-login after registration
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.ok) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffde7] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0e8c8] p-8">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Crear cuenta</h1>
          <p className="text-[#888] text-sm mb-6">Necesitas un código de referido para registrarte</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">
                Código de referido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.referralCode}
                onChange={e => setForm(f => ({ ...f, referralCode: e.target.value }))}
                placeholder="Ej: ABC123xyz"
                className="w-full border border-[#e8e0c8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffee58] bg-[#fffde7]"
                required
              />
            </div>
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
                placeholder="Mínimo 8 caracteres"
                className="w-full border border-[#e8e0c8] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffee58]"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffee58] hover:bg-[#fdd835] text-[#1a1a1a] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-sm text-[#888] mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-[#f57f17] hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
