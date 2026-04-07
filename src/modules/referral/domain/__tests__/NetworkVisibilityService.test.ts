import { describe, it, expect, vi } from 'vitest'
import { NetworkVisibilityService } from '../services/NetworkVisibilityService'
import { UserId } from '@/modules/shared/kernel/UserId'
import { IReferralAncestorsRepository } from '../repositories/IReferralAncestorsRepository'

const uid = (n: number) => UserId.create(`${n.toString().padStart(8, '0')}-0000-0000-0000-000000000000`)

function makeRepo(isDescendantResult: boolean): IReferralAncestorsRepository {
  return {
    isDescendant: vi.fn().mockResolvedValue(isDescendantResult),
    insertClosureForNewNode: vi.fn(),
    getSubtree: vi.fn(),
    getStatsByLevel: vi.fn(),
  }
}

describe('NetworkVisibilityService', () => {
  it('root user can see any node', async () => {
    const repo = makeRepo(false)
    const service = new NetworkVisibilityService(repo)
    const result = await service.canSee({ id: uid(1), isRoot: true }, uid(99))
    expect(result).toBe(true)
    expect(repo.isDescendant).not.toHaveBeenCalled()
  })

  it('user can always see themselves', async () => {
    const repo = makeRepo(false)
    const service = new NetworkVisibilityService(repo)
    const result = await service.canSee({ id: uid(1), isRoot: false }, uid(1))
    expect(result).toBe(true)
  })

  it('normal user can see their descendant', async () => {
    const repo = makeRepo(true)
    const service = new NetworkVisibilityService(repo)
    const result = await service.canSee({ id: uid(1), isRoot: false }, uid(2))
    expect(result).toBe(true)
    expect(repo.isDescendant).toHaveBeenCalledWith(uid(1), uid(2))
  })

  it('normal user cannot see a non-descendant', async () => {
    const repo = makeRepo(false)
    const service = new NetworkVisibilityService(repo)
    const result = await service.canSee({ id: uid(1), isRoot: false }, uid(99))
    expect(result).toBe(false)
  })
})
