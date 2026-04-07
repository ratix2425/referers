/**
 * Integration test — requires a running PostgreSQL database.
 * Run with: DATABASE_URL=... npm test
 * Or via docker-compose: docker-compose up
 */
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { Pool } from 'pg'
import { PostgresUserRepository } from '../PostgresUserRepository'
import { User } from '../../../domain/entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../../../domain/value-objects/Email'
import { PasswordHash } from '../../../domain/value-objects/PasswordHash'
import { ReferralCode } from '../../../domain/value-objects/ReferralCode'
const randomUUID = () => crypto.randomUUID()

const DATABASE_URL = process.env.DATABASE_URL

describe.skipIf(!DATABASE_URL)('PostgresUserRepository (integration)', () => {
  let pool: Pool
  let repo: PostgresUserRepository

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL })
    repo = new PostgresUserRepository(pool)
  })

  afterAll(async () => {
    await pool.end()
  })

  afterEach(async () => {
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@test-integration.com'])
  })

  async function createTestUser(emailPrefix = 'user') {
    const hash = await PasswordHash.fromPlainText('Password123')
    const user = User.create({
      id: UserId.create(randomUUID()),
      email: Email.create(`${emailPrefix}-${Date.now()}@test-integration.com`),
      passwordHash: hash,
      referralCode: ReferralCode.generate(),
      avatarUrl: null,
      isRoot: false,
      createdAt: new Date(),
    })
    await repo.save(user)
    return user
  }

  it('saves and finds a user by id', async () => {
    const user = await createTestUser()
    const found = await repo.findById(user.id)
    expect(found).not.toBeNull()
    expect(found!.email.value).toBe(user.email.value)
  })

  it('finds user by email', async () => {
    const user = await createTestUser()
    const found = await repo.findByEmail(user.email.value)
    expect(found).not.toBeNull()
    expect(found!.id.value).toBe(user.id.value)
  })

  it('finds user by referral code', async () => {
    const user = await createTestUser()
    const found = await repo.findByReferralCode(user.referralCode.value)
    expect(found).not.toBeNull()
    expect(found!.id.value).toBe(user.id.value)
  })

  it('returns null for non-existent user', async () => {
    const result = await repo.findById(UserId.create(randomUUID()))
    expect(result).toBeNull()
  })

  it('exists returns true for registered email', async () => {
    const user = await createTestUser()
    expect(await repo.exists(user.email.value)).toBe(true)
  })

  it('exists returns false for unregistered email', async () => {
    expect(await repo.exists('nobody@test-integration.com')).toBe(false)
  })
})
