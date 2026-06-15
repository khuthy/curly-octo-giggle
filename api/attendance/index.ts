import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSql, initTables } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  await initTables();
  const sql = getSql();
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const rows = await sql`
    SELECT
      c.id        AS "childId",
      c.name      AS "childName",
      ${date}     AS date,
      a.time_in   AS "timeIn",
      a.signature_in  AS "signatureIn",
      a.time_out  AS "timeOut",
      a.signature_out AS "signatureOut",
      a.notes
    FROM children c
    LEFT JOIN attendance a ON a.child_id = c.id AND a.date = ${date}
    ORDER BY c.name
  `;

  return res.json(rows);
}
