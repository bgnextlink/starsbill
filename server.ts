import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Create MySQL connection pool
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'starbilling',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Helper to handle DB errors gracefully
  const withDB = async (res: express.Response, callback: (conn: mysql.PoolConnection) => Promise<void>) => {
    try {
      const conn = await pool.getConnection();
      try {
        await callback(conn);
      } finally {
        conn.release();
      }
    } catch (err: any) {
      console.error('Database Error:', err);
      // Don't crash, just return 500 error, so frontend can show failure toast
      res.status(500).json({ error: 'Koneksi database gagal. Pastikan MySQL berjalan dan .env sudah dikonfigurasi.', details: err.message });
    }
  };

  // --- API Routes ---

  // Customers
  app.get('/api/customers', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM customers ORDER BY id DESC');
      res.json({ data: rows });
    });
  });

  app.post('/api/customers', (req, res) => {
    const data = req.body;
    withDB(res, async (conn) => {
      const [result] = await conn.query('INSERT INTO customers SET ?', [data]);
      res.json({ data: { ...data, id: (result as any).insertId } });
    });
  });

  app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    withDB(res, async (conn) => {
      await conn.query('UPDATE customers SET ? WHERE id = ?', [data, id]);
      res.json({ data: { ...data, id: Number(id) } });
    });
  });

  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    withDB(res, async (conn) => {
      await conn.query('DELETE FROM customers WHERE id = ?', [id]);
      res.json({ success: true });
    });
  });

  // Routers
  app.get('/api/routers', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM routers ORDER BY id DESC');
      res.json({ data: rows });
    });
  });

  app.post('/api/routers', (req, res) => {
    const data = req.body;
    withDB(res, async (conn) => {
      const [result] = await conn.query('INSERT INTO routers SET ?', [data]);
      res.json({ data: { ...data, id: (result as any).insertId } });
    });
  });

  app.put('/api/routers/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    withDB(res, async (conn) => {
      await conn.query('UPDATE routers SET ? WHERE id = ?', [data, id]);
      res.json({ data: { ...data, id: Number(id) } });
    });
  });

  app.delete('/api/routers/:id', (req, res) => {
    const { id } = req.params;
    withDB(res, async (conn) => {
      await conn.query('DELETE FROM routers WHERE id = ?', [id]);
      res.json({ success: true });
    });
  });

  // Invoices
  app.get('/api/invoices', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM invoices ORDER BY id DESC');
      res.json({ data: rows });
    });
  });

  // Tickets
  app.get('/api/tickets', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM tickets ORDER BY id DESC');
      res.json({ data: rows });
    });
  });

  // --- End API Routes ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
