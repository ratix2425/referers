import { Client } from 'pg'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

async function seed() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    const { rows } = await client.query(
      'SELECT id FROM users WHERE is_root = TRUE LIMIT 1'
    )

    if (rows.length > 0) {
      console.log('Root user already exists. Seed is idempotent — skipping.')
      return
    }

    const rootEmail = process.env.ROOT_EMAIL || 'root@referidos.local'
    const rootPassword = process.env.ROOT_PASSWORD || 'root-change-me'
    const passwordHash = await bcrypt.hash(rootPassword, 12)
    const referralCode = nanoid(10)

    const { rows: [rootUser] } = await client.query(
      `INSERT INTO users (email, password_hash, referral_code, is_root)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id`,
      [rootEmail, passwordHash, referralCode]
    )

    // El root no tiene padre: insertar solo la relación consigo mismo (depth=0)
    await client.query(
      'INSERT INTO referral_tree (user_id, parent_id) VALUES ($1, NULL)',
      [rootUser.id]
    )
    await client.query(
      'INSERT INTO referral_ancestors (ancestor_id, descendant_id, depth) VALUES ($1, $1, 0)',
      [rootUser.id]
    )

    console.log(`Root user created:`)
    console.log(`  Email:         ${rootEmail}`)
    console.log(`  Password:      ${rootPassword}`)
    console.log(`  Referral code: ${referralCode}`)
    console.log(`  User ID:       ${rootUser.id}`)
  } finally {
    await client.end()
  }
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
