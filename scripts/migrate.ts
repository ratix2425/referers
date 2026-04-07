import { Client } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    // Tabla de control de migraciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const migrationsDir = join(__dirname, 'migrations')
    const files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      )
      if (rows.length > 0) {
        console.log(`Skipping ${file} (already applied)`)
        continue
      }

      const sql = readFileSync(join(migrationsDir, file), 'utf-8')
      await client.query(sql)
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file])
      console.log(`Applied ${file}`)
    }

    console.log('Migrations complete')
  } finally {
    await client.end()
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
