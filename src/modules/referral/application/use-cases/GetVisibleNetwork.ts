import { Result } from '@/modules/shared/kernel/Result'
import { UserId } from '@/modules/shared/kernel/UserId'
import { IReferralAncestorsRepository, NetworkNode } from '../../domain/repositories/IReferralAncestorsRepository'

export interface GetVisibleNetworkInput {
  viewerId: string
  isRoot: boolean
}

export interface NetworkTreeNode {
  userId: string
  parentId: string | null
  email: string
  referralCode: string
  depth: number
  directChildrenCount: number
}

export class GetVisibleNetwork {
  constructor(private readonly ancestorsRepo: IReferralAncestorsRepository) {}

  async execute(
    input: GetVisibleNetworkInput
  ): Promise<Result<NetworkTreeNode[]>> {
    const viewerId = UserId.create(input.viewerId)
    const nodes: NetworkNode[] = await this.ancestorsRepo.getSubtree(viewerId)

    return Result.ok(
      nodes.map(n => ({
        userId: n.userId,
        parentId: n.parentId,
        email: n.email,
        referralCode: n.referralCode,
        depth: n.depth,
        directChildrenCount: n.directChildrenCount ?? 0,
      }))
    )
  }
}
