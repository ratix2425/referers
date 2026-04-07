import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { GetNetworkStats } from '@/modules/referral/application/use-cases/GetNetworkStats'
import { referralAncestorsRepo } from '@/lib/db/repositories'

const getNetworkStats = new GetNetworkStats(referralAncestorsRepo)

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const result = await getNetworkStats.execute({ userId: session.user.id })

  if (!result.ok) {
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }

  return NextResponse.json(result.value)
}
