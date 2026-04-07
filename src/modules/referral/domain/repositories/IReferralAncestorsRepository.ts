import { UserId } from '@/modules/shared/kernel/UserId'

export interface NetworkNode {
  userId: string
  depth: number
  email: string
  referralCode: string
  directChildrenCount?: number // populated for nodes at visual limit
}

export interface LevelCount {
  depth: number
  count: number
}

export interface IReferralAncestorsRepository {
  /**
   * Insert closure table rows for a new node.
   * Copies all ancestor rows from parent + self-reference (depth=0).
   */
  insertClosureForNewNode(userId: UserId, parentId: UserId | null): Promise<void>

  /** Returns true if targetId is a descendant of ancestorId */
  isDescendant(ancestorId: UserId, targetId: UserId): Promise<boolean>

  /** Get all descendants of userId with their relative depth */
  getSubtree(userId: UserId): Promise<NetworkNode[]>

  /** Count descendants grouped by relative depth */
  getStatsByLevel(userId: UserId): Promise<LevelCount[]>
}
