import { UserId } from '@/modules/shared/kernel/UserId'
import { IReferralAncestorsRepository } from '../repositories/IReferralAncestorsRepository'

export class NetworkVisibilityService {
  constructor(private readonly ancestorsRepo: IReferralAncestorsRepository) {}

  /**
   * Returns true if viewer can see the target node.
   * Root users can see everything. Normal users only see their descendants.
   */
  async canSee(
    viewer: { id: UserId; isRoot: boolean },
    targetId: UserId
  ): Promise<boolean> {
    if (viewer.isRoot) return true
    if (viewer.id.equals(targetId)) return true
    return this.ancestorsRepo.isDescendant(viewer.id, targetId)
  }
}
