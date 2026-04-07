import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return new Pool({ connectionString, max: 10 })
}

// Singleton to avoid creating multiple pools in development (hot reload)
export const pool: Pool = global._pgPool ?? createPool()

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool
}
