import { describe, it, expect } from 'vitest'
import { Email } from '../value-objects/Email'

describe('Email', () => {
  it('creates a valid email and normalizes to lowercase', () => {
    const email = Email.create('User@Example.COM')
    expect(email.value).toBe('user@example.com')
  })

  it('trims whitespace', () => {
    const email = Email.create('  user@example.com  ')
    expect(email.value).toBe('user@example.com')
  })

  it('throws for empty string', () => {
    expect(() => Email.create('')).toThrow('Email must be a non-empty string')
  })

  it('throws for invalid format', () => {
    expect(() => Email.create('not-an-email')).toThrow('Invalid email format')
    expect(() => Email.create('@example.com')).toThrow('Invalid email format')
    expect(() => Email.create('user@')).toThrow('Invalid email format')
  })

  it('equals returns true for same email', () => {
    const a = Email.create('user@example.com')
    const b = Email.create('USER@EXAMPLE.COM')
    expect(a.equals(b)).toBe(true)
  })
})
