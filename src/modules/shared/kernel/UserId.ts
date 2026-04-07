export class UserId {
  private constructor(readonly value: string) {}

  static create(value: string): UserId {
    if (!value || typeof value !== 'string') {
      throw new Error('UserId must be a non-empty string')
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      throw new Error(`Invalid UserId format: ${value}`)
    }
    return new UserId(value)
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
