import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { AuthenticateUser } from '@/modules/identity/application/use-cases/AuthenticateUser'
import { userRepo } from '@/lib/db/repositories'
import { PostgresAdapter } from './pgAdapter'
import { pool } from '@/lib/db/pool'
import { authConfig } from './auth.config'

const authenticateUser = new AuthenticateUser(userRepo)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await authenticateUser.execute({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (!result.ok) return null

        return {
          id: result.value.userId,
          email: result.value.email,
          referralCode: result.value.referralCode,
          isRoot: result.value.isRoot,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.referralCode = (user as any).referralCode
        token.isRoot = (user as any).isRoot
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).referralCode = token.referralCode
        ;(session.user as any).isRoot = token.isRoot
      }
      return session
    },
  },
})
