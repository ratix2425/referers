import { describe, it, expect, vi } from 'vitest'
import { GetNetworkStats } from '../GetNetworkStats'
import { IReferralAncestorsRepository } from '../../../domain/repositories/IReferralAncestorsRepository'

describe('GetNetworkStats', () => {
  const userId = '11111111-0000-0000-0000-000000000000'

  it('returns stats with total', async () => {
    const repo: IReferralAncestorsRepository = {
      getStatsByLevel: vi.fn().mockResolvedValue([
        { depth: 1, count: 3 },
        { depth: 2, count: 12 },
        { depth: 3, count: 7 },
      ]),
      isDescendant: vi.fn(),
      insertClosureForNewNode: vi.fn(),
      getSubtree: vi.fn(),
    }
    const useCase = new GetNetworkStats(repo)
    const result = await useCase.execute({ userId })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.byLevel).toHaveLength(3)
      expect(result.value.total).toBe(22)
    }
  })

  it('returns zero total when user has no referrals', async () => {
    const repo: IReferralAncestorsRepository = {
      getStatsByLevel: vi.fn().mockResolvedValue([]),
      isDescendant: vi.fn(),
      insertClosureForNewNode: vi.fn(),
      getSubtree: vi.fn(),
    }
    const useCase = new GetNetworkStats(repo)
    const result = await useCase.execute({ userId })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.total).toBe(0)
      expect(result.value.byLevel).toHaveLength(0)
    }
  })
})
