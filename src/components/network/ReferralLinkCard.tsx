'use client'

import { useState } from 'react'

interface ReferralLinkCardProps {
  referralCode: string
}

export function ReferralLinkCard({ referralCode }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const referralLink = `${baseUrl}/register?ref=${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea')
      el.value = referralLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#f0e8c8] p-6">
      <h2 className="text-sm font-semibold text-[#555] uppercase tracking-wide mb-3">
        Tu link de referido
      </h2>
      <div className="flex items-center gap-2 mb-2">
        <code className="flex-1 bg-[#fffde7] border border-[#e8e0c8] rounded-lg px-3 py-2 text-sm text-[#555] font-mono truncate">
          {referralLink}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 bg-[#ffee58] hover:bg-[#fdd835] text-[#1a1a1a] text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </div>
      <p className="text-xs text-[#888]">
        Código: <span className="font-mono font-semibold text-[#555]">{referralCode}</span>
      </p>
    </div>
  )
}
