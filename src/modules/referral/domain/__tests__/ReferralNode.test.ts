import { describe, it, expect } from 'vitest'
import { ReferralNode } from '../entities/ReferralNode'
import { UserId } from '@/modules/shared/kernel/UserId'

const uid = (n: number) => UserId.create(`${n.toString().padStart(8, '0')}-0000-0000-0000-000000000000`)

describe('ReferralNode', () => {
  it('creates a root node (depth=0, no parent)', () => {
    const node = ReferralNode.create({ userId: uid(1), parentId: null, depth: 0 })
    expect(node.isRoot()).toBe(true)
    expect(node.depth).toBe(0)
  })

  it('creates a non-root node with depth > 0', () => {
    const node = ReferralNode.create({ userId: uid(2), parentId: uid(1), depth: 3 })
    expect(node.isRoot()).toBe(false)
    expect(node.depth).toBe(3)
  })

  it('throws for negative depth', () => {
    expect(() => ReferralNode.create({ userId: uid(1), parentId: null, depth: -1 }))
      .toThrow('depth cannot be negative')
  })

  it('throws when root has non-zero depth', () => {
    expect(() => ReferralNode.create({ userId: uid(1), parentId: null, depth: 5 }))
      .toThrow('Root node must have depth 0')
  })

  it('throws when non-root has depth 0', () => {
    expect(() => ReferralNode.create({ userId: uid(2), parentId: uid(1), depth: 0 }))
      .toThrow('Non-root node must have depth > 0')
  })

  it('isAtVisualLimit is true at depth 15', () => {
    const node = ReferralNode.create({ userId: uid(2), parentId: uid(1), depth: 15 })
    expect(node.isAtVisualLimit()).toBe(true)
  })

  it('isAtVisualLimit is false below depth 15', () => {
    const node = ReferralNode.create({ userId: uid(2), parentId: uid(1), depth: 7 })
    expect(node.isAtVisualLimit()).toBe(false)
  })
})
