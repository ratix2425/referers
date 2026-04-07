import { describe, it, expect } from 'vitest'
import { ReferralCode } from '../value-objects/ReferralCode'

describe('ReferralCode', () => {
  it('generates a code of length 10', () => {
    const code = ReferralCode.generate()
    expect(code.value).toHaveLength(10)
  })

  it('generated codes are unique', () => {
    const codes = new Set(Array.from({ length: 100 }, () => ReferralCode.generate().value))
    expect(codes.size).toBe(100)
  })

  it('creates from valid string', () => {
    const code = ReferralCode.fromString('ABC123xyz-')
    expect(code.value).toBe('ABC123xyz-')
  })

  it('throws for invalid format', () => {
    expect(() => ReferralCode.fromString('')).toThrow('Invalid referral code format')
    expect(() => ReferralCode.fromString('ab')).toThrow('Invalid referral code format')
  })

  it('equals returns true for same code', () => {
    const a = ReferralCode.fromString('ABCDE12345')
    const b = ReferralCode.fromString('ABCDE12345')
    expect(a.equals(b)).toBe(true)
  })
})
