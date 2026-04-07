/**
 * Integration test — requires a running PostgreSQL database.
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { Pool } from 'pg'
import { PostgresReferralTreeRepository, PostgresReferralAncestorsRepository } from '../PostgresReferralRepository'
import { PostgresUserRepository } from '../../../../identity/infrastructure/repositories/PostgresUserRepository'
import { ReferralNode } from '../../../domain/entities/ReferralNode'
import { User } from '../../../../identity/domain/entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../../../../identity/domain/value-objects/Email'
import { PasswordHash } from '../../../../identity/domain/value-objects/PasswordHash'
import { ReferralCode } from '../../../../identity/domain/value-objects/ReferralCode'

const randomUUID = () => crypto.randomUUID()

const DATABASE_URL = process.env.DATABASE_URL

describe.skipIf(!DATABASE_URL)('PostgresReferralRepository (integration)', () => {
  let pool: Pool
  let treeRepo: PostgresReferralTreeRepository
  let ancestorsRepo: PostgresReferralAncestorsRepository
  let userRepo: PostgresUserRepository
  const testUserIds: string[] = []

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL })
    treeRepo = new PostgresReferralTreeRepository(pool)
    ancestorsRepo = new PostgresReferralAncestorsRepository(pool)
    userRepo = new PostgresUserRepository(pool)
  })

  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    if (testUserIds.length > 0) {
      await pool.query('DELETE FROM users WHERE id = ANY($1)', [testUserIds])
      testUserIds.length = 0
    }
  })

  async function createUser(): Promise<User> {
    const id = randomUUID()
    testUserIds.push(id)
    const hash = await PasswordHash.fromPlainText('Password123')
    const user = User.create({
      id: UserId.create(id),
      email: Email.create(`${id}@test-ref-int.com`),
      passwordHash: hash,
      referralCode: ReferralCode.generate(),
      avatarUrl: null,
      isRoot: false,
      createdAt: new Date(),
    })
    await userRepo.save(user)
    return user
  }

  it('inserts closure rows for root node (only self-reference)', async () => {
    const root = await createUser()
    const node = ReferralNode.create({ userId: root.id, parentId: null, depth: 0 })
    await treeRepo.insertNode(node)
    await ancestorsRepo.insertClosureForNewNode(root.id, null)

    const subtree = await ancestorsRepo.getSubtree(root.id)
    expect(subtree).toHaveLength(0) // root has no descendants
  })

  it('inserts child and shows in parent subtree', async () => {
    const root = await createUser()
    const child = await createUser()

    const rootNode = ReferralNode.create({ userId: root.id, parentId: null, depth: 0 })
    await treeRepo.insertNode(rootNode)
    await ancestorsRepo.insertClosureForNewNode(root.id, null)

    const childNode = ReferralNode.create({ userId: child.id, parentId: root.id, depth: 1 })
    await treeRepo.insertNode(childNode)
    await ancestorsRepo.insertClosureForNewNode(child.id, root.id)

    const subtree = await ancestorsRepo.getSubtree(root.id)
    expect(subtree).toHaveLength(1)
    expect(subtree[0].userId).toBe(child.id.value)
    expect(subtree[0].depth).toBe(1)
  })

  it('isDescendant returns true for direct child', async () => {
    const root = await createUser()
    const child = await createUser()

    await treeRepo.insertNode(ReferralNode.create({ userId: root.id, parentId: null, depth: 0 }))
    await ancestorsRepo.insertClosureForNewNode(root.id, null)
    await treeRepo.insertNode(ReferralNode.create({ userId: child.id, parentId: root.id, depth: 1 }))
    await ancestorsRepo.insertClosureForNewNode(child.id, root.id)

    expect(await ancestorsRepo.isDescendant(root.id, child.id)).toBe(true)
    expect(await ancestorsRepo.isDescendant(child.id, root.id)).toBe(false)
  })

  it('getStatsByLevel returns correct counts', async () => {
    const root = await createUser()
    const child1 = await createUser()
    const child2 = await createUser()
    const grandchild = await createUser()

    await treeRepo.insertNode(ReferralNode.create({ userId: root.id, parentId: null, depth: 0 }))
    await ancestorsRepo.insertClosureForNewNode(root.id, null)
    await treeRepo.insertNode(ReferralNode.create({ userId: child1.id, parentId: root.id, depth: 1 }))
    await ancestorsRepo.insertClosureForNewNode(child1.id, root.id)
    await treeRepo.insertNode(ReferralNode.create({ userId: child2.id, parentId: root.id, depth: 1 }))
    await ancestorsRepo.insertClosureForNewNode(child2.id, root.id)
    await treeRepo.insertNode(ReferralNode.create({ userId: grandchild.id, parentId: child1.id, depth: 2 }))
    await ancestorsRepo.insertClosureForNewNode(grandchild.id, child1.id)

    const stats = await ancestorsRepo.getStatsByLevel(root.id)
    expect(stats).toEqual([
      { depth: 1, count: 2 },
      { depth: 2, count: 1 },
    ])
  })
})
