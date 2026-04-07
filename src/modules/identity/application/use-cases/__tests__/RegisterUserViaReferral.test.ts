import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RegisterUserViaReferral } from '../RegisterUserViaReferral'
import { IUserRepository } from '../../../domain/repositories/IUserRepository'
import { IReferralTreeRepository } from '@/modules/referral/domain/repositories/IReferralTreeRepository'
import { IReferralAncestorsRepository } from '@/modules/referral/domain/repositories/IReferralAncestorsRepository'
import { User } from '../../../domain/entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'
import { Email } from '../../../domain/value-objects/Email'
import { PasswordHash } from '../../../domain/value-objects/PasswordHash'
import { ReferralCode } from '../../../domain/value-objects/ReferralCode'
import { ReferralNode } from '@/modules/referral/domain/entities/ReferralNode'

async function makeReferrer(): Promise<User> {
  const hash = await PasswordHash.fromPlainText('Password123')
  return User.create({
    id: UserId.create('11111111-0000-0000-0000-000000000000'),
    email: Email.create('referrer@example.com'),
    passwordHash: hash,
    referralCode: ReferralCode.fromString('VALIDCODE1'),
    avatarUrl: null,
    isRoot: false,
    createdAt: new Date(),
  })
}

function makeRepos(referrer: User | null, emailExists = false) {
  const referrerNode = referrer
    ? ReferralNode.create({ userId: referrer.id, parentId: null, depth: 0 })
    : null

  const userRepo: IUserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    findByReferralCode: vi.fn().mockResolvedValue(referrer),
    save: vi.fn(),
    exists: vi.fn().mockResolvedValue(emailExists),
  }
  const treeRepo: IReferralTreeRepository = {
    insertNode: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue(referrerNode),
    countDirectChildren: vi.fn().mockResolvedValue(0),
  }
  const ancestorsRepo: IReferralAncestorsRepository = {
    insertClosureForNewNode: vi.fn(),
    isDescendant: vi.fn(),
    getSubtree: vi.fn(),
    getStatsByLevel: vi.fn(),
  }
  return { userRepo, treeRepo, ancestorsRepo }
}

describe('RegisterUserViaReferral', () => {
  it('registers a user with a valid referral code', async () => {
    const referrer = await makeReferrer()
    const { userRepo, treeRepo, ancestorsRepo } = makeRepos(referrer)
    const useCase = new RegisterUserViaReferral(userRepo, treeRepo, ancestorsRepo)

    const result = await useCase.execute({
      email: 'newuser@example.com',
      password: 'Password123',
      referralCode: 'VALIDCODE1',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.userId).toBeTruthy()
      expect(result.value.referralCode).toBeTruthy()
    }
    expect(userRepo.save).toHaveBeenCalledOnce()
    expect(treeRepo.insertNode).toHaveBeenCalledOnce()
    expect(ancestorsRepo.insertClosureForNewNode).toHaveBeenCalledOnce()
  })

  it('returns INVALID_REFERRAL_CODE for unknown code', async () => {
    const { userRepo, treeRepo, ancestorsRepo } = makeRepos(null)
    const useCase = new RegisterUserViaReferral(userRepo, treeRepo, ancestorsRepo)

    const result = await useCase.execute({
      email: 'newuser@example.com',
      password: 'Password123',
      referralCode: 'BADCODE',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('INVALID_REFERRAL_CODE')
    expect(userRepo.save).not.toHaveBeenCalled()
  })

  it('returns EMAIL_ALREADY_EXISTS for duplicate email', async () => {
    const referrer = await makeReferrer()
    const { userRepo, treeRepo, ancestorsRepo } = makeRepos(referrer, true)
    const useCase = new RegisterUserViaReferral(userRepo, treeRepo, ancestorsRepo)

    const result = await useCase.execute({
      email: 'existing@example.com',
      password: 'Password123',
      referralCode: 'VALIDCODE1',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('returns INVALID_PASSWORD for short password', async () => {
    const referrer = await makeReferrer()
    const { userRepo, treeRepo, ancestorsRepo } = makeRepos(referrer)
    const useCase = new RegisterUserViaReferral(userRepo, treeRepo, ancestorsRepo)

    const result = await useCase.execute({
      email: 'newuser@example.com',
      password: 'short',
      referralCode: 'VALIDCODE1',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('INVALID_PASSWORD')
  })
})
