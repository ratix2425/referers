import { describe, it, expect } from 'vitest'
import { Result } from '../Result'

describe('Result', () => {
  it('creates a success result with ok:true', () => {
    const result = Result.ok(42)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toBe(42)
  })

  it('creates an error result with ok:false', () => {
    const result = Result.err('Something went wrong')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('Something went wrong')
  })

  it('works with complex types', () => {
    const result = Result.ok({ id: '123', name: 'Test' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value.name).toBe('Test')
  })

  it('error result does not have value property accessible safely', () => {
    const result: ReturnType<typeof Result.err> = Result.err('error')
    expect(result.ok).toBe(false)
  })
})
