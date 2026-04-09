import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { userRepo, referralAncestorsRepo } from '@/lib/db/repositories'
import { UserId } from '@/modules/shared/kernel/UserId'
import { GetVisibleNetwork } from '@/modules/referral/application/use-cases/GetVisibleNetwork'
import { GetNetworkStats } from '@/modules/referral/application/use-cases/GetNetworkStats'
import { ReferralLinkCard } from '@/components/network/ReferralLinkCard'
import { NetworkStatsPanel } from '@/components/network/NetworkStatsPanel'
import { ReferralTreeView } from '@/components/network/ReferralTreeView'

const getNetwork = new GetVisibleNetwork(referralAncestorsRepo)
const getStats = new GetNetworkStats(referralAncestorsRepo)

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const viewer = await userRepo.findById(UserId.create(session.user.id))
  if (!viewer) redirect('/login')

  const [networkResult, statsResult] = await Promise.all([
    getNetwork.execute({ viewerId: viewer.id.value, isRoot: viewer.isRoot }),
    getStats.execute({ userId: viewer.id.value }),
  ])

  const nodes = networkResult.ok ? networkResult.value : []
  const stats = statsResult.ok ? statsResult.value : { byLevel: [], total: 0 }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#1a1a1a]">
        {viewer.isRoot ? 'Vista completa del árbol' : 'Mi red de referidos'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-4">
          <ReferralLinkCard referralCode={viewer.referralCode.value} />
          <NetworkStatsPanel byLevel={stats.byLevel} total={stats.total} />
        </div>

        {/* Tree visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#f0e8c8] p-4 min-h-[500px]">
          <h2 className="text-sm font-semibold text-[#555] uppercase tracking-wide mb-4">
            Árbol de referidos
          </h2>
          <ReferralTreeView
            viewerEmail={viewer.email.value}
            viewerId={viewer.id.value}
            nodes={nodes}
          />
        </div>
      </div>
    </div>
  )
}
