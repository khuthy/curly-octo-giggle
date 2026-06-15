import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDatabase();
  const children = db.prepare('SELECT * FROM children ORDER BY name COLLATE NOCASE').all();
  res.json(children);
});

router.post('/', (req: Request, res: Response) => {
  const { name, date_of_birth, guardian_name, guardian_contact } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    INSERT INTO children (name, date_of_birth, guardian_name, guardian_contact)
    VALUES (?, ?, ?, ?)
  `).run(name.trim(), date_of_birth || null, guardian_name || null, guardian_contact || null);

  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(child);
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, date_of_birth, guardian_name, guardian_contact } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const db = getDatabase();
  const result = db.prepare(`
    UPDATE children
    SET name = ?, date_of_birth = ?, guardian_name = ?, guardian_contact = ?
    WHERE id = ?
  `).run(name.trim(), date_of_birth || null, guardian_name || null, guardian_contact || null, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(id);
  res.json(child);
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const result = db.prepare('DELETE FROM children WHERE id = ?').run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Child not found' });
  }

  res.json({ success: true });
});

export default router;
