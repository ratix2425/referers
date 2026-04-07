export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    if (!raw || typeof raw !== 'string') {
      throw new Error('Email must be a non-empty string')
    }
    const trimmed = raw.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      throw new Error(`Invalid email format: ${raw}`)
    }
    return new Email(trimmed)
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
