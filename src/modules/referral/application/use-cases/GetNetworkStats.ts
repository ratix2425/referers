import { Result } from '@/modules/shared/kernel/Result'
import { UserId } from '@/modules/shared/kernel/UserId'
import { IReferralAncestorsRepository, LevelCount } from '../../domain/repositories/IReferralAncestorsRepository'

export interface GetNetworkStatsInput {
  userId: string
}

export interface NetworkStats {
  byLevel: LevelCount[]
  total: number
}

export class GetNetworkStats {
  constructor(private readonly ancestorsRepo: IReferralAncestorsRepository) {}

  async execute(input: GetNetworkStatsInput): Promise<Result<NetworkStats>> {
    const userId = UserId.create(input.userId)
    const byLevel = await this.ancestorsRepo.getStatsByLevel(userId)
    const total = byLevel.reduce((sum, l) => sum + l.count, 0)
    return Result.ok({ byLevel, total })
  }
}
