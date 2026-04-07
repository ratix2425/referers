import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../value-objects/Email'
import { PasswordHash } from '../value-objects/PasswordHash'
import { ReferralCode } from '../value-objects/ReferralCode'

export interface UserProps {
  id: UserId
  email: Email
  passwordHash: PasswordHash
  referralCode: ReferralCode
  avatarUrl: string | null
  isRoot: boolean
  createdAt: Date
}

export class User {
  readonly id: UserId
  readonly email: Email
  readonly passwordHash: PasswordHash
  readonly referralCode: ReferralCode
  readonly avatarUrl: string | null
  readonly isRoot: boolean
  readonly createdAt: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.email = props.email
    this.passwordHash = props.passwordHash
    this.referralCode = props.referralCode
    this.avatarUrl = props.avatarUrl
    this.isRoot = props.isRoot
    this.createdAt = props.createdAt
  }

  static create(props: UserProps): User {
    return new User(props)
  }

  async verifyPassword(plainText: string): Promise<boolean> {
    return this.passwordHash.compare(plainText)
  }

  toJSON() {
    return {
      id: this.id.value,
      email: this.email.value,
      referralCode: this.referralCode.value,
      avatarUrl: this.avatarUrl,
      isRoot: this.isRoot,
      createdAt: this.createdAt,
    }
  }
}
