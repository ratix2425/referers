import bcrypt from 'bcryptjs'

export class PasswordHash {
  private constructor(readonly value: string) {}

  static fromHash(hash: string): PasswordHash {
    if (!hash) throw new Error('PasswordHash cannot be empty')
    return new PasswordHash(hash)
  }

  static async fromPlainText(plainText: string): Promise<PasswordHash> {
    if (!plainText || plainText.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
    const hash = await bcrypt.hash(plainText, 12)
    return new PasswordHash(hash)
  }

  async compare(plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, this.value)
  }

  toString(): string {
    return this.value
  }
}
