import { neon } from '@neondatabase/serverless';

export function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return neon(url);
}

export async function initTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS children (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      date_of_birth TEXT,
      guardian_name TEXT,
      guardian_contact TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      time_in TEXT,
      signature_in TEXT,
      time_out TEXT,
      signature_out TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(child_id, date)
    )
  `;
}
