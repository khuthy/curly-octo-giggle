import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDatabase } from './db/database';
import childrenRouter from './routes/children';
import attendanceRouter from './routes/attendance';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

initDatabase();

app.use('/api/children', childrenRouter);
app.use('/api/attendance', attendanceRouter);

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Crèche Attendance Server running on http://localhost:${PORT}`);
});
