import { Result } from '@/modules/shared/kernel/Result'
import { UserId } from '@/modules/shared/kernel/UserId'
import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { IReferralTreeRepository } from '@/modules/referral/domain/repositories/IReferralTreeRepository'
import { IReferralAncestorsRepository } from '@/modules/referral/domain/repositories/IReferralAncestorsRepository'
import { User } from '../../domain/entities/User'
import { Email } from '../../domain/value-objects/Email'
import { PasswordHash } from '../../domain/value-objects/PasswordHash'
import { ReferralCode } from '../../domain/value-objects/ReferralCode'
import { ReferralNode } from '@/modules/referral/domain/entities/ReferralNode'

const randomUUID = () => crypto.randomUUID()

export interface RegisterUserInput {
  email: string
  password: string
  referralCode: string
}

export interface RegisterUserOutput {
  userId: string
  referralCode: string
}

type RegisterError =
  | 'INVALID_REFERRAL_CODE'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'INVALID_PASSWORD'

export class RegisterUserViaReferral {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly treeRepo: IReferralTreeRepository,
    private readonly ancestorsRepo: IReferralAncestorsRepository
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput, RegisterError>> {
    // 1. Validate referral code
    const referrer = await this.userRepo.findByReferralCode(input.referralCode)
    if (!referrer) {
      return Result.err('INVALID_REFERRAL_CODE')
    }

    // 2. Check email uniqueness
    const emailExists = await this.userRepo.exists(input.email)
    if (emailExists) {
      return Result.err('EMAIL_ALREADY_EXISTS')
    }

    // 3. Create domain objects
    let email: Email
    try {
      email = Email.create(input.email)
    } catch {
      return Result.err('INVALID_EMAIL')
    }

    let passwordHash: PasswordHash
    try {
      passwordHash = await PasswordHash.fromPlainText(input.password)
    } catch {
      return Result.err('INVALID_PASSWORD')
    }

    const newUserId = UserId.create(randomUUID())
    const referralCode = ReferralCode.generate()

    const user = User.create({
      id: newUserId,
      email,
      passwordHash,
      referralCode,
      avatarUrl: null,
      isRoot: false,
      createdAt: new Date(),
    })

    // 4. Get referrer's depth in the tree
    const referrerNode = await this.treeRepo.findByUserId(referrer.id)
    const newDepth = referrerNode ? referrerNode.depth + 1 : 1

    const referralNode = ReferralNode.create({
      userId: newUserId,
      parentId: referrer.id,
      depth: newDepth,
    })

    // 5. Persist: user, tree adjacency, closure table
    await this.userRepo.save(user)
    await this.treeRepo.insertNode(referralNode)
    await this.ancestorsRepo.insertClosureForNewNode(newUserId, referrer.id)

    return Result.ok({
      userId: newUserId.value,
      referralCode: referralCode.value,
    })
  }
}
