import { User } from '../entities/User'
import { UserId } from '@/modules/shared/kernel/UserId'

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByReferralCode(code: string): Promise<User | null>
  save(user: User): Promise<void>
  exists(email: string): Promise<boolean>
}
