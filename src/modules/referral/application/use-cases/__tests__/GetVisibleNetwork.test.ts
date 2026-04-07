import { describe, it, expect, vi } from 'vitest'
import { GetVisibleNetwork } from '../GetVisibleNetwork'
import { IReferralAncestorsRepository } from '../../../domain/repositories/IReferralAncestorsRepository'

function makeRepo(nodes: ReturnType<IReferralAncestorsRepository['getSubtree']> extends Promise<infer T> ? T : never) {
  const repo: IReferralAncestorsRepository = {
    getSubtree: vi.fn().mockResolvedValue(nodes),
    isDescendant: vi.fn(),
    insertClosureForNewNode: vi.fn(),
    getStatsByLevel: vi.fn(),
  }
  return repo
}

describe('GetVisibleNetwork', () => {
  const viewerId = '11111111-0000-0000-0000-000000000000'

  it('returns empty array when user has no referrals', async () => {
    const repo = makeRepo([])
    const useCase = new GetVisibleNetwork(repo)
    const result = await useCase.execute({ viewerId, isRoot: false })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toHaveLength(0)
  })

  it('returns mapped nodes for normal user', async () => {
    const repo = makeRepo([
      { userId: '22222222-0000-0000-0000-000000000000', depth: 1, email: 'a@e.com', referralCode: 'CODE1', directChildrenCount: 2 },
      { userId: '33333333-0000-0000-0000-000000000000', depth: 2, email: 'b@e.com', referralCode: 'CODE2', directChildrenCount: 0 },
    ])
    const useCase = new GetVisibleNetwork(repo)
    const result = await useCase.execute({ viewerId, isRoot: false })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toHaveLength(2)
      expect(result.value[0].depth).toBe(1)
      expect(result.value[1].depth).toBe(2)
    }
  })
})
