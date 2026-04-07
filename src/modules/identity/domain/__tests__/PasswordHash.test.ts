import { describe, it, expect } from 'vitest'
import { PasswordHash } from '../value-objects/PasswordHash'

describe('PasswordHash', () => {
  it('hashes a plain text password', async () => {
    const hash = await PasswordHash.fromPlainText('SecurePass123')
    expect(hash.value).not.toBe('SecurePass123')
    expect(hash.value.startsWith('$2')).toBe(true)
  })

  it('throws for passwords shorter than 8 chars', async () => {
    await expect(PasswordHash.fromPlainText('short')).rejects.toThrow(
      'Password must be at least 8 characters'
    )
  })

  it('compare returns true for correct password', async () => {
    const hash = await PasswordHash.fromPlainText('SecurePass123')
    const match = await hash.compare('SecurePass123')
    expect(match).toBe(true)
  })

  it('compare returns false for wrong password', async () => {
    const hash = await PasswordHash.fromPlainText('SecurePass123')
    const match = await hash.compare('WrongPassword')
    expect(match).toBe(false)
  })

  it('creates from existing hash string', () => {
    const existing = '$2b$12$abcdefghijk'
    const hash = PasswordHash.fromHash(existing)
    expect(hash.value).toBe(existing)
  })
})
