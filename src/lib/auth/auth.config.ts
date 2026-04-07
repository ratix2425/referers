import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

// Edge-safe config: no pg, no Node.js-only imports.
// Used by middleware. The full auth (with adapter) is in auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize is not called in middleware — only the JWT/session is checked.
      // The real authorize lives in auth.ts.
      async authorize() {
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth
    },
  },
}
