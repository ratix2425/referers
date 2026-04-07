import { ReferralNode } from '../entities/ReferralNode'
import { UserId } from '@/modules/shared/kernel/UserId'

export interface IReferralTreeRepository {
  /** Insert adjacency (user_id, parent_id) */
  insertNode(node: ReferralNode): Promise<void>
  findByUserId(userId: UserId): Promise<ReferralNode | null>
  countDirectChildren(userId: UserId): Promise<number>
}
