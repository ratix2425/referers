import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/lib/auth/auth'
import { GenericAvatar } from '@/components/ui/GenericAvatar'

async function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/login' })
      }}
    >
      <button
        type="submit"
        className="text-sm text-[#888] hover:text-[#555] transition-colors"
      >
        Cerrar sesión
      </button>
    </form>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#fffde7]">
      <header className="bg-white border-b border-[#f0e8c8] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#ffee58] rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-[#1a1a1a]">R</span>
          </div>
          <span className="font-semibold text-[#1a1a1a]">Referidos</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <GenericAvatar size={28} />
            <span className="text-sm text-[#555]">{session.user.email}</span>
          </div>
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
