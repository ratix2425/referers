import { describe, it, expect } from 'vitest'
import { User } from '../entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../value-objects/Email'
import { PasswordHash } from '../value-objects/PasswordHash'
import { ReferralCode } from '../value-objects/ReferralCode'

async function buildUser(overrides?: Partial<Parameters<typeof User.create>[0]>) {
  const hash = await PasswordHash.fromPlainText('Password123')
  return User.create({
    id: UserId.create('550e8400-e29b-41d4-a716-446655440000'),
    email: Email.create('user@example.com'),
    passwordHash: hash,
    referralCode: ReferralCode.generate(),
    avatarUrl: null,
    isRoot: false,
    createdAt: new Date(),
    ...overrides,
  })
}

describe('User', () => {
  it('creates a user with all properties', async () => {
    const user = await buildUser()
    expect(user.email.value).toBe('user@example.com')
    expect(user.isRoot).toBe(false)
    expect(user.avatarUrl).toBeNull()
  })

  it('verifyPassword returns true for correct password', async () => {
    const user = await buildUser()
    expect(await user.verifyPassword('Password123')).toBe(true)
  })

  it('verifyPassword returns false for wrong password', async () => {
    const user = await buildUser()
    expect(await user.verifyPassword('WrongPassword')).toBe(false)
  })

  it('toJSON excludes passwordHash', async () => {
    const user = await buildUser()
    const json = user.toJSON()
    expect(json).not.toHaveProperty('passwordHash')
    expect(json).toHaveProperty('email', 'user@example.com')
  })
})
