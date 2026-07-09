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
  const withDB = async (res: express.Response, callback: (conn: mysql.PoolConnection) => Promise<void>, fallbackData: any = { data: [] }) => {
    try {
      const conn = await pool.getConnection();
      try {
        await callback(conn);
      } finally {
        conn.release();
      }
    } catch (err: any) {
      console.error('Database Error:', err.message);
      // Return fallback data for the preview environment to prevent UI crashes
      res.json(fallbackData);
    }
  };

  // --- API Routes ---

  // Customers
  app.get('/api/customers', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM customers ORDER BY id DESC');
      res.json({ data: rows });
    }, { data: [{ id: 1, customer_number: 'CUST-MOCK', name: 'Preview Mode (No DB)', phone: '0000', status: 'active', connection_type: 'pppoe' }] });
  });

  app.post('/api/customers', (req, res) => {
    const data = req.body;
    withDB(res, async (conn) => {
      const [result] = await conn.query('INSERT INTO customers SET ?', [data]);
      res.json({ data: { ...data, id: (result as any).insertId } });
    }, { data: { ...data, id: Date.now() } });
  });

  app.put('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    withDB(res, async (conn) => {
      await conn.query('UPDATE customers SET ? WHERE id = ?', [data, id]);
      res.json({ data: { ...data, id: Number(id) } });
    }, { data: { ...data, id: Number(id) } });
  });

  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    withDB(res, async (conn) => {
      await conn.query('DELETE FROM customers WHERE id = ?', [id]);
      res.json({ success: true });
    }, { success: true });
  });

  // Routers
  app.get('/api/routers', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM routers ORDER BY id DESC');
      res.json({ data: rows });
    }, { data: [{ id: 1, name: 'Mock Router', ip_address: '192.168.1.1', api_username: 'admin', status: 'connected' }] });
  });

  app.post('/api/routers', (req, res) => {
    const data = req.body;
    withDB(res, async (conn) => {
      const [result] = await conn.query('INSERT INTO routers SET ?', [data]);
      res.json({ data: { ...data, id: (result as any).insertId } });
    }, { data: { ...data, id: Date.now() } });
  });

  app.put('/api/routers/:id', (req, res) => {
    const { id } = req.params;
    const data = req.body;
    withDB(res, async (conn) => {
      await conn.query('UPDATE routers SET ? WHERE id = ?', [data, id]);
      res.json({ data: { ...data, id: Number(id) } });
    }, { data: { ...data, id: Number(id) } });
  });

  app.delete('/api/routers/:id', (req, res) => {
    const { id } = req.params;
    withDB(res, async (conn) => {
      await conn.query('DELETE FROM routers WHERE id = ?', [id]);
      res.json({ success: true });
    }, { success: true });
  });

  // Invoices
  app.get('/api/invoices', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM invoices ORDER BY id DESC');
      res.json({ data: rows });
    }, { data: [{ id: 1, invoice_number: 'INV-MOCK-01', customer_name: 'Preview User', month: '2026-07', amount: 150000, status: 'paid', due_date: '2026-07-15' }] });
  });

  // Tickets
  app.get('/api/tickets', (req, res) => {
    withDB(res, async (conn) => {
      const [rows] = await conn.query('SELECT * FROM tickets ORDER BY id DESC');
      res.json({ data: rows });
    }, { data: [{ id: 1, ticket_number: 'TKT-MOCK-01', customer_name: 'Preview User', issue: 'Internet mati', status: 'open', priority: 'high', created_at: new Date().toISOString() }] });
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
