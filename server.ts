import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('rupeeflow.db');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT,
    amount REAL,
    type TEXT,
    category TEXT,
    date TEXT,
    note TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

export const app = express();
app.use(express.json());
app.use(cookieParser());

// Middleware to protect routes
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, username, password) VALUES (?, ?, ?)').run(userId, username, hashedPassword);
    
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: userId, username } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ user: { id: user.id, username: user.username } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticate, (req: any, res) => {
  const transactions = db.prepare('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC').all(req.user.id);
  res.json(transactions);
});

app.post('/api/transactions', authenticate, (req: any, res) => {
  const { title, amount, type, category, date, note } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO transactions (id, userId, title, amount, type, category, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, amount, type, category, date, note || '');
  res.json({ id, title, amount, type, category, date, note });
});

app.put('/api/transactions/:id', authenticate, (req: any, res) => {
  const { title, amount, type, category, date, note } = req.body;
  const result = db.prepare('UPDATE transactions SET title = ?, amount = ?, type = ?, category = ?, date = ?, note = ? WHERE id = ? AND userId = ?')
    .run(title, amount, type, category, date, note || '', req.params.id, req.user.id);
  
  if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

app.delete('/api/transactions/:id', authenticate, (req: any, res) => {
  const result = db.prepare('DELETE FROM transactions WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

app.delete('/api/transactions', authenticate, (req: any, res) => {
  db.prepare('DELETE FROM transactions WHERE userId = ?').run(req.user.id);
  res.json({ success: true });
});

// Vite Integration
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL === undefined) {
  // only apply vite middleware when running locally via "npm run dev" or similar
  (async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })();
} else {
  // production on Vercel: static assets served by platform via routes
  const staticDir = path.join(process.cwd(), 'dist');
  app.use(express.static(staticDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

export default app;
