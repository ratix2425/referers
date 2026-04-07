import { UserId } from '@/modules/shared/kernel/UserId'

export interface ReferralNodeProps {
  userId: UserId
  parentId: UserId | null
  depth: number
}

export class ReferralNode {
  readonly userId: UserId
  readonly parentId: UserId | null
  readonly depth: number

  private constructor(props: ReferralNodeProps) {
    this.userId = props.userId
    this.parentId = props.parentId
    this.depth = props.depth
  }

  static create(props: ReferralNodeProps): ReferralNode {
    if (props.depth < 0) {
      throw new Error('ReferralNode depth cannot be negative')
    }
    if (props.parentId === null && props.depth !== 0) {
      throw new Error('Root node must have depth 0')
    }
    if (props.parentId !== null && props.depth === 0) {
      throw new Error('Non-root node must have depth > 0')
    }
    return new ReferralNode(props)
  }

  isRoot(): boolean {
    return this.parentId === null
  }

  /** Depth at which this node appears visually (capped reference, not enforced here) */
  isAtVisualLimit(maxDepth = 15): boolean {
    return this.depth >= maxDepth
  }
}
