import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, initTables } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await initTables();
  const sql = getSql();
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    const { name, date_of_birth, guardian_name, guardian_contact } = req.body as Record<string, string>;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    const rows = await sql`
      UPDATE children
      SET name = ${name.trim()},
          date_of_birth = ${date_of_birth || null},
          guardian_name = ${guardian_name || null},
          guardian_contact = ${guardian_contact || null}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Child not found' });
    return res.json(rows[0]);
  }

  if (req.method === 'DELETE') {
    const rows = await sql`DELETE FROM children WHERE id = ${id} RETURNING id`;
    if (rows.length === 0) return res.status(404).json({ error: 'Child not found' });
    return res.json({ success: true });
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return res.status(405).end();
}
