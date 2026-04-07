import { describe, it, expect } from 'vitest'
import { UserId } from '../UserId'

describe('UserId', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000'

  it('creates a valid UserId from a UUID string', () => {
    const id = UserId.create(validUuid)
    expect(id.value).toBe(validUuid)
  })

  it('throws for empty string', () => {
    expect(() => UserId.create('')).toThrow('UserId must be a non-empty string')
  })

  it('throws for non-UUID string', () => {
    expect(() => UserId.create('not-a-uuid')).toThrow('Invalid UserId format')
  })

  it('equals returns true for same value', () => {
    const a = UserId.create(validUuid)
    const b = UserId.create(validUuid)
    expect(a.equals(b)).toBe(true)
  })

  it('equals returns false for different values', () => {
    const a = UserId.create(validUuid)
    const b = UserId.create('660e8400-e29b-41d4-a716-446655440000')
    expect(a.equals(b)).toBe(false)
  })

  it('toString returns the UUID string', () => {
    const id = UserId.create(validUuid)
    expect(id.toString()).toBe(validUuid)
  })
})
