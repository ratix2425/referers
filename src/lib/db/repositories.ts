import { pool } from './pool'
import { PostgresUserRepository } from '@/modules/identity/infrastructure/repositories/PostgresUserRepository'
import { PostgresReferralTreeRepository, PostgresReferralAncestorsRepository } from '@/modules/referral/infrastructure/repositories/PostgresReferralRepository'

export const userRepo = new PostgresUserRepository(pool)
export const referralTreeRepo = new PostgresReferralTreeRepository(pool)
export const referralAncestorsRepo = new PostgresReferralAncestorsRepository(pool)
