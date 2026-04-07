import { nanoid } from 'nanoid'

export class ReferralCode {
  private static readonly LENGTH = 10
  private static readonly VALID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/

  private constructor(readonly value: string) {}

  static generate(): ReferralCode {
    return new ReferralCode(nanoid(ReferralCode.LENGTH))
  }

  static fromString(code: string): ReferralCode {
    if (!code || !ReferralCode.VALID_PATTERN.test(code)) {
      throw new Error(`Invalid referral code format: ${code}`)
    }
    return new ReferralCode(code)
  }

  equals(other: ReferralCode): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
