import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { GetVisibleNetwork } from '@/modules/referral/application/use-cases/GetVisibleNetwork'
import { NetworkVisibilityService } from '@/modules/referral/domain/services/NetworkVisibilityService'
import { referralAncestorsRepo, userRepo } from '@/lib/db/repositories'
import { UserId } from '@/modules/shared/kernel/UserId'

const getVisibleNetwork = new GetVisibleNetwork(referralAncestorsRepo)
const visibilityService = new NetworkVisibilityService(referralAncestorsRepo)

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const viewer = await userRepo.findById(UserId.create(session.user.id))
  if (!viewer) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  const result = await getVisibleNetwork.execute({
    viewerId: viewer.id.value,
    isRoot: viewer.isRoot,
  })

  if (!result.ok) {
    return NextResponse.json({ error: 'Error al obtener la red' }, { status: 500 })
  }

  return NextResponse.json({
    viewerId: viewer.id.value,
    isRoot: viewer.isRoot,
    nodes: result.value,
  })
}
