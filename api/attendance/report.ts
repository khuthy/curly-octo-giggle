import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, initTables } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const { startDate, endDate } = req.query as { startDate: string; endDate: string };
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  await initTables();
  const sql = getSql();

  const rows = await sql`
    SELECT
      a.id,
      a.child_id  AS "childId",
      c.name      AS "childName",
      a.date,
      a.time_in   AS "timeIn",
      a.signature_in  AS "signatureIn",
      a.time_out  AS "timeOut",
      a.signature_out AS "signatureOut",
      a.notes
    FROM attendance a
    JOIN children c ON c.id = a.child_id
    WHERE a.date BETWEEN ${startDate} AND ${endDate}
    ORDER BY a.date DESC, c.name
  `;

  return res.json(rows);
}
