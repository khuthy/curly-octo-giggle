import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, initTables } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initTables();
  const sql = getSql();

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM children ORDER BY name`;
    return res.json(rows);
  }

  if (req.method === 'POST') {
    const { name, date_of_birth, guardian_name, guardian_contact } = req.body as Record<string, string>;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const rows = await sql`
      INSERT INTO children (name, date_of_birth, guardian_name, guardian_contact)
      VALUES (${name.trim()}, ${date_of_birth || null}, ${guardian_name || null}, ${guardian_contact || null})
      RETURNING *
    `;
    return res.status(201).json(rows[0]);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}
