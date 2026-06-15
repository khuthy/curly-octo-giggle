import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, initTables } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { childId, date, signature } = req.body as { childId: number; date: string; signature: string };
  if (!childId || !date) return res.status(400).json({ error: 'childId and date are required' });

  await initTables();
  const sql = getSql();
  const timeIn = new Date().toTimeString().slice(0, 5);

  await sql`
    INSERT INTO attendance (child_id, date, time_in, signature_in)
    VALUES (${childId}, ${date}, ${timeIn}, ${signature || null})
    ON CONFLICT (child_id, date) DO UPDATE
      SET time_in = EXCLUDED.time_in,
          signature_in = EXCLUDED.signature_in
  `;

  const rows = await sql`
    SELECT
      a.id, c.id AS "childId", c.name AS "childName",
      a.date, a.time_in AS "timeIn", a.signature_in AS "signatureIn",
      a.time_out AS "timeOut", a.signature_out AS "signatureOut"
    FROM attendance a JOIN children c ON c.id = a.child_id
    WHERE a.child_id = ${childId} AND a.date = ${date}
  `;

  return res.json(rows[0]);
}
