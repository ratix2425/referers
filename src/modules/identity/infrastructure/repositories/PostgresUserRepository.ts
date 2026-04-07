import { Pool } from 'pg'
import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { User } from '../../domain/entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../../domain/value-objects/Email'
import { PasswordHash } from '../../domain/value-objects/PasswordHash'
import { ReferralCode } from '../../domain/value-objects/ReferralCode'

function rowToUser(row: Record<string, unknown>): User {
  return User.create({
    id: UserId.create(row.id as string),
    email: Email.create(row.email as string),
    passwordHash: PasswordHash.fromHash(row.password_hash as string),
    referralCode: ReferralCode.fromString(row.referral_code as string),
    avatarUrl: (row.avatar_url as string | null) ?? null,
    isRoot: row.is_root as boolean,
    createdAt: new Date(row.created_at as string),
  })
}

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: UserId): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id.value]
    )
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async findByReferralCode(code: string): Promise<User | null> {
    const { rows } = await this.pool.query(
      'SELECT * FROM users WHERE referral_code = $1',
      [code]
    )
    return rows[0] ? rowToUser(rows[0]) : null
  }

  async save(user: User): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, referral_code, avatar_url, is_root, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         avatar_url = EXCLUDED.avatar_url`,
      [
        user.id.value,
        user.email.value,
        user.passwordHash.value,
        user.referralCode.value,
        user.avatarUrl,
        user.isRoot,
        user.createdAt,
      ]
    )
  }

  async exists(email: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    )
    return rows.length > 0
  }
}
