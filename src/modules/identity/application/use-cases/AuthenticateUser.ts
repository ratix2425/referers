import { Result } from '@/modules/shared/kernel/Result'
import { IUserRepository } from '../../domain/repositories/IUserRepository'

export interface AuthenticateUserInput {
  email: string
  password: string
}

export interface AuthenticateUserOutput {
  userId: string
  email: string
  referralCode: string
  isRoot: boolean
}

export class AuthenticateUser {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(
    input: AuthenticateUserInput
  ): Promise<Result<AuthenticateUserOutput, 'INVALID_CREDENTIALS'>> {
    const user = await this.userRepo.findByEmail(input.email)
    if (!user) return Result.err('INVALID_CREDENTIALS')

    const valid = await user.verifyPassword(input.password)
    if (!valid) return Result.err('INVALID_CREDENTIALS')

    return Result.ok({
      userId: user.id.value,
      email: user.email.value,
      referralCode: user.referralCode.value,
      isRoot: user.isRoot,
    })
  }
}
