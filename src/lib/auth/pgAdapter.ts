import type { Adapter } from 'next-auth/adapters'
import { Pool } from 'pg'
const randomUUID = () => crypto.randomUUID()

export function PostgresAdapter(pool: Pool): Adapter {
  return {
    async createUser(user) {
      // Users are created via RegisterUserViaReferral use case, not NextAuth
      // This is called only for OAuth providers — credentials users pre-exist
      throw new Error('Direct user creation via OAuth not supported. Use referral registration.')
    },

    async getUser(id) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
      if (!rows[0]) return null
      return { id: rows[0].id, email: rows[0].email, emailVerified: null, name: rows[0].email }
    },

    async getUserByEmail(email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()])
      if (!rows[0]) return null
      return { id: rows[0].id, email: rows[0].email, emailVerified: null, name: rows[0].email }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const { rows } = await pool.query(
        'SELECT u.* FROM users u JOIN accounts a ON a.user_id = u.id WHERE a.provider = $1 AND a.provider_account_id = $2',
        [provider, providerAccountId]
      )
      if (!rows[0]) return null
      return { id: rows[0].id, email: rows[0].email, emailVerified: null, name: rows[0].email }
    },

    async updateUser(user) {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [user.id])
      return { id: rows[0].id, email: rows[0].email, emailVerified: null, name: rows[0].email }
    },

    async createSession({ sessionToken, userId, expires }) {
      const id = randomUUID()
      await pool.query(
        'INSERT INTO sessions (id, session_token, user_id, expires) VALUES ($1, $2, $3, $4)',
        [id, sessionToken, userId, expires]
      )
      return { sessionToken, userId, expires }
    },

    async getSessionAndUser(sessionToken) {
      const { rows } = await pool.query(
        `SELECT s.session_token, s.user_id, s.expires, u.id, u.email, u.is_root
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.session_token = $1 AND s.expires > NOW()`,
        [sessionToken]
      )
      if (!rows[0]) return null
      return {
        session: {
          sessionToken: rows[0].session_token,
          userId: rows[0].user_id,
          expires: rows[0].expires,
        },
        user: {
          id: rows[0].id,
          email: rows[0].email,
          emailVerified: null,
          name: rows[0].email,
          isRoot: rows[0].is_root,
        },
      }
    },

    async updateSession({ sessionToken, expires }) {
      await pool.query(
        'UPDATE sessions SET expires = $1 WHERE session_token = $2',
        [expires, sessionToken]
      )
      const { rows } = await pool.query('SELECT * FROM sessions WHERE session_token = $1', [sessionToken])
      return { sessionToken: rows[0].session_token, userId: rows[0].user_id, expires: rows[0].expires }
    },

    async deleteSession(sessionToken) {
      await pool.query('DELETE FROM sessions WHERE session_token = $1', [sessionToken])
    },

    async linkAccount(account) {
      const id = randomUUID()
      await pool.query(
        `INSERT INTO accounts (id, user_id, type, provider, provider_account_id, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [id, account.userId, account.type, account.provider, account.providerAccountId,
         account.refresh_token, account.access_token, account.expires_at,
         account.token_type, account.scope, account.id_token, account.session_state]
      )
    },

    async createVerificationToken({ identifier, expires, token }) {
      await pool.query(
        'INSERT INTO verification_tokens (identifier, token, expires) VALUES ($1,$2,$3)',
        [identifier, token, expires]
      )
      return { identifier, token, expires }
    },

    async useVerificationToken({ identifier, token }) {
      const { rows } = await pool.query(
        'DELETE FROM verification_tokens WHERE identifier = $1 AND token = $2 RETURNING *',
        [identifier, token]
      )
      if (!rows[0]) return null
      return { identifier: rows[0].identifier, token: rows[0].token, expires: rows[0].expires }
    },
  }
}
