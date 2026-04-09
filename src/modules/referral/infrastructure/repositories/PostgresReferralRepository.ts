import { Pool } from 'pg'
import { IReferralTreeRepository } from '../../domain/repositories/IReferralTreeRepository'
import { IReferralAncestorsRepository, LevelCount, NetworkNode } from '../../domain/repositories/IReferralAncestorsRepository'
import { ReferralNode } from '../../domain/entities/ReferralNode'
import { UserId } from '@/modules/shared/kernel/UserId'

export class PostgresReferralTreeRepository implements IReferralTreeRepository {
  constructor(private readonly pool: Pool) {}

  async insertNode(node: ReferralNode): Promise<void> {
    await this.pool.query(
      'INSERT INTO referral_tree (user_id, parent_id) VALUES ($1, $2)',
      [node.userId.value, node.parentId?.value ?? null]
    )
  }

  async findByUserId(userId: UserId): Promise<ReferralNode | null> {
    const { rows } = await this.pool.query(
      'SELECT rt.user_id, rt.parent_id, MAX(ra.depth) AS depth FROM referral_tree rt JOIN referral_ancestors ra ON ra.descendant_id = rt.user_id WHERE rt.user_id = $1 GROUP BY rt.user_id, rt.parent_id',
      [userId.value]
    )
    if (!rows[0]) return null
    return ReferralNode.create({
      userId: UserId.create(rows[0].user_id),
      parentId: rows[0].parent_id ? UserId.create(rows[0].parent_id) : null,
      depth: rows[0].depth,
    })
  }

  async countDirectChildren(userId: UserId): Promise<number> {
    const { rows } = await this.pool.query(
      'SELECT COUNT(*) as count FROM referral_tree WHERE parent_id = $1',
      [userId.value]
    )
    return parseInt(rows[0].count, 10)
  }
}

export class PostgresReferralAncestorsRepository implements IReferralAncestorsRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * Inserts closure table rows for a new node:
   * - Self-reference (ancestor=self, descendant=self, depth=0)
   * - For each ancestor of parent: (ancestor, newNode, parentDepth+1)
   */
  async insertClosureForNewNode(userId: UserId, parentId: UserId | null): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')

      // Self-reference
      await client.query(
        'INSERT INTO referral_ancestors (ancestor_id, descendant_id, depth) VALUES ($1, $1, 0)',
        [userId.value]
      )

      if (parentId) {
        // Copy all ancestor rows of parent, incrementing depth by 1
        await client.query(
          `INSERT INTO referral_ancestors (ancestor_id, descendant_id, depth)
           SELECT ancestor_id, $1, depth + 1
           FROM referral_ancestors
           WHERE descendant_id = $2`,
          [userId.value, parentId.value]
        )
      }

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  async isDescendant(ancestorId: UserId, targetId: UserId): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT 1 FROM referral_ancestors WHERE ancestor_id = $1 AND descendant_id = $2 AND depth > 0',
      [ancestorId.value, targetId.value]
    )
    return rows.length > 0
  }

  async getSubtree(userId: UserId): Promise<NetworkNode[]> {
    const { rows } = await this.pool.query(
      `SELECT
         ra.descendant_id AS user_id,
         rt.parent_id,
         ra.depth,
         u.email,
         u.referral_code,
         (SELECT COUNT(*) FROM referral_tree rt2 WHERE rt2.parent_id = ra.descendant_id) AS direct_children_count
       FROM referral_ancestors ra
       JOIN users u ON u.id = ra.descendant_id
       JOIN referral_tree rt ON rt.user_id = ra.descendant_id
       WHERE ra.ancestor_id = $1 AND ra.depth > 0
       ORDER BY ra.depth, u.created_at`,
      [userId.value]
    )
    return rows.map(r => ({
      userId: r.user_id,
      parentId: r.parent_id ?? null,
      depth: r.depth,
      email: r.email,
      referralCode: r.referral_code,
      directChildrenCount: parseInt(r.direct_children_count, 10),
    }))
  }

  async getStatsByLevel(userId: UserId): Promise<LevelCount[]> {
    const { rows } = await this.pool.query(
      `SELECT depth, COUNT(*) as count
       FROM referral_ancestors
       WHERE ancestor_id = $1 AND depth > 0
       GROUP BY depth
       ORDER BY depth`,
      [userId.value]
    )
    return rows.map(r => ({ depth: r.depth, count: parseInt(r.count, 10) }))
  }
}
