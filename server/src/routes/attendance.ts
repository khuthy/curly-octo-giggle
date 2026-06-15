import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const db = getDatabase();

  const records = db.prepare(`
    SELECT
      a.id,
      c.id as childId,
      c.name as childName,
      ? as date,
      a.time_in as timeIn,
      a.signature_in as signatureIn,
      a.time_out as timeOut,
      a.signature_out as signatureOut,
      a.notes
    FROM children c
    LEFT JOIN attendance a ON a.child_id = c.id AND a.date = ?
    ORDER BY c.name COLLATE NOCASE
  `).all(date, date);

  res.json(records);
});

router.get('/report', (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate are required' });
  }

  const db = getDatabase();
  const records = db.prepare(`
    SELECT
      a.id,
      a.child_id as childId,
      c.name as childName,
      a.date,
      a.time_in as timeIn,
      a.signature_in as signatureIn,
      a.time_out as timeOut,
      a.signature_out as signatureOut,
      a.notes
    FROM attendance a
    JOIN children c ON c.id = a.child_id
    WHERE a.date BETWEEN ? AND ?
    ORDER BY a.date DESC, c.name COLLATE NOCASE
  `).all(startDate, endDate);

  res.json(records);
});

router.post('/signin', (req: Request, res: Response) => {
  const { childId, date, signature } = req.body;

  if (!childId || !date) {
    return res.status(400).json({ error: 'childId and date are required' });
  }

  const timeIn = new Date().toTimeString().slice(0, 5);
  const db = getDatabase();

  db.prepare(`
    INSERT INTO attendance (child_id, date, time_in, signature_in)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(child_id, date) DO UPDATE SET
      time_in = excluded.time_in,
      signature_in = excluded.signature_in
  `).run(childId, date, timeIn, signature || null);

  const record = db.prepare(`
    SELECT
      a.id, c.id as childId, c.name as childName,
      a.date, a.time_in as timeIn, a.signature_in as signatureIn,
      a.time_out as timeOut, a.signature_out as signatureOut
    FROM attendance a JOIN children c ON c.id = a.child_id
    WHERE a.child_id = ? AND a.date = ?
  `).get(childId, date);

  res.json(record);
});

router.post('/signout', (req: Request, res: Response) => {
  const { childId, date, signature } = req.body;

  if (!childId || !date) {
    return res.status(400).json({ error: 'childId and date are required' });
  }

  const timeOut = new Date().toTimeString().slice(0, 5);
  const db = getDatabase();

  const result = db.prepare(`
    UPDATE attendance
    SET time_out = ?, signature_out = ?
    WHERE child_id = ? AND date = ?
  `).run(timeOut, signature || null, childId, date);

  if (result.changes === 0) {
    return res.status(400).json({ error: 'Child has not been signed in for this date' });
  }

  const record = db.prepare(`
    SELECT
      a.id, c.id as childId, c.name as childName,
      a.date, a.time_in as timeIn, a.signature_in as signatureIn,
      a.time_out as timeOut, a.signature_out as signatureOut
    FROM attendance a JOIN children c ON c.id = a.child_id
    WHERE a.child_id = ? AND a.date = ?
  `).get(childId, date);

  res.json(record);
});

export default router;
